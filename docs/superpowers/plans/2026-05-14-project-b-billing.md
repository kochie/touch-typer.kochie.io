# Project B — Billing & Account Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild billing and account flows on Touch Typer — working Stripe Custom Checkout, state-aware `/account`, site-wide past-due banner with transactional email, MAS detection. Per the spec at `docs/superpowers/specs/2026-05-14-project-b-billing-design.md`.

**Architecture:** Cross-repo: website (`touch-typer.kochie.io` on `website-rebuild` branch) + backend (`touch-type-backend` on a new `feature/project-b-billing` branch based on the already-pushed `fix/billing-quick-wins`). Backend foundation (state module, idempotency, cross-env wrapper, email helper) ships first; modified edge functions next; DB view + new edge functions; then website client work. Sync Engine continues to own the `subscriptions` table; the new `stripe-webhook` is thin and only triggers Resend emails. ~38 atomic commits.

**Tech Stack:** Backend: Deno (Supabase edge functions), `npm:stripe`, `npm:resend`, Postgres. Website: Next 16, React 19, Tailwind v4, `@stripe/react-stripe-js` (Stripe Custom Checkout), `next-themes`, FontAwesome Pro, Supabase JS/SSR.

---

## Preconditions

- [ ] **P1:** Confirm working state for both repos.

```bash
cd /Users/kochie/projects/touch-typer/touch-typer.kochie.io
git branch --show-current && git status --short

cd /Users/kochie/projects/touch-typer/touch-type-backend
git branch --show-current && git status --short
git fetch origin
```

Expected (website): on `website-rebuild`, working tree may have local-only artifacts (.env.local, .superpowers/, etc.) — those are fine. No tracked pending changes.

Expected (backend): on `main`, working tree may have local WIP — leave it alone. The remote `fix/billing-quick-wins` branch is pushed and is the base for our new feature branch.

- [ ] **P2:** Create the backend feature branch as a worktree (avoids disturbing user's local WIP on the backend's main checkout).

```bash
cd /Users/kochie/projects/touch-typer/touch-type-backend
mkdir -p .worktrees
git worktree add -b feature/project-b-billing .worktrees/project-b-billing origin/fix/billing-quick-wins
```

