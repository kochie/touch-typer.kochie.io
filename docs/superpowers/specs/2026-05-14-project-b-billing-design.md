# Project B — Billing & Account Rebuild Design Spec

**Date:** 2026-05-14
**Project:** Spans `touch-typer.kochie.io` (Next 16 site) + `touch-type-backend` (Supabase edge functions + Postgres)
**Status:** Approved by user; ready for implementation plan
**Prior spec:** `2026-05-13-website-rebuild-design.md` (Project A — website rebuild) — billing was carved out from that project as Project B; this is Project B

## 1. Purpose

The billing and account system is architecturally broken. The checkout has never worked correctly (Stripe session is created with `ui_mode: 'custom'` but the React client uses `EmbeddedCheckoutProvider`, which requires `ui_mode: 'embedded'`). Several pre-existing security regressions and dead code paths compound the failure. Project B reimplements the subscription lifecycle with a proper state model, working checkout, account-page state-aware UX, payment-failure recovery, and transactional emails — without expanding scope to a full backend rewrite.

This spec assumes the quick-win commits (deferred premature `billing_plan` write, `getSession()` → `getUser()` swaps, `iap-webhook` JWT bypass, `retrievePaymentIntent` export, deletion of `getServerSession()`) are landed before implementation begins.

## 2. Decisions locked

| Question | Choice |
|---|---|
| Stripe UI mode | `ui_mode: 'custom'` (Stripe Custom Checkout product) |
| Trial signup flow | Card upfront, 7-day trial |
| Cancellation timing | Cancel at period end (`cancel_at_period_end: true`) |
| Reactivation | One-click before period end |
| MAS detail display | Read-only from DB row, no real-time Apple refresh |
| Failed-payment notification | Site-wide banner + `/account` card + transactional email |
| Subscription state strategy | Centralized state module (Approach 2 — "Surgical + foundation") |
| Sync Engine | Already enabled in Supabase; remains the source for table updates |
| Webhook scope | Thin `stripe-webhook` function for email triggers only — does NOT write to subscriptions table |
| Stripe customer dedup | `customer_email` on checkout sessions (no pre-creation) |
| Pricing source | Stripe price catalog via new `list-prices` edge function |
| Email provider | Resend (Deno SDK) |

## 3. Scope

### In scope

