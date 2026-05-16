# Project B: Billing & Misc Bug Notes

## Pre-existing concerns (do not fix in Phase 9 reskin tasks)

- **`luxon` in `LeaderboardSection/index.tsx`**: The component imports `Duration` from `luxon` for time formatting (`Duration.fromMillis(score.time).rescale().toFormat("m:s.SSS")`). The task spec mentioned this may have been migrated to Temporal already — it has not. `luxon` is still in use as of Task 34. If `luxon` is not in `package.json` or is being removed, this will break. Fix in a dedicated cleanup task.

## Auth security regressions on main (pre-date Project A — log only, fix in Project B)

Surfaced during the final overall review of `feature/website-rebuild-2026-05`. Each of these existed on `main` BEFORE the rebuild branch was created — they are not regressions introduced by Project A's commits, but they are real critical issues that need to be addressed in Project B:

- **`src/app/checkout/page.tsx`: `getSession()` used instead of `getUser()`** (line 47 in current branch state; line 28 on main before our reskin). `getSession()` reads the session cookie without server-side JWT validation. A tampered or replayed cookie could pass this auth guard. Replace with `supabase.auth.getUser()` for server-validated identity.
- **`src/components/PlanSelection/index.tsx`: same `getSession()` regression** (line 121-124). This file was never touched during Project A. Same fix as above.
- **`src/middleware.ts`: file does not exist on `main`**. Supabase SSR requires Next.js middleware to refresh JWTs between requests. Without it, sessions go stale after roughly an hour and server-component auth guards fail unpredictably. The file existed in earlier history at commit `ca5840b fix: add session-refresh middleware, replace getSession with getUser, add /account auth guard` but has since been deleted on main. Project B must restore a minimal `createServerClient` + `getUser()` middleware.

These three bugs together represent a session-refresh and auth-validation gap that was the subject of a previous round of fixes (per project memory "May 2026 bug fix rounds: getSession→getUser") but appears to have regressed before Project A started. They must be addressed when Project B reimplements billing/auth.

## Stripe Embedded Checkout — server-side theming required

Discovered during the color+dark-mode work (Phase 6, Task 16). The Payment component uses `<EmbeddedCheckoutProvider>` from `@stripe/react-stripe-js`, not classic `<Elements>`. Embedded Checkout's appearance (including dark/light theme) is **NOT configurable from the React provider** — it must be set in the Stripe Checkout Session at creation time via the Stripe API.

For dark mode to apply to the embedded checkout iframe, the Supabase edge function `create-checkout-session` needs to:

1. Accept a `theme` parameter (or read it from request headers / cookie)
2. Pass `ui_mode: "embedded"` + an `appearance` config to `stripe.checkout.sessions.create({ ... })` per https://stripe.com/docs/payments/checkout/customization

The Payment component on the client side then receives the pre-themed embedded session via clientSecret as today; no React-layer changes needed.

Scope for Project B: extend create-checkout-session to read the user's theme preference and theme the embedded checkout session accordingly. Until then, the Stripe iframe defaults to Stripe's standard light theme regardless of site theme.