(`.worktrees/` is already in the backend's `.gitignore` from the quick-wins work.)

Throughout the backend tasks below, work from `/Users/kochie/projects/touch-typer/touch-type-backend/.worktrees/project-b-billing`. Throughout the website tasks, work from `/Users/kochie/projects/touch-typer/touch-typer.kochie.io`.

- [ ] **P3:** Set required env secrets in Supabase.

In the Supabase dashboard for the production project:
- Set `RESEND_API_KEY` (sign up at resend.com if not already; use a test API key initially)
- Set `STRIPE_WEBHOOK_SECRET` — placeholder for now; we configure the actual value in Task 38 after the webhook function is deployed and Stripe dashboard is configured.

For local dev (`supabase functions serve`), use `supabase/functions/.env` with the same keys.

---

## Phase 1 — Backend foundation

### Task 1: `_shared/subscription-state.ts`

**Working dir:** `/Users/kochie/projects/touch-typer/touch-type-backend/.worktrees/project-b-billing`

**Files:**
- Create: `supabase/functions/_shared/subscription-state.ts`

- [ ] **Step 1: Create the file**

```typescript
import type Stripe from 'npm:stripe';

export type SubscriptionStatus =
  | 'free'
  | 'pending'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired';

export type BillingService = 'STRIPE' | 'APPLE' | null;

export interface SubscriptionRow {
  user_id: string;
  billing_plan: 'free' | 'premium';
  billing_period: string | null;
  status: SubscriptionStatus;
  billing_service: BillingService;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  next_billing_date: string | null;
  auto_renew: boolean;
  payment_status: string | null;
  session_id: string | null;
  updated_at: string;
}

/**
 * Maps a Stripe Subscription's status (plus the cancel_at_period_end flag)
 * to our canonical SubscriptionStatus. This is the SINGLE place that
 * interprets Stripe's status semantics. Every edge function that writes
 * `subscriptions.status` should go through this function.
 */
export function mapStripeStatus(s: Stripe.Subscription): SubscriptionStatus {
  // cancel_at_period_end overrides for active/trialing — user has chosen to leave
  if (s.cancel_at_period_end && (s.status === 'active' || s.status === 'trialing')) {
    return 'canceled';
  }
  switch (s.status) {
    case 'trialing': return 'trialing';
    case 'active': return 'active';
    case 'past_due': return 'past_due';
    case 'paused': return 'past_due'; // treat pause as past_due for UI purposes
    case 'unpaid':
    case 'canceled':
    case 'incomplete_expired': return 'expired';
    case 'incomplete': return 'pending';
    default: return 'expired';
  }
}

export function billingPlanFor(status: SubscriptionStatus): 'free' | 'premium' {
  if (status === 'free' || status === 'pending' || status === 'expired') return 'free';
  return 'premium';
}

const TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  free: ['pending', 'trialing', 'active'],
  pending: ['trialing', 'active', 'free'],
  trialing: ['active', 'canceled', 'expired', 'past_due'],
  active: ['canceled', 'past_due', 'expired'],
  past_due: ['active', 'expired', 'canceled'],
  canceled: ['active', 'trialing', 'expired'],
  expired: ['pending', 'trialing', 'active'],
};

export function assertTransition(prev: SubscriptionStatus, next: SubscriptionStatus): void {
  if (prev === next) return;
  if (!TRANSITIONS[prev]?.includes(next)) {
    console.warn(`subscription-state: invalid transition ${prev} → ${next}`);
    // Don't throw — Sync Engine pushes through whatever Stripe sends.
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/_shared/subscription-state.ts
git commit -m "feat(billing): subscription state module — canonical statuses + Stripe status mapper"
```

---

### Task 2: Resend dep + `_shared/email.ts`

**Files:**
- Create: `supabase/functions/_shared/email.ts`

Deno functions don't use a package.json for `npm:` imports — they reference via `npm:resend` directly.

- [ ] **Step 1: Create the email helper**

```typescript
import { Resend } from 'npm:resend@^4.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_ADDRESS = Deno.env.get('EMAIL_FROM') ?? 'Touch Typer <hello@touch-typer.kochie.io>';

let resendClient: Resend | null = null;
function client(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<void> {
  try {
    const { error } = await client().emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) {
      console.error('email send failed', { to, subject, error });
    }
  } catch (err) {
    // Email failure must not break the webhook handler.
    console.error('email send threw', { to, subject, err: String(err) });
  }
}

/** Tiny {{var}} substitution. Use plain HTML strings as templates. */
export function fillTemplate(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, escapeHtml(v)),
    html,
  );
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/_shared/email.ts
git commit -m "feat(email): Resend wrapper + fillTemplate helper"
```

---

### Task 3: Email templates

**Files:**
- Create: `supabase/functions/_shared/email-templates/trial-ending.html`
- Create: `supabase/functions/_shared/email-templates/payment-failed.html`
- Create: `supabase/functions/_shared/email-templates/subscription-canceled.html`

Three plain HTML files using `{{variable}}` placeholders. Inline styles only (most email clients strip `<style>` blocks).

- [ ] **Step 1: Create `trial-ending.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Your trial ends soon</title></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f1115;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fafaf9;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#ffffff;border:1px solid #e5e5e0;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;font-weight:600;">Touch Typer</p>
          <h1 style="margin:8px 0 16px;font-size:24px;line-height:1.3;font-weight:600;">Your trial ends in {{daysLeft}} days</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">Hi {{firstName}},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">Your 7-day free trial of Touch Typer Premium ends on <strong>{{trialEndDate}}</strong>. After that, your card will be charged $2.99/month unless you cancel.</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#1f232b;">You're keeping the daily streak alive nicely. Curious whether you want to keep going past the trial?</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td><a href="{{continueUrl}}" style="display:inline-block;background:#2d85d2;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">Manage subscription</a></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;color:#6b7280;font-size:12px;line-height:1.5;">
          <p style="margin:0;">You're receiving this because you started a free trial. Manage emails in your account.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 2: Create `payment-failed.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Payment failed</title></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f1115;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fafaf9;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#ffffff;border:1px solid #e5e5e0;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#dc2626;font-weight:600;">Touch Typer · Payment Failed</p>
          <h1 style="margin:8px 0 16px;font-size:24px;line-height:1.3;font-weight:600;">We couldn't charge your card</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">Hi {{firstName}},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">We tried to renew your Touch Typer Premium subscription but the payment was declined. Stripe will automatically retry on <strong>{{retryDate}}</strong>.</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#1f232b;">If you'd like to update your payment method now, you can do that in your account.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td><a href="{{updateUrl}}" style="display:inline-block;background:#0f1115;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;margin-right:8px;">Update payment</a><a href="{{invoiceUrl}}" style="display:inline-block;color:#2d85d2;padding:12px 0;text-decoration:underline;font-weight:500;font-size:14px;">View invoice</a></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;color:#6b7280;font-size:12px;line-height:1.5;">
          <p style="margin:0;">Your Premium access will remain active during retries. If all retries fail, your subscription will be paused.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 3: Create `subscription-canceled.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Subscription ended</title></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f1115;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fafaf9;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#ffffff;border:1px solid #e5e5e0;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;font-weight:600;">Touch Typer</p>
          <h1 style="margin:8px 0 16px;font-size:24px;line-height:1.3;font-weight:600;">Your subscription has ended</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">Hi {{firstName}},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1f232b;">Your Touch Typer Premium subscription ended today. Your account is back on the Free plan — you keep your streaks, history, and basic features.</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#1f232b;">If you want AI Coach, custom drills, and weekly streak freezes back, you can resubscribe any time.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td><a href="{{resubscribeUrl}}" style="display:inline-block;background:#2d85d2;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">Resubscribe</a></td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/email-templates/
git commit -m "feat(email): three transactional HTML templates (trial-ending, payment-failed, canceled)"
```

---

### Task 4: Idempotency helper + cross-env wrapper in `_shared/stripe.ts`

**Files:**
- Modify: `supabase/functions/_shared/stripe.ts`

- [ ] **Step 1: Read existing file**

```bash
cat supabase/functions/_shared/stripe.ts
```

Note the existing `getStripeClient`, `createCheckoutSession`, `retrieveSubscription`, etc. signatures.

- [ ] **Step 2: Add idempotency helper + cross-env wrapper at the top of the file (after imports)**

Append to the file (after the existing exports, OR insert after the imports — match repo style):

```typescript
/**
 * Builds an idempotency key scoped to a user + intent + time bucket.
 * Same user clicking "Start trial" twice within an hour gets the same key
 * (Stripe returns the cached result). After an hour, fresh attempts get
 * a new key — appropriate for retry-after-failure.
 */
export function idempotencyKey(parts: { userId: string; intent: string; bucketHours?: number }): string {
  const bucket = parts.bucketHours ?? 1;
  const bucketIndex = Math.floor(Date.now() / (bucket * 60 * 60 * 1000));
  return `${parts.userId}:${parts.intent}:${bucketIndex}`;
}

/**
 * Wraps a Stripe.subscriptions.retrieve / .update call so a "resource_missing"
 * (subscription ID is stale — belongs to a different Stripe environment) is
 * caught and the caller can react by clearing the stale ID from the DB.
 *
 * Returns the Stripe subscription on success, null if it's stale-and-missing,
 * and rethrows any other error.
 */
export async function tryWithCrossEnv<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err: unknown) {
    const e = err as { code?: string; type?: string };
    if (e?.code === 'resource_missing' || e?.type === 'StripeInvalidRequestError') {
      console.warn('stripe: stale resource — caller should clear stripe_subscription_id', err);
      return null;
    }
    throw err;
  }
}
```

- [ ] **Step 3: Type-check / smoke compile (Deno)**

```bash
deno check supabase/functions/_shared/stripe.ts
```

Expected: no errors. If `deno check` is not configured in this repo's tooling, skip and rely on the function-level type-checks during deploy.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/stripe.ts
git commit -m "feat(stripe): add idempotencyKey helper + tryWithCrossEnv wrapper"
```

---

## Phase 2 — Backend DB

### Task 5: `subscriptions_resolved` view migration

**Files:**
- Create: `supabase/migrations/20260514120000_subscriptions_resolved_view.sql`

- [ ] **Step 1: Read existing `subscriptions` table schema**

```bash
ls supabase/migrations/ | grep -i subscription | head -5
# Pick the most recent and read its CREATE TABLE for subscriptions
cat supabase/migrations/<file_with_subscriptions_create>.sql | grep -A 30 "subscriptions"
```

Note the column names. The view definition below assumes the columns described in the spec; adjust if real schema differs.

- [ ] **Step 2: Create the migration**

```sql
-- 20260514120000_subscriptions_resolved_view.sql
-- A read-only view over `subscriptions` that exposes derived fields the
-- frontend needs. RLS inherits from the base table.

CREATE OR REPLACE VIEW public.subscriptions_resolved AS
SELECT
  s.*,
  s.status IN ('trialing', 'active', 'canceled')          AS is_premium,
  s.status = 'trialing'                                    AS is_in_trial,
  s.status = 'past_due'                                    AS is_past_due,
  s.status = 'canceled'                                    AS is_canceled,
  CASE
    WHEN s.status IN ('trialing', 'canceled') THEN s.next_billing_date
    WHEN s.status = 'active' THEN s.next_billing_date
    ELSE NULL
  END                                                      AS effective_end_date,
  CASE
    WHEN s.billing_period LIKE '%yearly%' THEN 'yearly'
    WHEN s.billing_period LIKE '%monthly%' THEN 'monthly'
    ELSE NULL
  END                                                      AS display_billing_period
FROM public.subscriptions s;

-- View inherits RLS from `subscriptions` automatically.
GRANT SELECT ON public.subscriptions_resolved TO authenticated;
GRANT SELECT ON public.subscriptions_resolved TO anon;

COMMENT ON VIEW public.subscriptions_resolved IS
  'Derived flags + computed dates for UI display. RLS inherited from subscriptions.';
```

- [ ] **Step 3: Apply locally to verify**

```bash
supabase db reset 2>&1 | tail -20
# Or apply just this migration:
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" -f supabase/migrations/20260514120000_subscriptions_resolved_view.sql
```

Then query to verify:

```bash
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" -c "SELECT * FROM public.subscriptions_resolved LIMIT 1;"
```

Expected: query succeeds (may return 0 rows if no subscriptions in local DB; that's fine).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260514120000_subscriptions_resolved_view.sql
git commit -m "feat(db): subscriptions_resolved view with is_premium/is_in_trial/is_past_due/effective_end_date"
```

---

## Phase 3 — Backend new functions

### Task 6: `list-prices` edge function

**Files:**
- Create: `supabase/functions/list-prices/index.ts`
- Modify: `supabase/config.toml` (add `verify_jwt = false` for `list-prices`)

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/list-prices/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getStripeClient } from '../_shared/stripe.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface PriceOut {
  lookup_key: string;
  id: string;
  unit_amount: number | null;
  currency: string;
  interval: string | null;
  interval_count: number | null;
  product_name: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; key: string; data: PriceOut[] } | null = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let lookupKeys: string[] = [];
  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    lookupKeys = Array.isArray(body.lookup_keys) ? body.lookup_keys : [];
  } else {
    const url = new URL(req.url);
    const qp = url.searchParams.get('lookup_keys');
    lookupKeys = qp ? qp.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  if (lookupKeys.length === 0) {
    return new Response(JSON.stringify({ error: 'lookup_keys required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const cacheKey = lookupKeys.slice().sort().join(',');
  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_TTL_MS) {
    return new Response(JSON.stringify({ prices: cache.data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const stripe = getStripeClient();
    const prices = await stripe.prices.list({
      lookup_keys: lookupKeys,
      expand: ['data.product'],
      active: true,
    });

    const data: PriceOut[] = prices.data.map((p) => ({
      lookup_key: p.lookup_key ?? '',
      id: p.id,
      unit_amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval ?? null,
      interval_count: p.recurring?.interval_count ?? null,
      product_name: typeof p.product === 'object' && p.product && 'name' in p.product
        ? (p.product as { name: string }).name
        : 'Premium',
    }));

    cache = { at: Date.now(), key: cacheKey, data };

    return new Response(JSON.stringify({ prices: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('list-prices error', err);
    return new Response(JSON.stringify({ error: 'list-prices-failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

- [ ] **Step 2: Add `verify_jwt = false` for `list-prices` in `supabase/config.toml`**

Append (or merge into) the existing config:

```toml
[functions.list-prices]
verify_jwt = false
```

- [ ] **Step 3: Smoke-test locally**

```bash
supabase functions serve list-prices --no-verify-jwt 2>&1 &
sleep 2
curl -X POST http://127.0.0.1:54321/functions/v1/list-prices \
  -H "Content-Type: application/json" \
  -d '{"lookup_keys":["premium_monthly","premium_yearly"]}'
kill %1
```

Expected: 200 JSON with a `prices` array (may be empty if those keys aren't in Stripe test mode — that's a config gap, not a code bug).

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/list-prices supabase/config.toml
git commit -m "feat(list-prices): public edge function returning Stripe prices by lookup_key"
```

---

### Task 7: `stripe-webhook` edge function (thin, email triggers)

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`
- Modify: `supabase/config.toml` (add `verify_jwt = false` for `stripe-webhook`)

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'npm:stripe@^16.0.0';
import { getStripeClient } from '../_shared/stripe.ts';
import { getServiceSupabaseClient } from '../_shared/supabase.ts';
import { sendEmail, fillTemplate } from '../_shared/email.ts';
import trialEndingTemplate from '../_shared/email-templates/trial-ending.html' with { type: 'text' };
import paymentFailedTemplate from '../_shared/email-templates/payment-failed.html' with { type: 'text' };
import canceledTemplate from '../_shared/email-templates/subscription-canceled.html' with { type: 'text' };

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://touch-typer.kochie.io';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!WEBHOOK_SECRET) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET not set');
    return new Response('webhook not configured', { status: 500 });
  }

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    return new Response('missing Stripe-Signature header', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await getStripeClient().webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('stripe-webhook: signature verification failed', err);
    return new Response('signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      // All other events: Sync Engine handles the table update. Nothing to do here.
      default:
        console.log('stripe-webhook: ignoring event', event.type);
    }
  } catch (err) {
    console.error('stripe-webhook: handler error', { eventType: event.type, err });
    // Stripe expects 2xx; if we return 5xx Stripe will retry. For email
    // failures we don't want infinite retries — log and ack.
  }

  return new Response('ok', { status: 200 });
});

async function lookupUserByCustomer(customerId: string): Promise<{ email: string; firstName: string } | null> {
  const supabase = getServiceSupabaseClient();
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (!sub?.user_id) return null;
  const { data: { user } } = await supabase.auth.admin.getUserById(sub.user_id);
  if (!user?.email) return null;
  const firstName = ((user.user_metadata?.full_name as string | undefined)?.split(' ')[0])
    ?? (user.email.split('@')[0]);
  return { email: user.email, firstName };
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;
  const u = await lookupUserByCustomer(customerId);
  if (!u) return;

  const retryDate = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : 'soon';

  const html = fillTemplate(paymentFailedTemplate, {
    firstName: u.firstName,
    retryDate,
    updateUrl: `${SITE_URL}/account#recover`,
    invoiceUrl: invoice.hosted_invoice_url ?? `${SITE_URL}/account`,
  });

  await sendEmail({ to: u.email, subject: "We couldn't charge your card", html });
}

async function handleTrialWillEnd(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customerId) return;
  const u = await lookupUserByCustomer(customerId);
  if (!u) return;

  const trialEndDate = sub.trial_end
    ? new Date(sub.trial_end * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : 'soon';
  // trial_will_end fires 3 days before; show that explicitly.
  const daysLeft = '3';

  const html = fillTemplate(trialEndingTemplate, {
    firstName: u.firstName,
    daysLeft,
    trialEndDate,
    continueUrl: `${SITE_URL}/account`,
  });

  await sendEmail({ to: u.email, subject: 'Your Touch Typer trial ends in 3 days', html });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customerId) return;
  const u = await lookupUserByCustomer(customerId);
  if (!u) return;

  const html = fillTemplate(canceledTemplate, {
    firstName: u.firstName,
    resubscribeUrl: `${SITE_URL}/buy/plans`,
  });

  await sendEmail({ to: u.email, subject: 'Your Touch Typer subscription has ended', html });
}
```

If `_shared/supabase.ts` doesn't export `getServiceSupabaseClient`, check what server-side helper exists. If only `getSupabaseClient(req)` (request-scoped, auth context) exists, add a service-role variant:

```typescript
// supabase/functions/_shared/supabase.ts (append if not present)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getServiceSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}
```

- [ ] **Step 2: Add `verify_jwt = false` for `stripe-webhook` in `supabase/config.toml`**

```toml
[functions.stripe-webhook]
verify_jwt = false
```

- [ ] **Step 3: Local smoke test using Stripe CLI**

```bash
# In one terminal:
supabase functions serve stripe-webhook --no-verify-jwt

# In another terminal, with Stripe CLI authenticated:
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
# Note the webhook signing secret it prints; export it for the function:
export STRIPE_WEBHOOK_SECRET=whsec_...

# Trigger a test event:
stripe trigger invoice.payment_failed
```

Expected: function logs receipt of event and (if Resend is keyed) sends a test email. Resend test mode logs the send without actually delivering.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/stripe-webhook supabase/functions/_shared/supabase.ts supabase/config.toml
git commit -m "feat(stripe-webhook): thin webhook for payment_failed/trial_will_end/canceled email triggers"
```

---

## Phase 4 — Backend modified functions

### Task 8: `create-checkout-session` updates

**Files:**
- Modify: `supabase/functions/create-checkout-session/index.ts`
- Likely Modify: `supabase/functions/_shared/stripe.ts` (the `createCheckoutSession` helper, if one exists)

- [ ] **Step 1: Read the current function and the helper**

```bash
cat supabase/functions/create-checkout-session/index.ts
cat supabase/functions/_shared/stripe.ts | grep -A 40 "createCheckoutSession\|checkout.sessions.create"
```

- [ ] **Step 2: Update the function to:**

1. Accept `lookup_key: string` from the request body (no `theme` — Custom Checkout sets appearance client-side via the React provider's `elementsOptions.appearance`)
2. Pass `customer_email: user.email` to the Stripe session
3. Set `payment_method_collection: 'always'` (card upfront for trial)
4. Set `subscription_data.trial_period_days: 7`
5. Use idempotency key via `idempotencyKey({ userId, intent: 'checkout' })`
6. Use the `tryWithCrossEnv` wrapper if reading an existing subscription's stripe_subscription_id

The exact code depends on the current structure. Roughly the shape (adapt to the existing function's organization):

```typescript
import { idempotencyKey, tryWithCrossEnv } from '../_shared/stripe.ts';

// inside the handler, after auth:
const body = await req.json();
const lookupKey = String(body.lookup_key ?? 'premium_monthly');

const stripe = getStripeClient();

// Find the price by lookup_key
const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
const price = prices.data[0];
if (!price) {
  return new Response(JSON.stringify({ error: 'price not found' }), { status: 400, headers });
}

const session = await stripe.checkout.sessions.create({
  ui_mode: 'custom',
  mode: 'subscription',
  customer_email: user.email,
  payment_method_collection: 'always',
  line_items: [{ price: price.id, quantity: 1 }],
  subscription_data: {
    trial_period_days: 7,
    metadata: { user_id: user.id },
  },
  return_url: `${Deno.env.get('SITE_URL')}/account?welcome=premium&session_id={CHECKOUT_SESSION_ID}`,
  metadata: { user_id: user.id, lookup_key: lookupKey },
}, { idempotencyKey: idempotencyKey({ userId: user.id, intent: 'checkout' }) });

// Defer subscriptions row write to only the session_id + status='pending'
// (billing_plan stays at whatever it was — typically 'free' — until finalize)
await supabaseAdmin.from('subscriptions').update({
  status: 'pending',
  payment_status: 'pending',
  session_id: session.id,
  updated_at: new Date().toISOString(),
}).eq('user_id', user.id);

return new Response(JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
```

Adapt the exact structure to match what's already in the file. Don't rewrite the surrounding auth boilerplate, cors handling, or service-key acquisition.

- [ ] **Step 3: Local smoke test**

```bash
# Local Supabase + a signed-in test user
SUPABASE_ANON_KEY="..." curl -X POST http://127.0.0.1:54321/functions/v1/create-checkout-session \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"lookup_key":"premium_monthly"}'
```

Expected: JSON with `clientSecret` and `sessionId`. If it returns a Stripe price-not-found error, that's a Stripe-test-mode config gap (price catalog needs `premium_monthly` lookup key configured).

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/create-checkout-session
git commit -m "feat(checkout): customer_email + 7-day trial + idempotency on session create"
```

---

### Task 9: `finalize-checkout-session` updates

**Files:**
- Modify: `supabase/functions/finalize-checkout-session/index.ts`

- [ ] **Step 1: Read existing**

```bash
cat supabase/functions/finalize-checkout-session/index.ts
```

Note: the function already correctly handles trial (`payment_status === 'paid' || subscription.status === 'trialing'`). The update is to use `mapStripeStatus()` instead of any remaining ad-hoc string assignment, and to clear `session_id` after successful finalization.

- [ ] **Step 2: Update**

Replace the bit that sets `status` on the subscription row with:

```typescript
import { mapStripeStatus, billingPlanFor } from '../_shared/subscription-state.ts';

// After retrieving the subscription:
const status = mapStripeStatus(subscription);
const billing_plan = billingPlanFor(status);

await supabaseAdmin.from('subscriptions').update({
  billing_plan,
  status,
  billing_period: priceLookupKey, // e.g. 'premium_monthly'
  stripe_customer_id: customerId,
  stripe_subscription_id: subscription.id,
  next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
  auto_renew: !subscription.cancel_at_period_end,
  payment_status: paid ? 'paid' : 'unpaid',
  session_id: null, // clear it after finalization
  billing_service: 'STRIPE',
  updated_at: new Date().toISOString(),
}).eq('user_id', userId);
```

Adjust to match the existing function structure. The key invariants:
- `status` comes from `mapStripeStatus(subscription)`
- `billing_plan` derived via `billingPlanFor(status)`
- `session_id: null` after success

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/finalize-checkout-session
git commit -m "feat(checkout): finalize uses mapStripeStatus + clears session_id"
```

---

### Task 10: `update-subscription-interval` updates

**Files:**
- Modify: `supabase/functions/update-subscription-interval/index.ts`

- [ ] **Step 1: Read**

```bash
cat supabase/functions/update-subscription-interval/index.ts
```

- [ ] **Step 2: Update**

Find the `stripe.subscriptions.update(...)` call. Wrap with idempotency + cross-env, and use `mapStripeStatus()` after the update.

```typescript
import { idempotencyKey, tryWithCrossEnv } from '../_shared/stripe.ts';
import { mapStripeStatus, billingPlanFor } from '../_shared/subscription-state.ts';

// After loading current subscription row:
const updated = await tryWithCrossEnv(() =>
  stripe.subscriptions.update(
    subscriptionRow.stripe_subscription_id,
    {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
    },
    { idempotencyKey: idempotencyKey({ userId: user.id, intent: 'update-interval' }) },
  ),
);

if (!updated) {
  // Cross-env stale ID: clear it and treat user as free
  await supabaseAdmin.from('subscriptions').update({
    stripe_subscription_id: null,
    status: 'free',
    billing_plan: 'free',
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id);
  return new Response(JSON.stringify({ error: 'subscription_not_found' }), { status: 404, headers });
}

const status = mapStripeStatus(updated);
const billing_plan = billingPlanFor(status);

await supabaseAdmin.from('subscriptions').update({
  status,
  billing_plan,
  billing_period: newPriceLookupKey,
  next_billing_date: new Date(updated.current_period_end * 1000).toISOString(),
  auto_renew: !updated.cancel_at_period_end,
  updated_at: new Date().toISOString(),
}).eq('user_id', user.id);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/update-subscription-interval
git commit -m "feat(billing): update-subscription-interval uses idempotency + cross-env + state module"
```

---

### Task 11: `toggle-auto-renew` updates

**Files:**
- Modify: `supabase/functions/toggle-auto-renew/index.ts`

- [ ] **Step 1: Read**

```bash
cat supabase/functions/toggle-auto-renew/index.ts
```

- [ ] **Step 2: Update**

```typescript
import { idempotencyKey, tryWithCrossEnv } from '../_shared/stripe.ts';
import { mapStripeStatus, billingPlanFor } from '../_shared/subscription-state.ts';

// Inside the handler, after auth + reading the row:
const { autoRenew } = await req.json(); // boolean: true=resume, false=cancel-at-period-end

const updated = await tryWithCrossEnv(() =>
  stripe.subscriptions.update(
    row.stripe_subscription_id,
    { cancel_at_period_end: !autoRenew },
    { idempotencyKey: idempotencyKey({ userId: user.id, intent: `auto-renew-${autoRenew}` }) },
  ),
);

if (!updated) {
  await supabaseAdmin.from('subscriptions').update({
    stripe_subscription_id: null,
    status: 'free',
    billing_plan: 'free',
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id);
  return new Response(JSON.stringify({ error: 'subscription_not_found' }), { status: 404, headers });
}

const status = mapStripeStatus(updated);
await supabaseAdmin.from('subscriptions').update({
  status,
  billing_plan: billingPlanFor(status),
  auto_renew: !updated.cancel_at_period_end,
  next_billing_date: new Date(updated.current_period_end * 1000).toISOString(),
  updated_at: new Date().toISOString(),
}).eq('user_id', user.id);

return new Response(JSON.stringify({ ok: true, status }), { headers });
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/toggle-auto-renew
git commit -m "feat(billing): toggle-auto-renew uses idempotency + cross-env + state module"
```

---

### Task 12: `billing-portal` updates

**Files:**
- Modify: `supabase/functions/billing-portal/index.ts`

- [ ] **Step 1: Read**

```bash
cat supabase/functions/billing-portal/index.ts
```

- [ ] **Step 2: Update**

```typescript
import { idempotencyKey } from '../_shared/stripe.ts';

// After loading the subscription row + auth:
if (row.billing_service === 'APPLE') {
  return new Response(JSON.stringify({ error: 'mas_managed' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
if (!row.stripe_customer_id) {
  return new Response(JSON.stringify({ error: 'no_stripe_customer' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const portal = await stripe.billingPortal.sessions.create(
  {
    customer: row.stripe_customer_id,
    return_url: `${Deno.env.get('SITE_URL')}/account`,
  },
  { idempotencyKey: idempotencyKey({ userId: user.id, intent: 'billing-portal' }) },
);

return new Response(JSON.stringify({ url: portal.url }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/billing-portal
git commit -m "feat(billing): billing-portal — MAS detection (400 mas_managed) + idempotency"
```

---

## Phase 5 — Backend cleanup

### Task 13: Delete `confirm-checkout-session` (after desktop-app verification)

**Files:**
- Verify: nothing in `/Users/kochie/projects/touch-typer/touch-type/renderer` references `confirm-checkout-session`
- Delete: `supabase/functions/confirm-checkout-session/`

- [ ] **Step 1: Grep desktop app**

```bash
grep -rn "confirm-checkout-session" /Users/kochie/projects/touch-typer/touch-type/renderer/src 2>/dev/null || echo "NOT FOUND in renderer"
grep -rn "confirm-checkout-session" /Users/kochie/projects/touch-typer/touch-type/electron-src 2>/dev/null || echo "NOT FOUND in electron-src"
```

- [ ] **Step 2: If both report NOT FOUND, delete the function**

```bash
git rm -r supabase/functions/confirm-checkout-session
git commit -m "chore: remove dead confirm-checkout-session edge function"
```

If either grep returns matches, **STOP**. Leave the function in place, add `// TODO(deprecated): unused by website; verify desktop is still using it` at the top of `confirm-checkout-session/index.ts`, commit, and report in the final summary.

---

## Phase 6 — Backend deploy

### Task 14: Push backend branch + deploy

**Files:**
- Verify all backend changes built into the worktree
- Push branch

- [ ] **Step 1: Final verification within the worktree**

```bash
cd /Users/kochie/projects/touch-typer/touch-type-backend/.worktrees/project-b-billing
git log --oneline origin/main..HEAD
deno check supabase/functions/_shared/subscription-state.ts \
  supabase/functions/_shared/email.ts \
  supabase/functions/_shared/stripe.ts 2>&1 | tail -10
```

Expected: ~12-14 commits in the range. `deno check` clean (or errors only in files we didn't touch — note them but don't fix unrelated).

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feature/project-b-billing 2>&1 | tail -5
```

- [ ] **Step 3: Hand off to user**

The user reviews the PR at `https://github.com/kochie/touch-type-backend/pull/new/feature/project-b-billing` and merges to `main`. Supabase auto-deploys.

After Supabase deploy completes (visible in dashboard), the user must:
- In Stripe Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://<supabase-project>.supabase.co/functions/v1/stripe-webhook`
- Events: `invoice.payment_failed`, `customer.subscription.trial_will_end`, `customer.subscription.deleted`
- Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Supabase project secrets

Don't proceed with the website tasks until backend is deployed and `STRIPE_WEBHOOK_SECRET` is set.

---

## Phase 7 — Website shared lib

All remaining tasks work from `/Users/kochie/projects/touch-typer/touch-typer.kochie.io` on branch `website-rebuild`.

### Task 15: `lib/subscription-resolved.ts` (TypeScript types)

**Files:**
- Create: `src/lib/subscription-resolved.ts`

- [ ] **Step 1: Create the type file**

```typescript
// src/lib/subscription-resolved.ts
// Types matching the subscriptions_resolved view added in the backend.

export type SubscriptionStatus =
  | "free"
  | "pending"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type BillingService = "STRIPE" | "APPLE" | null;

export interface SubscriptionResolved {
  user_id: string;
  billing_plan: "free" | "premium";
  billing_period: string | null;
  status: SubscriptionStatus;
  billing_service: BillingService;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  next_billing_date: string | null; // ISO date
  auto_renew: boolean;
  payment_status: string | null;
  session_id: string | null;
  updated_at: string;

  // Derived from the view:
  is_premium: boolean;
  is_in_trial: boolean;
  is_past_due: boolean;
  is_canceled: boolean;
  effective_end_date: string | null;
  display_billing_period: "monthly" | "yearly" | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/subscription-resolved.ts
git commit -m "feat(types): SubscriptionResolved type matching backend view"
```

---

### Task 16: `lib/get-user-and-subscription.ts` (request-scoped helper)

**Files:**
- Create: `src/lib/get-user-and-subscription.ts`

- [ ] **Step 1: Create**

```typescript
// src/lib/get-user-and-subscription.ts
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export interface UserAndSubscription {
  user: { id: string; email: string } | null;
  subscription: SubscriptionResolved | null;
}

/**
 * Request-scoped fetch of the current user + their subscription_resolved row.
 * Deduped across server components via React's `cache()`.
 * Header, PastDueBanner, and pages can all call this without triggering
 * multiple Supabase round trips.
 */
export const getUserAndSubscription = cache(async (): Promise<UserAndSubscription> => {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, subscription: null };
  }

  const { data: subscription } = await supabase
    .from("subscriptions_resolved")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email ?? "" },
    subscription: subscription as SubscriptionResolved | null,
  };
});
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/get-user-and-subscription.ts
git commit -m "feat(lib): request-scoped getUserAndSubscription via React cache()"
```

---

## Phase 8 — Website /buy/plans rebuild

### Task 17: CTA helper + BuyPlans types

**Files:**
- Create: `src/components/BuyPlans/cta.ts`

- [ ] **Step 1: Create**

```typescript
// src/components/BuyPlans/cta.ts
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export interface PriceLite {
  lookup_key: string;
  unit_amount: number | null;
  currency: string;
  interval: string | null;
  interval_count: number | null;
}

export interface CtaProps {
  label: string;
  href: string;
  variant: "accent" | "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

export function getPremiumCta(
  sub: SubscriptionResolved | null,
  price: PriceLite,
): CtaProps {
  if (!sub || sub.status === "free") {
    return {
      label: "Start 7-day free trial",
      href: `/checkout?price=${price.lookup_key}`,
      variant: "accent",
    };
  }
  if (sub.billing_service === "APPLE") {
    return {
      label: "Manage in App Store",
      href: "/account",
      variant: "secondary",
    };
  }
  switch (sub.status) {
    case "trialing":
    case "active":
      return { label: "You're already Premium", href: "/account", variant: "ghost", disabled: true };
    case "canceled":
      return { label: "Resume subscription", href: "/account#reactivate", variant: "accent" };
    case "past_due":
      return { label: "Update payment", href: "/account#recover", variant: "accent" };
    case "expired":
      return { label: "Resubscribe", href: `/checkout?price=${price.lookup_key}`, variant: "accent" };
    case "pending":
      return { label: "Resume checkout", href: "/checkout", variant: "secondary" };
  }
}

export function formatPrice(price: PriceLite): string {
  if (price.unit_amount == null) return "—";
  const amount = (price.unit_amount / 100).toFixed(2);
  const interval = price.interval === "year" ? "yr" : "mo";
  return `$${amount}/${interval}`;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BuyPlans/cta.ts
git commit -m "feat(buy-plans): CTA helper + formatPrice"
```

---

### Task 18: `<FrequencyToggle>` client component

**Files:**
- Create: `src/components/BuyPlans/FrequencyToggle.tsx`

- [ ] **Step 1: Create**

```tsx
"use client";

import { RadioGroup, Radio } from "@headlessui/react";
import clsx from "clsx";

interface FrequencyToggleProps {
  value: "monthly" | "yearly";
  onChange: (next: "monthly" | "yearly") => void;
  yearlyDiscount?: string; // e.g. "save 20%"
}

export function FrequencyToggle({ value, onChange, yearlyDiscount }: FrequencyToggleProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="inline-flex rounded-full border border-border bg-bg-elevated p-1"
      aria-label="Billing frequency"
    >
      <Radio
        value="monthly"
        className={({ checked }) =>
          clsx(
            "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors",
            checked ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg",
          )
        }
      >
        Monthly
      </Radio>
      <Radio
        value="yearly"
        className={({ checked }) =>
          clsx(
            "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors",
            checked ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg",
          )
        }
      >
        Yearly{yearlyDiscount && <span className="ml-1 text-accent">· {yearlyDiscount}</span>}
      </Radio>
    </RadioGroup>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BuyPlans/FrequencyToggle.tsx
git commit -m "feat(buy-plans): FrequencyToggle headless-ui RadioGroup"
```

---

### Task 19: `<BuyPlansClient>` orchestrator

**Files:**
- Create: `src/components/BuyPlans/BuyPlansClient.tsx`

- [ ] **Step 1: Create**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FrequencyToggle } from "./FrequencyToggle";
import { getPremiumCta, formatPrice, type PriceLite } from "./cta";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

interface BuyPlansClientProps {
  prices: PriceLite[]; // expected to include premium_monthly and premium_yearly
  subscription: SubscriptionResolved | null;
  cancelled: boolean; // true if URL had ?cancelled=true
}

export function BuyPlansClient({ prices, subscription, cancelled }: BuyPlansClientProps) {
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = useMemo(() => prices.find((p) => p.lookup_key === "premium_monthly"), [prices]);
  const yearlyPrice = useMemo(() => prices.find((p) => p.lookup_key === "premium_yearly"), [prices]);
  const selectedPrice = frequency === "monthly" ? monthlyPrice : yearlyPrice;

  const yearlyDiscount = useMemo(() => {
    if (!monthlyPrice?.unit_amount || !yearlyPrice?.unit_amount) return undefined;
    const yearlyCostIfMonthly = monthlyPrice.unit_amount * 12;
    const savings = yearlyCostIfMonthly - yearlyPrice.unit_amount;
    if (savings <= 0) return undefined;
    const pct = Math.round((savings / yearlyCostIfMonthly) * 100);
    return `save ${pct}%`;
  }, [monthlyPrice, yearlyPrice]);

  const premiumCta = selectedPrice ? getPremiumCta(subscription, selectedPrice) : null;

  return (
    <>
      {cancelled && (
        <div className="mb-8 rounded-lg border border-border bg-bg-elevated p-4 text-sm">
          Checkout cancelled — you weren't charged.
        </div>
      )}

      <div className="mb-10 flex justify-center">
        <FrequencyToggle value={frequency} onChange={setFrequency} yearlyDiscount={yearlyDiscount} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free card */}
        <Card tone="paper">
          <Eyebrow>Free</Eyebrow>
          <div className="mt-3 text-4xl sm:text-5xl font-bold">$0</div>
          <div className="text-sm text-fg-muted mt-1">Forever</div>
          <ul className="mt-6 space-y-3 text-sm text-fg/80">
            <li>· Real-time PvP duels</li>
            <li>· WPM, accuracy, heatmaps</li>
            <li>· Multi-layout (QWERTY, Dvorak, Colemak)</li>
            <li>· Code Mode</li>
            <li>· Basic stats & streaks</li>
          </ul>
          <div className="mt-8">
            <Button
              href="/#download"
              variant="secondary"
              size="md"
              className="w-full"
            >
              Download
            </Button>
          </div>
        </Card>

        {/* Premium card */}
        <Card emphasis="gradient">
          <Eyebrow tone="default" className="!text-paper/80">Premium · Most popular</Eyebrow>
          <div className="mt-3 text-4xl sm:text-5xl font-bold">
            {selectedPrice ? formatPrice(selectedPrice).split("/")[0] : "—"}
            <span className="text-base font-normal text-paper/70">
              /{frequency === "monthly" ? "month" : "year"}
            </span>
          </div>
          <div className="text-sm text-paper/70 mt-1">
            {frequency === "yearly" && yearlyDiscount ? `${yearlyDiscount} vs monthly` : "Cancel anytime"}
          </div>
          <ul className="mt-6 space-y-3 text-sm text-paper/90">
            <li>· Everything in Free</li>
            <li>· AI Coach + custom drills</li>
            <li>· AI insights ("why your progress stalled")</li>
            <li>· Streak freezes (1 free per week)</li>
            <li>· Advanced goals & challenges</li>
          </ul>
          <div className="mt-8">
            {premiumCta && (
              <Button
                href={premiumCta.href}
                variant={premiumCta.variant === "accent" ? "inverse" : premiumCta.variant}
                size="md"
                className="w-full"
                aria-disabled={premiumCta.disabled}
              >
                {premiumCta.label}
              </Button>
            )}
          </div>
        </Card>
      </div>

      <p className="mt-10 text-center text-xs text-fg-muted max-w-md mx-auto">
        Card required for the 7-day free trial. Cancel any time in your account.
        We'll email you 3 days before the trial ends.
      </p>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BuyPlans/BuyPlansClient.tsx
git commit -m "feat(buy-plans): BuyPlansClient with frequency toggle + state-aware CTAs"
```

---

### Task 20: `/buy/plans/page.tsx` rebuild

**Files:**
- Modify: `src/app/buy/plans/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BuyPlansClient } from "@/components/BuyPlans/BuyPlansClient";
import { PricingMatrix } from "@/components/marketing/PricingMatrix";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PriceLite } from "@/components/BuyPlans/cta";

export const metadata: Metadata = {
  title: "Pricing — Touch Typer",
  description:
    "Free 7-day trial. Premium starts at $2.99/month. Cancel anytime.",
  alternates: { canonical: "https://touch-typer.kochie.io/buy/plans" },
};

interface PageProps {
  searchParams: Promise<{ cancelled?: string }>;
}

export default async function BuyPlansPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cancelled = sp.cancelled === "true";

  const { subscription } = await getUserAndSubscription();

  // Fetch live prices from Stripe via list-prices edge function
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.functions.invoke("list-prices", {
    body: { lookup_keys: ["premium_monthly", "premium_yearly"] },
  });

  const prices: PriceLite[] = error
    ? []
    : ((data?.prices as PriceLite[]) ?? []);

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Free to download. Affordable to upgrade.
            </h1>
            <p className="mt-6 text-lg text-fg/70">
              Pick a plan when you're ready. No trial games, no manipulative pricing.
            </p>
          </div>

          <div className="mt-12">
            <BuyPlansClient
              prices={prices}
              subscription={subscription}
              cancelled={cancelled}
            />
          </div>
        </Container>
      </Section>

      <PricingMatrix />
      <PricingFAQ />
    </main>
  );
}
```

- [ ] **Step 2: Type-check + build**

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/buy/plans/page.tsx
git commit -m "feat(buy-plans): rebuild /buy/plans with Stripe price fetch + state-aware Premium CTA"
```

---

## Phase 9 — Website /checkout rebuild

### Task 21: Verify Stripe Custom Checkout API in installed version

**Files:**
- Read: `node_modules/@stripe/react-stripe-js/dist/react-stripe.d.ts`

- [ ] **Step 1: Find the React export for ui_mode='custom'**

```bash
grep -nE "CheckoutProvider|CustomCheckoutProvider|EmbeddedCheckoutProvider|useCheckout|useCustomCheckout" \
  node_modules/@stripe/react-stripe-js/dist/react-stripe.d.ts | head -30
```

You're looking for the React component that pairs with `ui_mode: 'custom'` checkout sessions. In recent versions it's typically `CheckoutProvider` (without "Embedded" / "Custom" prefix) plus a `useCheckout()` hook. In older versions it may be `CustomCheckoutProvider` + `useCustomCheckout()`.

- [ ] **Step 2: Document the names found**

Note the exact import names you'll use in the next tasks. If the version doesn't ship a Custom Checkout React API at all (only `EmbeddedCheckoutProvider`), bump the package version:

```bash
pnpm add @stripe/react-stripe-js@latest @stripe/stripe-js@latest --config.blockExoticSubdeps=false
```

If you bump, commit the lockfile change separately:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): bump @stripe/react-stripe-js for Custom Checkout API"
```

This task is **discovery only** — no committed code changes (other than possibly the dep bump). Use the discovered names in Task 22-23.

---

### Task 22: `<PaymentForm>` client component

**Files:**
- Create: `src/components/Payment/PaymentForm.tsx`

This task uses the Stripe Custom Checkout hook names discovered in Task 21. The code below assumes `CheckoutProvider` + `useCheckout()`. Substitute `CustomCheckoutProvider` / `useCustomCheckout()` if that's what the installed version uses.

- [ ] **Step 1: Create**

```tsx
"use client";

import { useState } from "react";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";

export function PaymentForm() {
  const checkout = useCheckout(); // returns null until mounted
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!checkout) {
    return (
      <div className="text-sm text-fg-muted">Loading payment…</div>
    );
  }

  const lineItem = checkout.lineItems?.[0];
  const total = checkout.total;
  const trial = checkout.trial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await checkout.confirm();
    if (result.type === "error") {
      setError(result.error.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }
    // On success, Stripe redirects via the session's return_url.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border bg-bg-elevated p-4">
        <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Order summary</div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-fg">{lineItem?.name ?? "Touch Typer Premium"}</span>
          <span className="text-fg/80">{formatTotal(total)}</span>
        </div>
        {trial?.trial_period_days != null && trial.trial_period_days > 0 && (
          <div className="mt-2 text-sm text-fg-muted">
            Free for {trial.trial_period_days} days, then {formatTotal(total)}
          </div>
        )}
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div className="rounded-md border border-bad/30 bg-bad/10 p-3 text-sm text-bad">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full shadow-accent"
        disabled={submitting}
      >
        {submitting ? "Starting trial…" : (trial?.trial_period_days ? "Start free 7-day trial" : "Subscribe")}
      </Button>

      <p className="text-xs text-fg-muted text-center">
        By subscribing you agree to Touch Typer's terms. Cancel any time.
      </p>
    </form>
  );
}

function formatTotal(t: { amount?: number; currency?: string } | null | undefined): string {
  if (!t?.amount) return "—";
  const amount = (t.amount / 100).toFixed(2);
  return `$${amount}`;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

If TypeScript reports that `lineItems` / `total` / `trial` shapes differ from what's assumed, narrow against the installed types (the shapes from Stripe's library are version-specific). Use whatever is available; defensive `?.` operators are appropriate.

- [ ] **Step 3: Commit**

```bash
git add src/components/Payment/PaymentForm.tsx
git commit -m "feat(checkout): PaymentForm using Custom Checkout hook + PaymentElement"
```

---

### Task 23: `<CheckoutClient>` wrapper + `/checkout/page.tsx`

**Files:**
- Modify (replace): `src/components/Payment/index.tsx`
- Modify (replace): `src/app/checkout/page.tsx`

- [ ] **Step 1: Replace `src/components/Payment/index.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { PaymentForm } from "./PaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutClientProps {
  clientSecret: string;
}

export default function CheckoutClient({ clientSecret }: CheckoutClientProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pass the theme to Stripe's PaymentElement via the provider's
  // elementsOptions.appearance — this is the correct place for Custom
  // Checkout (NOT at session creation time on the backend).
  const appearance = {
    theme: (mounted && resolvedTheme === "dark" ? "night" : "stripe") as "stripe" | "night",
  };

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance },
      }}
    >
      <PaymentForm />
    </CheckoutProvider>
  );
}
```

(Substitute `CustomCheckoutProvider` if that's what the installed version exports. The `elementsOptions.appearance` field name is consistent across recent versions; if absent, look for `appearance` directly on the options object — the d.ts in node_modules will confirm.)

- [ ] **Step 2: Replace `src/app/checkout/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import CheckoutClient from "@/components/Payment";

export const metadata: Metadata = {
  title: "Checkout — Touch Typer",
  description: "Start your 7-day free trial.",
};

interface PageProps {
  searchParams: Promise<{ price?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lookupKey = sp.price === "premium_yearly" ? "premium_yearly" : "premium_monthly";

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/signin?redirect=/checkout?price=${lookupKey}`);
  }

  // Theme is configured client-side via CheckoutProvider's
  // elementsOptions.appearance — no need to pass it to the backend.
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { lookup_key: lookupKey },
  });

  if (error || !data?.clientSecret) {
    return (
      <main>
        <Section tone="paper" density="default">
          <Container width="narrow">
            <Eyebrow>Checkout</Eyebrow>
            <h1 className="mt-3 text-3xl font-bold">Couldn't start checkout</h1>
            <p className="mt-4 text-fg/70">
              We hit an unexpected error setting up your checkout session. Try again in a minute,
              or contact support if it persists.
            </p>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Start your free trial
          </h1>
          <p className="mt-3 text-fg/70">
            Card required. We won't charge you until your 7-day trial ends, and you can cancel any time.
          </p>
          <div className="mt-8">
            <CheckoutClient clientSecret={data.clientSecret} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Payment/index.tsx src/app/checkout/page.tsx
git commit -m "feat(checkout): rebuild /checkout with Custom Checkout provider + theme passthrough"
```

---

## Phase 10 — Website /account states

### Task 24: `<SubscriptionCard>` dispatcher

**Files:**
- Create: `src/components/AccountSettings/SubscriptionCard.tsx`

- [ ] **Step 1: Create**

```tsx
import type { SubscriptionResolved } from "@/lib/subscription-resolved";
import { FreeCard } from "./subscription-states/FreeCard";
import { PendingCard } from "./subscription-states/PendingCard";
import { TrialingCard } from "./subscription-states/TrialingCard";
import { ActiveCard } from "./subscription-states/ActiveCard";
import { CanceledCard } from "./subscription-states/CanceledCard";
import { PastDueCard } from "./subscription-states/PastDueCard";
import { ExpiredCard } from "./subscription-states/ExpiredCard";
import { MasManagedCard } from "./subscription-states/MasManagedCard";

interface SubscriptionCardProps {
  subscription: SubscriptionResolved | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (subscription?.billing_service === "APPLE") {
    return <MasManagedCard subscription={subscription} />;
  }

  const status = subscription?.status ?? "free";
  switch (status) {
    case "free":     return <FreeCard />;
    case "pending":  return <PendingCard />;
    case "trialing": return <TrialingCard subscription={subscription!} />;
    case "active":   return <ActiveCard subscription={subscription!} />;
    case "canceled": return <CanceledCard subscription={subscription!} />;
    case "past_due": return <PastDueCard subscription={subscription!} />;
    case "expired":  return <ExpiredCard subscription={subscription!} />;
  }
}
```

- [ ] **Step 2: Type-check** (will fail until each state card exists — that's expected; we'll add them in the next tasks).

```bash
npx tsc --noEmit 2>&1 | grep "subscription-states" | head -5
```

Expected: errors about missing modules. Continue to next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/AccountSettings/SubscriptionCard.tsx
git commit -m "feat(account): SubscriptionCard dispatcher (state cards added in follow-up commits)"
```

---

### Task 25: 8 subscription state cards

This task creates 8 small files. Each card is a server component with optional small client subcomponent for buttons.

**Files:**
- Create: `src/components/AccountSettings/subscription-states/FreeCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/PendingCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/TrialingCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/ActiveCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/CanceledCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/PastDueCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/ExpiredCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/MasManagedCard.tsx`
- Create: `src/components/AccountSettings/subscription-states/SubscriptionActions.tsx` (shared client buttons for cancel / reactivate / manage payment)

- [ ] **Step 1: Create `SubscriptionActions.tsx` (shared client component)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSupabase } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";

interface ActionsProps {
  showCancel?: boolean;
  showReactivate?: boolean;
  showManage?: boolean;
  showUpdatePayment?: boolean;
}

export function SubscriptionActions({
  showCancel,
  showReactivate,
  showManage,
  showUpdatePayment,
}: ActionsProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Cancel at period end? You'll keep Premium access until then, and can reactivate any time before.")) return;
    setBusy("cancel");
    try {
      const { error } = await supabase.functions.invoke("toggle-auto-renew", { body: { autoRenew: false } });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't cancel", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  async function reactivate() {
    setBusy("reactivate");
    try {
      const { error } = await supabase.functions.invoke("toggle-auto-renew", { body: { autoRenew: true } });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't reactivate", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const { data, error } = await supabase.functions.invoke("billing-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't open billing", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {showUpdatePayment && (
        <Button onClick={openPortal} disabled={busy === "portal"} variant="accent" size="md" className="shadow-accent">
          {busy === "portal" ? "Opening…" : "Update payment"}
        </Button>
      )}
      {showCancel && (
        <Button onClick={cancel} disabled={busy === "cancel"} variant="secondary" size="md">
          {busy === "cancel" ? "Cancelling…" : "Cancel at period end"}
        </Button>
      )}
      {showReactivate && (
        <Button onClick={reactivate} disabled={busy === "reactivate"} variant="accent" size="md" className="shadow-accent">
          {busy === "reactivate" ? "Reactivating…" : "Reactivate"}
        </Button>
      )}
      {showManage && (
        <Button onClick={openPortal} disabled={busy === "portal"} variant="ghost" size="md">
          {busy === "portal" ? "Opening…" : "Manage payment methods"}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the 8 card files**

`FreeCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FreeCard() {
  return (
    <Card tone="paper-soft">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
          <div className="mt-1 text-xl font-semibold">Free</div>
        </div>
        <Button href="/buy/plans" variant="accent" size="md" className="shadow-accent">
          Upgrade to Premium
        </Button>
      </div>
      <p className="mt-3 text-sm text-fg/70">
        AI Coach, custom drills, AI insights, and weekly streak freezes unlock with Premium.
      </p>
    </Card>
  );
}
```

`PendingCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PendingCard() {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Checkout in progress</div>
      <p className="mt-3 text-sm text-fg/70">
        We started a checkout session for you but didn't see it complete.
      </p>
      <div className="mt-6">
        <Button href="/checkout" variant="secondary" size="md">Resume checkout</Button>
      </div>
    </Card>
  );
}
```

`TrialingCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function TrialingCard({ subscription }: { subscription: SubscriptionResolved }) {
  const daysLeft = subscription.effective_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.effective_end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return (
    <Card tone="paper-soft">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.1em] text-accent">Trial</div>
          <div className="mt-1 text-xl font-semibold">Premium</div>
        </div>
        {daysLeft != null && (
          <div className="text-right">
            <div className="text-2xl font-semibold text-accent">{daysLeft}</div>
            <div className="text-xs text-fg-muted">days remaining</div>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-fg/70">
        Your trial ends on {subscription.effective_end_date && new Date(subscription.effective_end_date).toLocaleDateString("en-US", { dateStyle: "long" })}.
        Your card will be charged then unless you cancel.
      </p>
      <div className="mt-6">
        <SubscriptionActions showCancel showManage />
      </div>
    </Card>
  );
}
```

`ActiveCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function ActiveCard({ subscription }: { subscription: SubscriptionResolved }) {
  const renews = subscription.next_billing_date
    ? new Date(subscription.next_billing_date).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Premium · {subscription.display_billing_period}</div>
      {renews && <p className="mt-3 text-sm text-fg/70">Renews on {renews}.</p>}
      <div className="mt-6">
        <SubscriptionActions showCancel showManage />
      </div>
    </Card>
  );
}
```

`CanceledCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function CanceledCard({ subscription }: { subscription: SubscriptionResolved }) {
  const endsOn = subscription.effective_end_date
    ? new Date(subscription.effective_end_date).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;
  return (
    <Card tone="paper-soft" id="reactivate">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Premium · ending</div>
      {endsOn && (
        <p className="mt-3 text-sm text-fg/70">
          Subscription cancelled. You'll keep Premium until {endsOn}, then drop to Free.
        </p>
      )}
      <div className="mt-6">
        <SubscriptionActions showReactivate showManage />
      </div>
    </Card>
  );
}
```

`PastDueCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function PastDueCard({ subscription }: { subscription: SubscriptionResolved }) {
  return (
    <Card tone="paper" className="border-bad/30 bg-bad/5" id="recover">
      <div className="text-xs uppercase tracking-[0.1em] text-bad font-semibold">Payment failed</div>
      <div className="mt-1 text-xl font-semibold">We couldn't charge your card</div>
      <p className="mt-3 text-sm text-fg/70">
        Stripe will keep retrying for the next ~2 weeks. To resolve immediately, update your payment method.
      </p>
      <div className="mt-6">
        <SubscriptionActions showUpdatePayment />
      </div>
    </Card>
  );
}
```

`ExpiredCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ExpiredCard() {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Free</div>
      <p className="mt-3 text-sm text-fg/70">
        Your Premium subscription has ended. Resubscribe any time.
      </p>
      <div className="mt-6">
        <Button href="/buy/plans" variant="accent" size="md" className="shadow-accent">
          Resubscribe
        </Button>
      </div>
    </Card>
  );
}
```

`MasManagedCard.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function MasManagedCard({ subscription }: { subscription: SubscriptionResolved }) {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Managed in Mac App Store</div>
      <div className="mt-1 text-xl font-semibold">Premium</div>
      {subscription.display_billing_period && (
        <p className="mt-3 text-sm text-fg/70">
          Billed {subscription.display_billing_period} via Apple. Manage your subscription in the App Store.
        </p>
      )}
      <div className="mt-6">
        <Button
          href="macappstore://apps.apple.com/app/id1637786724"
          variant="accent"
          size="md"
          className="shadow-accent"
        >
          Open in App Store
        </Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/AccountSettings/subscription-states/
git commit -m "feat(account): 8 subscription state cards + SubscriptionActions client component"
```

---

### Task 26: Wire `<SubscriptionCard>` into `/account` page

**Files:**
- Modify: `src/app/account/page.tsx`

- [ ] **Step 1: Read existing**

```bash
cat src/app/account/page.tsx
```

- [ ] **Step 2: Replace the subscription/plan section with `<SubscriptionCard>`**

Add `import { SubscriptionCard } from "@/components/AccountSettings/SubscriptionCard";` and replace the existing `<PricingPlans>` or similar component with `<SubscriptionCard subscription={subscription} />`. Use `getUserAndSubscription()` from `@/lib/get-user-and-subscription` to fetch.

If the existing page reads subscription via a different helper, replace that read with `getUserAndSubscription()`. The other panels (UserDetails, ChangePassword, MFA, SignOut) stay as-is.

Approximate structure:

```tsx
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SubscriptionCard } from "@/components/AccountSettings/SubscriptionCard";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
// ... other existing imports for UserDetails, ChangePassword, MFA, etc.

interface PageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AccountPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { user, subscription } = await getUserAndSubscription();
  if (!user) redirect("/signin");

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold">Your account</h1>

          <div className="mt-8 space-y-6">
            <SubscriptionCard subscription={subscription} />

            {/* Preserve existing UserDetails, ChangePassword, MFA, SignOut panels here */}
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

If the existing page is `"use client"`, the new `SubscriptionCard` (server component) cannot be rendered. In that case, convert the page to a server component and move any necessary client logic into subcomponents that already exist.

If `sp.welcome === "premium"`, also render a small client `<WelcomeToast />` component that fires a one-shot toast and `router.replace("/account")`. (Optional — can skip if the existing toast pattern is hard to wire.)

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/account/page.tsx
git commit -m "feat(account): use SubscriptionCard dispatcher + getUserAndSubscription"
```

---

## Phase 11 — Website past-due banner

### Task 27: `<PastDueBanner>` + layout integration

**Files:**
- Create: `src/components/PastDueBanner.tsx`
- Create: `src/components/PastDueBannerDismiss.tsx` (client subcomponent)
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the server component**

```tsx
// src/components/PastDueBanner.tsx
import Link from "next/link";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { headers } from "next/headers";
import { PastDueBannerDismiss } from "./PastDueBannerDismiss";

export async function PastDueBanner() {
  const { subscription } = await getUserAndSubscription();
  if (subscription?.status !== "past_due") return null;

  // Hide on /account (no need to nag while user is on the page already)
  const path = (await headers()).get("x-pathname") ?? "";
  if (path.startsWith("/account")) return null;

  return (
    <PastDueBannerDismiss>
      <div className="bg-bad text-paper">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-sm">
          <span>
            <strong>Payment failed.</strong> Update your payment method to keep Premium.
          </span>
          <Link
            href="/account#recover"
            className="rounded-md bg-paper/20 px-3 py-1 font-medium hover:bg-paper/30 transition-colors"
          >
            Update
          </Link>
        </div>
      </div>
    </PastDueBannerDismiss>
  );
}
```

- [ ] **Step 2: Create the dismiss wrapper (client)**

```tsx
// src/components/PastDueBannerDismiss.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "pastDueBannerDismissed";

export function PastDueBannerDismiss({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "1") setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        aria-label="Dismiss past-due banner"
        onClick={() => {
          sessionStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
        className="absolute top-1.5 right-3 text-paper/80 hover:text-paper text-sm"
      >
        ×
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add the banner to `layout.tsx`**

```tsx
// In src/app/layout.tsx, just below <Header />:
import { PastDueBanner } from "@/components/PastDueBanner";

// In the JSX, replace:
//   <Header />
// with:
//   <Header />
//   <PastDueBanner />
```

(The banner reads `getUserAndSubscription()` which is request-scoped via React `cache()` — same fetch as Header, no extra DB round-trip.)

For the path-hiding logic, Next.js doesn't expose the current pathname to server components by default. Two options:
1. Read the `x-invoke-path` or `x-pathname` header (some hosts set this, but not reliably on Vercel).
2. Use Next.js middleware (`proxy.ts`) to set `x-pathname` for downstream reads.

Recommended fix: extend `proxy.ts` to set the header:

```typescript
// In src/proxy.ts, inside the proxy() function, before the existing logic:
const path = request.nextUrl.pathname;
// Pass the path to downstream server components via a header
const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-pathname", path);
// Use the headers when constructing responses:
let response = NextResponse.next({
  request: { headers: requestHeaders },
});
```

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src/components/PastDueBanner.tsx src/components/PastDueBannerDismiss.tsx src/app/layout.tsx src/proxy.ts
git commit -m "feat(banner): site-wide past-due banner with session dismiss"
```

---

## Phase 12 — Verification & launch

### Task 28: Pre-merge verification

Manual checklist. No code changes unless something surfaces.

- [ ] **Build clean:**

```bash
pnpm build 2>&1 | tail -10
npx tsc --noEmit
```

- [ ] **Backend deployed:** Confirm `feature/project-b-billing` is merged to `main` on the backend repo and Supabase dashboard shows the new functions deployed (`list-prices`, `stripe-webhook`).

- [ ] **Stripe webhook configured:** In Stripe Dashboard → Developers → Webhooks, confirm a webhook endpoint exists pointing to `https://<project>.supabase.co/functions/v1/stripe-webhook` with events: `invoice.payment_failed`, `customer.subscription.trial_will_end`, `customer.subscription.deleted`. The signing secret is set in Supabase as `STRIPE_WEBHOOK_SECRET`.

- [ ] **Resend configured:** `RESEND_API_KEY` is set in Supabase. Domain is verified in Resend dashboard.

- [ ] **End-to-end happy path** (Stripe test mode):
  1. Sign up new user → land on `/account` showing FreeCard
  2. Click "Upgrade to Premium" → `/buy/plans` shows correct prices from Stripe
  3. Toggle monthly/yearly → CTA href updates
  4. Click "Start 7-day free trial" → `/checkout` loads PaymentElement
  5. Enter test card `4242 4242 4242 4242`, future expiry, any CVC → submit
  6. Redirect to `/account?welcome=premium` → welcome toast → URL cleans up
  7. `<TrialingCard>` shows correct days-remaining and trial-end date

- [ ] **Cancel + reactivate:**
  1. From TrialingCard: "Cancel at period end" → confirm → page refreshes → `<CanceledCard>`
  2. From CanceledCard: "Reactivate" → page refreshes → back to TrialingCard

- [ ] **Manage payment:**
  1. From any card: "Manage payment methods" → Stripe portal opens in new tab

- [ ] **Past-due:**
  1. Use Stripe CLI: `stripe trigger invoice.payment_failed`
  2. Within ~5 sec the subscription's Sync Engine event fires; `<PastDueBanner>` appears
  3. Visit `/account` → `<PastDueCard>` rendered
  4. Resend dashboard logs the email send

- [ ] **MAS detection:**
  1. Insert row: `INSERT INTO subscriptions (user_id, billing_plan, status, billing_service) VALUES ('<test-user-uuid>', 'premium', 'active', 'APPLE');`
  2. Visit `/account` → `<MasManagedCard>` renders
  3. `/buy/plans` shows "Manage in App Store"

- [ ] **Cross-env recovery:**
  1. `UPDATE subscriptions SET stripe_subscription_id = 'sub_fake_synthetic' WHERE user_id = '<test-user>';`
  2. Trigger update-subscription-interval from `/account` → tryWithCrossEnv catches, clears the ID
  3. User sees Free state on refresh

- [ ] **Idempotency:**
  1. In dev tools console double-invoke `create-checkout-session`
  2. Stripe Dashboard → Sessions: only one session created

- [ ] **Lighthouse:** `/account` and `/buy/plans` ≥ 90 Performance, ≥ 95 Accessibility (both themes).

- [ ] **Commit any polish from the sweep:**

```bash
git add -A
git commit -m "chore: final polish before merge" 2>&1 | tail -3
```

---

### Task 29: Push website branch

- [ ] **Step 1: Push**

```bash
git push 2>&1 | tail -5
```

- [ ] **Step 2: Vercel preview URL**

Capture the preview URL from the Vercel dashboard. Hand off to user for production testing.

Once user is satisfied with preview testing → merge `website-rebuild` → `main` → Vercel auto-deploys to production.

---

## Implementation Notes

- **Cross-repo coordination:** Backend must deploy before website's new flows work. Phase 6 (Task 14) is the explicit handoff: subagent pushes the backend branch and STOPS until user confirms backend is merged + deployed + `STRIPE_WEBHOOK_SECRET` is configured.
- **DRY:** All status interpretation goes through `mapStripeStatus()` and `billingPlanFor()`. All Stripe API calls that can be retried use `idempotencyKey()`. All subscription-row reads via `getUserAndSubscription()` (server) or the supabase-provider (client).
- **YAGNI:** No automated tests added. No subscription history table. No coupon UI. No multi-currency UX beyond what Stripe returns. No retry-from-app button.
- **Frequent commits:** ~29 atomic commits across both repos. Each commit is self-contained and reviewable.

## Project B Reminders

If during implementation any of these surface, **log them in `docs/superpowers/notes/project-b-followups.md`, don't fix in this branch:**

- Stripe Sync Engine not actually enabled in production (would explain stale subscription rows)
- Streak-freeze checkout broken (`finalize-streak-freeze-checkout`)
- Account auth-guard not firing in some routes (would surface as auth-failure 500s)
- Email deliverability issues (bounces, spam, etc.)
- Stripe webhook signing secret rotation procedure