- **State module:** `_shared/subscription-state.ts` with typed `SubscriptionStatus`, `mapStripeStatus()`, valid-transitions table
- **Idempotency:** Stripe idempotency keys on every `checkout.sessions.create`, `subscriptions.update`, `billingPortal.sessions.create`
- **Cross-environment cleanup:** wrapper that detects stale `stripe_subscription_id` and clears it
- **Edge function `list-prices`:** GET /list-prices?lookup_keys=...
- **Edge function `stripe-webhook`:** thin, email triggers only (`invoice.payment_failed`, `customer.subscription.trial_will_end`, `customer.subscription.deleted`)
- **Email helper:** `_shared/email.ts` + three HTML templates
- **Delete `confirm-checkout-session`** edge function (after verifying desktop app doesn't use it)
- **Modify** `create-checkout-session`, `finalize-checkout-session`, `update-subscription-interval`, `toggle-auto-renew`, `billing-portal` (idempotency, state module, MAS detection, customer_email, 7-day trial, theme passthrough)
- **DB:** new `subscriptions_resolved` view exposing derived `is_premium`, `is_in_trial`, `is_past_due`, `is_canceled`, `effective_end_date`
- **Website `/buy/plans`:** rebuild with auth-aware CTAs, Stripe-sourced prices, working frequency toggle
- **Website `/checkout`:** rebuild with `<CustomCheckoutProvider>` + `<PaymentElement>` + theme passthrough
- **Website `/account`:** state-aware subscription card (7 states: free, trialing, active, canceled, past_due, expired, MAS), cancel-at-period-end + reactivate UI, "Welcome to Premium" toast
- **Site-wide:** `<PastDueBanner>` rendered in `layout.tsx` below Header

### Out of scope (hard "no" list)

- ❌ MAS purchase flow on the website — desktop app only
- ❌ Real-time refresh of MAS subscription state from Apple — read-only from `iap-webhook`-synced row
- ❌ Pre-creating Stripe customers at signup — `customer_email` handles dedup
- ❌ React-email or @react-email/components — three plain HTML templates
- ❌ Subscription history / audit table
- ❌ Refunds / pro-rated cancellation
- ❌ Coupon / promo code UI on website (Stripe Checkout supports them by default if enabled in dashboard)
- ❌ Per-seat / team plans
- ❌ Multi-currency UX (Stripe returns whatever currency the price catalog has)
- ❌ Replacing Sync Engine with a full webhook handler — Sync Engine continues to own the `subscriptions` table
- ❌ Welcome / payment-receipt emails — Stripe sends payment receipts automatically

## 4. Subscription state model

### Canonical statuses

```ts
// supabase/functions/_shared/subscription-state.ts

export type SubscriptionStatus =
  | 'free'      // no active subscription
  | 'pending'   // checkout session created, not yet finalized
  | 'trialing'  // in 7-day trial
  | 'active'    // paid, current period
  | 'past_due'  // renewal failed, Stripe retrying
  | 'canceled'  // user cancelled; will end at period_end
  | 'expired';  // period ended, no recovery
```

### Stripe status → canonical mapping

```ts
export function mapStripeStatus(s: Stripe.Subscription): SubscriptionStatus {
  if (s.cancel_at_period_end && s.status === 'active') return 'canceled';
  if (s.cancel_at_period_end && s.status === 'trialing') return 'canceled';
  switch (s.status) {
    case 'trialing': return 'trialing';
    case 'active': return 'active';
    case 'past_due': return 'past_due';
    case 'unpaid':
    case 'canceled':
    case 'incomplete_expired': return 'expired';
    case 'incomplete': return 'pending';
    case 'paused': return 'past_due'; // treat pause same as past_due for UI purposes
    default: return 'expired';
  }
}
```

### Derived fields (computed in the `subscriptions_resolved` SQL view)

| Field | Definition |
|---|---|
| `is_premium` | `status IN ('trialing', 'active', 'canceled')` — user retains Premium access |
| `is_in_trial` | `status = 'trialing'` |
| `is_past_due` | `status = 'past_due'` |
| `is_canceled` | `status = 'canceled'` |
| `effective_end_date` | Trial end if trialing; `current_period_end` if canceled; null otherwise |
| `display_billing_period` | `'monthly'` / `'yearly'` derived from `billing_period` lookup key |
| `card_last4` | Last 4 of card (if Sync Engine syncs `stripe.payment_methods`; otherwise omit from card display — degrades gracefully to "Card on file" without the last-4 detail) |
| `card_brand` | Card brand (Visa, etc.) — same caveat as `card_last4` |

### Valid transitions (defensive)

| From | Valid → | Notes |
|---|---|---|
| `free` | `pending`, `trialing`, `active` | Subscription started |
| `pending` | `trialing`, `active`, `free` | Checkout finalized or abandoned |
| `trialing` | `active`, `canceled`, `expired`, `past_due` | Trial → paid / cancelled / payment failed |
| `active` | `canceled`, `past_due`, `expired` | Normal lifecycle |
| `past_due` | `active`, `expired`, `canceled` | Recovery or final loss |
| `canceled` | `active`, `expired`, `trialing` | Reactivation pre-period-end / final / restart |
| `expired` | `pending`, `trialing`, `active` | Resubscribe |

Invalid transitions log a warning (don't block — Sync Engine pushes through whatever Stripe sends).

## 5. Backend changes

### New: `_shared/subscription-state.ts`

Contents: types, `mapStripeStatus()`, `VALID_TRANSITIONS`, helper `assertTransition(prev, next)` that logs (doesn't throw).

### New: `_shared/email.ts`

```ts
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

export async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'Touch Typer <hello@touch-typer.kochie.io>',
    to,
    subject,
    html,
  });
  if (error) console.error('email send failed', { to, subject, error });
  // Don't throw; email failure shouldn't break the webhook handler.
}
```

Templates in `_shared/email-templates/`:
- `trial-ending.html` — substitutions: `{{firstName}}`, `{{daysLeft}}`, `{{cancelUrl}}`, `{{continueUrl}}`
- `payment-failed.html` — substitutions: `{{firstName}}`, `{{retryDate}}`, `{{updateUrl}}`, `{{invoiceUrl}}`
- `subscription-canceled.html` — substitutions: `{{firstName}}`, `{{resubscribeUrl}}`

Simple `{{var}}` interpolation, no engine.

### New: `list-prices` edge function

```
GET /functions/v1/list-prices?lookup_keys=premium_monthly,premium_yearly

Response:
{
  prices: [
    { lookup_key, id, unit_amount, currency, interval, interval_count, product_name }
  ]
}
```

- `verify_jwt = false` (prices are public marketing data)
- In-memory cache, 5min TTL
- Filters: only return prices matching the requested `lookup_keys`; reject anything else

### New: `stripe-webhook` edge function (thin)

```
POST /functions/v1/stripe-webhook
```

- `verify_jwt = false` (called by Stripe)
- Verifies `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`
- Dispatches on `event.type`:
  - `invoice.payment_failed` → load user from subscription's customer ID → send `payment-failed.html`
  - `customer.subscription.trial_will_end` → load user → send `trial-ending.html`
  - `customer.subscription.deleted` → load user → send `subscription-canceled.html`
- Other event types: 200 OK, ignore
- **Does NOT** write to `subscriptions` table — Sync Engine handles that

### Modified edge functions

| Function | Changes |
|---|---|
| `create-checkout-session` | Add `customer_email: user.email`; set `payment_method_collection: 'always'`; set `trial_period_days: 7`; pass `appearance.theme` from `body.theme`; add idempotency key `${user.id}:checkout:${hour_bucket}`; use state module; clear stale `stripe_subscription_id` if present; defer `billing_plan='premium'` until finalization (already done in quick wins) |
| `finalize-checkout-session` | Use `mapStripeStatus()`; clear `session_id` after successful finalization |
| `update-subscription-interval` | Idempotency key on `subscriptions.update`; use cross-env wrapper; use `mapStripeStatus()` after update |
| `toggle-auto-renew` | Idempotency key; cross-env wrapper; use state module |
| `billing-portal` | Idempotency key; detect MAS users — return `400 {error: 'mas_managed'}` instead of generic Stripe error |

### Deleted

`confirm-checkout-session` — dead code on website. Before deleting, verify desktop app's renderer doesn't invoke it (grep `touch-type/renderer` for the string). If found, leave the function in place and add a `// TODO(deprecated)` comment.

### DB changes

New migration: create `subscriptions_resolved` view per Section 4. View permissions: `SELECT` granted to `authenticated`, RLS inherited from `subscriptions` table.

## 6. Frontend changes

### `/buy/plans` rebuild

```
src/app/buy/plans/page.tsx (server component)
  1. supabase.auth.getUser() (no redirect — page works for anon)
  2. If user: read subscriptions_resolved row for user
  3. supabase.functions.invoke("list-prices", { body: { lookup_keys: ["premium_monthly", "premium_yearly"] } })
  4. Pass prices + subscription to <BuyPlansClient>

<BuyPlansClient> (client component)
  - State: selectedPeriod: 'monthly' | 'yearly'
  - Frequency toggle (Headless UI RadioGroup)
  - Two-card grid: Free, Premium
  - CTA helper getPremiumCta(sub, prices[selectedPeriod]) → button props
  - Soft cancelled banner if URL has ?cancelled=true
```

CTA helper logic (see Section 6 of the brainstorming summary in Section 2 of this spec — kept inline for clarity):

```ts
function getPremiumCta(sub: SubscriptionResolved | null, price: Price): CtaProps {
  if (!sub || sub.status === 'free') {
    return { label: "Start 7-day free trial", href: `/checkout?price=${price.lookup_key}`, variant: "accent" };
  }
  if (sub.billing_service === 'APPLE') {
    return { label: "Manage in App Store", href: "/account", variant: "secondary" };
  }
  switch (sub.status) {
    case 'trialing':
    case 'active':
      return { label: "You're already Premium", href: "/account", variant: "ghost", disabled: true };
    case 'canceled':
      return { label: "Resume subscription", href: "/account#reactivate", variant: "accent" };
    case 'past_due':
      return { label: "Update payment", href: "/account#recover", variant: "accent" };
    case 'expired':
      return { label: "Resubscribe", href: `/checkout?price=${price.lookup_key}`, variant: "accent" };
    case 'pending':
      return { label: "Resume checkout", href: "/checkout", variant: "secondary" };
  }
}
```

### `/checkout` rebuild

```
src/app/checkout/page.tsx (server component)
  1. getUser() — redirect /signin if anon
  2. Read ?price=<lookup_key> from search params; default to monthly
  3. supabase.functions.invoke("create-checkout-session", {
       body: { lookup_key, theme: cookieTheme || 'light' }
     })
  4. Receive { clientSecret, sessionId }
  5. Render <CheckoutClient clientSecret={...} />

<CheckoutClient> (client component, wraps Stripe's Custom Checkout provider)
  <CheckoutProvider stripe={stripePromise} options={{ clientSecret, fetchClientSecret? }}>
    <PaymentForm />
  </CheckoutProvider>

<PaymentForm> (client; uses Stripe's Custom Checkout hook)
  - <PaymentElement /> (Stripe-rendered iframes: card, Apple Pay, Link, Google Pay)
  - Order summary card (read from the checkout hook's session/line-item data)
  - Trial copy: "Free for 7 days, then ${price/month}"
  - Submit button: confirms via the hook's confirm() function
  - On success: Stripe redirects to success_url
  - On error: inline error display

Implementation note: the exact React component and hook names are version-dependent in `@stripe/react-stripe-js`. The current 5.6.0 may export them as `<CheckoutProvider>` + `useCheckout()` or as a Custom-prefixed variant. Confirm the exact API names at implementation time against the installed version's d.ts; the architectural shape (provider wraps form; hook gives access to confirm + line items) is the same regardless.
```

Theme handling: the website reads the user's resolved theme from `next-themes` server-side (via cookie) and passes it in the `create-checkout-session` body. The session's `appearance.theme` is set at creation time. **Mid-checkout theme switching is not supported** — would require re-creating the session, which is more disruptive than the benefit.

### `/account` rebuild

```
src/app/account/page.tsx (server component)
  1. getUser() — redirect /signin if anon
  2. Read subscriptions_resolved row + URL params (?welcome=premium, ?session_id=...)
  3. Render <AccountLayout>
       <SubscriptionCard subscription={...} />
       <UserDetailsCard /> (existing)
       <ChangePasswordCard /> (existing)
       <MfaCard /> (existing)
       <DangerZoneCard /> (sign out, delete account — existing)
  4. If ?welcome=premium present: client-side useEffect shows toast + router.replace('/account')

<SubscriptionCard> (server component, dispatches by status)
  - sub.billing_service === 'APPLE' → <MasManagedCard />
  - status === 'free' → <FreeCard />
  - status === 'pending' → <PendingCard /> ("Resume your checkout")
  - status === 'trialing' → <TrialingCard countdownDays={...} />
  - status === 'active' → <ActiveCard renewsOn={...} />
  - status === 'canceled' → <CanceledCard accessUntil={...} />
  - status === 'past_due' → <PastDueCard nextRetryOn={...} />
  - status === 'expired' → <ExpiredCard endedOn={...} />

Each *Card is a server component with a small client subcomponent for the action buttons.
```

Card actions:
- **TrialingCard** "Cancel trial" → confirm modal → `toggle-auto-renew` (sets `cancel_at_period_end: true`)
- **ActiveCard** "Cancel at period end" → confirm modal → `toggle-auto-renew` → flip to CanceledCard
- **CanceledCard** "Reactivate" → `toggle-auto-renew` (sets `cancel_at_period_end: false`) → flip to ActiveCard
- **PastDueCard** "Update payment" → `billing-portal` (Stripe portal, opens in new tab)
- **All non-MAS cards** "Manage payment methods" → `billing-portal`

Confirm modals use Headless UI Dialog (we already have it). Modal copy explicit about period-end behavior: *"You'll keep Premium until [date]. Reactivate any time before then with one click."*

### `<PastDueBanner>`

```
src/components/PastDueBanner.tsx (server component)
  - Reads getUser() + subscriptions_resolved
  - Returns null if not signed in, not past_due, or on /account
  - Otherwise renders a sticky banner (top of page, below header):
      "Payment failed. Update your payment method to keep Premium." [Update]
  - Dismissible per-session via a client subcomponent (localStorage)
```

**Performance:** rendered in `layout.tsx`. The Header already does `getUser()` per request. Add a request-scoped helper `lib/get-user-and-subscription.ts` that uses Next 15+'s `cache()` (or React's `cache()` if not on canary) so the supabase call dedupes across Header + PastDueBanner + Page. Single DB roundtrip per request.

## 7. File structure

```
WEBSITE (touch-typer.kochie.io)
src/
├── app/
│   ├── account/page.tsx                          # MODIFIED: state-aware subscription card
│   ├── buy/plans/page.tsx                        # REWRITTEN
│   ├── checkout/page.tsx                         # REWRITTEN
│   └── layout.tsx                                # MODIFIED: add <PastDueBanner />
├── components/
│   ├── AccountSettings/
│   │   ├── SubscriptionCard.tsx                  # NEW (dispatcher)
│   │   └── subscription-states/                  # NEW directory
│   │       ├── FreeCard.tsx
│   │       ├── PendingCard.tsx
│   │       ├── TrialingCard.tsx
│   │       ├── ActiveCard.tsx
│   │       ├── CanceledCard.tsx
│   │       ├── PastDueCard.tsx
│   │       ├── ExpiredCard.tsx
│   │       ├── MasManagedCard.tsx
│   │       └── CancelConfirmModal.tsx
│   ├── Payment/                                  # REWRITTEN
│   │   ├── index.tsx                             # CheckoutClient wrapper
│   │   └── PaymentForm.tsx                       # useCustomCheckout hook composition
│   ├── BuyPlans/                                 # NEW directory
│   │   ├── BuyPlansClient.tsx
│   │   ├── FrequencyToggle.tsx
│   │   └── PlanCard.tsx
│   └── PastDueBanner.tsx                         # NEW
├── lib/
│   ├── get-user-and-subscription.ts              # NEW (request-scoped fetch)
│   └── subscription-resolved.ts                  # NEW (types matching the SQL view)

BACKEND (touch-type-backend)
supabase/
├── functions/
│   ├── _shared/
│   │   ├── subscription-state.ts                 # NEW
│   │   ├── email.ts                              # NEW
│   │   ├── email-templates/
│   │   │   ├── trial-ending.html                 # NEW
│   │   │   ├── payment-failed.html               # NEW
│   │   │   └── subscription-canceled.html        # NEW
│   │   └── stripe.ts                             # MODIFIED (cross-env wrapper)
│   ├── create-checkout-session/index.ts          # MODIFIED
│   ├── finalize-checkout-session/index.ts        # MODIFIED
│   ├── update-subscription-interval/index.ts     # MODIFIED
│   ├── toggle-auto-renew/index.ts                # MODIFIED
│   ├── billing-portal/index.ts                   # MODIFIED
│   ├── confirm-checkout-session/                 # DELETED (after desktop-app check)
│   ├── list-prices/index.ts                      # NEW
│   └── stripe-webhook/index.ts                   # NEW
├── migrations/
│   └── 20260514_subscriptions_resolved_view.sql  # NEW
└── config.toml                                   # MODIFIED: add stripe-webhook + list-prices (verify_jwt = false)
```

## 8. Environment variables

### Backend (Supabase edge function secrets)

- `RESEND_API_KEY` — NEW
- `STRIPE_WEBHOOK_SECRET` — NEW (from Stripe dashboard when wiring the webhook endpoint)
- Existing: `STRIPE_SECRET_KEY`, `STRIPE_RETURN_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.

### Website (Vercel)

- Existing: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- No new vars required.

## 9. Dependencies

### Backend (Deno via `npm:` prefix)

- `npm:resend` — Email provider SDK
- Existing: `npm:stripe`, Supabase JS client

### Website

- Update `@stripe/react-stripe-js` if needed to a version supporting `<CustomCheckoutProvider>` (currently 5.6.0 — verify it ships Custom Checkout types; bump if not).
- No new direct deps.

## 10. Branch & deploy strategy

**Frontend** continues on the `website-rebuild` branch alongside other Project B work.

**Backend** uses a separate branch `feature/project-b-billing` (off `main` in the `touch-type-backend` repo). User reviews and merges to `main` to trigger Supabase auto-deploy.

**Coordination:** Backend changes must deploy first or simultaneously — the website's new `CustomCheckoutProvider` flow depends on the modified `create-checkout-session` shape (accepts `theme` + `lookup_key`). The `list-prices` and `stripe-webhook` functions must exist before the website calls them.

**Migration order within Project B:**

1. Backend foundation (`subscription-state.ts`, idempotency, `customer_email`, 7-day trial, theme passthrough on `create-checkout-session`)
2. Backend new functions (`list-prices`, `stripe-webhook`, `email.ts`)
3. Backend DB migration (`subscriptions_resolved` view)
4. Deploy backend changes to production Supabase (merge `feature/project-b-billing` → `main`)
5. Stripe Dashboard: configure webhook endpoint pointing at the new function URL + capture `STRIPE_WEBHOOK_SECRET`
6. Website: `/buy/plans` rebuild
7. Website: `/checkout` rebuild
8. Website: `/account` rebuild + `<PastDueBanner>`
9. End-to-end testing in Stripe test mode + Resend test mode
10. Merge website branch to `main` → Vercel production deploy

## 11. Verification (manual)

There is no automated test infrastructure in either repo, consistent with prior project specs. Pre-merge verification:

- **Build:**
  - Website: `pnpm build` succeeds; `npx tsc --noEmit` clean
  - Backend: `supabase functions serve` starts; all functions deploy clean via `supabase functions deploy`

- **Stripe test mode happy path:**
  1. Sign up new user
  2. Visit `/buy/plans` → frequency toggle works → click "Start 7-day free trial"
  3. Land on `/checkout`, enter test card `4242 4242 4242 4242` + future expiry + any CVC
  4. Submit → Stripe redirects → land on `/account?welcome=premium`
  5. Toast appears; URL cleans up after a beat
  6. `<TrialingCard>` shows "5 days remaining" (or similar)
  7. Click "Manage payment methods" → Stripe portal opens
  8. Back in app, click "Cancel trial" → confirm modal → click "Cancel" → flips to `<CanceledCard>`
  9. Click "Reactivate" → flips back to `<TrialingCard>`

- **Past_due path:** Use Stripe test card `4000 0000 0000 0341` (succeeds initial, declines renewal)
  1. Subscribe normally
  2. Use Stripe CLI: `stripe trigger invoice.payment_failed`
  3. Within ~5 sec: `<PastDueBanner>` appears site-wide
  4. `/account` shows red `<PastDueCard>` with retry date
  5. Resend dashboard: email logged for `payment-failed.html`

- **Trial ending email:** `stripe trigger customer.subscription.trial_will_end` → Resend dashboard shows `trial-ending.html`

- **Cancellation email:** Wait for / manually trigger `customer.subscription.deleted` → Resend dashboard shows `subscription-canceled.html`

- **MAS detection:** Insert synthetic row with `billing_service='APPLE'`, `billing_plan='premium'`, `status='active'`, no `stripe_customer_id`
  1. `/account` shows `<MasManagedCard>`
  2. Clicking "Manage in App Store" opens the appropriate deep link
  3. `/buy/plans` shows "Manage in App Store" instead of "Start trial"

- **Cross-env recovery:** Set `stripe_subscription_id` to a fake ID like `sub_synthetic` in DB
  1. `update-subscription-interval` is called
  2. The cross-env wrapper catches `resource_missing`, clears the field
  3. User sees `free` state on next page load (recovery rather than 500 error)

- **Idempotency:** Double-click "Start trial" in dev tools → only one Stripe session created (check Stripe dashboard's Logs view)

- **Lighthouse:** `/account` and `/buy/plans` ≥ 90 Performance, ≥ 95 Accessibility in both light and dark themes

- **Stripe webhook signature verification:** Send a request with an invalid `Stripe-Signature` header → function returns 400, no email sent

## 12. Sequencing for implementation plan

The plan should produce these atomic-commit groups in order:

1. **Backend foundation** — `subscription-state.ts`, `email.ts`, idempotency helpers, cross-env wrapper additions to `_shared/stripe.ts`
2. **Backend DB** — `subscriptions_resolved` view migration
3. **Backend new functions** — `list-prices`, `stripe-webhook` + email templates
4. **Backend modified functions** — `create-checkout-session`, `finalize-checkout-session`, `update-subscription-interval`, `toggle-auto-renew`, `billing-portal`
5. **Backend cleanup** — delete `confirm-checkout-session` (after desktop-app grep verifies no usage)
6. **Website new shared lib** — `lib/get-user-and-subscription.ts`, `lib/subscription-resolved.ts`
7. **Website `/buy/plans` rebuild**
8. **Website `/checkout` rebuild**
9. **Website `/account` subscription-card states**
10. **Website `<PastDueBanner>`**
11. **Pre-merge verification** + Stripe dashboard webhook configuration
12. **Push to remote**

## 13. Boundaries with future work

Items deferred to a future project (not Project B):

- **Coupon / promo code UX** — Stripe supports them by default if enabled in dashboard. Surface them in Custom Checkout via Stripe's UI; no website UI work needed in this project.
- **Annual discount calculation on toggle** — display whatever the Stripe price catalog returns (e.g., "$28/year (save $8)" copy if catalog gives us yearly $28 and monthly $2.99). Custom annual-discount math UI is deferred.
- **Subscription downgrades / mid-tier changes** — only one tier exists (Free vs Premium). When/if a second paid tier exists, the `update-subscription-interval` function can be generalized to `update-subscription-price`.
- **Failed payment retry from app** — user has to use Stripe portal. A "Retry now" button calling `subscriptions.update` to force retry is deferred.
- **Receipt downloads** — Stripe provides hosted invoice URLs. Surfacing them in `/account` history is deferred.
- **Subscription pause** — not in Stripe price catalog or product; deferred.
- **Multi-user / family plan** — out of scope; current model is one subscription per user.

## 14. Open questions deferred to implementation

- Exact copy for email templates (subjects, body) — drafts in implementation plan; final copy a user judgment call
- Exact card visual layout for each of the 8 subscription card states — implementation-time visual polish
- Exact wording on confirm modals — drafts in plan, refined during implementation
- Whether MAS deep link should be `macappstore://apps.apple.com/app/id1637786724` or the universal HTTPS link — implementation-time check
