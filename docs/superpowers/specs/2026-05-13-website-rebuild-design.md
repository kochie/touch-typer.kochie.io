# Website Rebuild — Design Spec

**Date:** 2026-05-13
**Project:** `touch-typer.kochie.io`
**Status:** Approved by user; ready for implementation plan
**Sibling spec (forthcoming):** Billing System Reimplementation (Project B)

## 1. Purpose

Rebuild `touch-typer.kochie.io` as a **product showcase + companion hub** that reflects the current desktop app, which has grown well beyond what the existing one-page brochure site communicates. The rebuild is **marketing-led**: prospects see the product clearly, existing users find their account and leaderboard, and the visual presentation matches the maturity the app has reached.

This spec covers **Project A** only. The billing system reimplementation has been carved out as **Project B**, a separate sequential project.

## 2. Scope

### In scope

- **New marketing pages:** `/`, `/features`, `/pricing`, `/changelog`
- **Shared chrome:** new `Header`, `Footer`, design system
- **Public utility:** `/leaderboard` (visual refresh, no behavioral change)
- **Companion utility pages — visual reskin only:** `/account`, `/buy`, `/checkout`, `/signin`, `/signup`, `/forgot-password`, `/privacy`. New chrome and design tokens applied; internal forms, Stripe Elements, Supabase calls, routing all unchanged.
- **SEO + OG:** per-page metadata, dynamic OG images via `next/og`, sitemap, robots, JSON-LD.

### Out of scope (hard "no" list)

- ❌ Behavioral changes to billing or auth flows. Bugs found during the rebuild get logged for **Project B**, not fixed inline.
- ❌ New edge functions, Supabase schema changes, or new tables.
- ❌ Web-based typing playground or any in-browser practice surface.
- ❌ Public profile pages, shareable result pages, or social embeds.
- ❌ CMS, blog, or any content surface beyond the changelog.
- ❌ Analytics provider changes. Fathom stays.
- ❌ New tests or test infrastructure. Manual verification only.

## 3. Sitemap & navigation

```
/                       home — hero, feature previews, social proof, CTA
/features               hub for hero features (single page, anchor-linked)
  #pvp, #ai, #stats, #layouts, #code
/pricing                two-card hero + full feature matrix + FAQ
/changelog              MDX-backed list, newest first
/changelog/rss.xml      RSS feed
/leaderboard            existing route, refreshed against new design system

# Companion utility pages (visual reskin only)
/account
/buy
/checkout
/signin
/signup
/forgot-password
/privacy
/auth/*                 untouched (Supabase callback routes)
/api/*                  untouched
```

**Header (desktop):** `[Logo]  Features · Pricing · Changelog · Leaderboard            [Sign in] [Download ↓]`

The Download CTA is a dropdown showing Mac / Windows / Linux store options inline — install is the primary conversion, not subscription. Signed-in users see `[Account]` instead of `[Sign in]`.

**Header (mobile):** logo + hamburger sheet with the same links + Download options stacked.

**Footer (4 columns):** Product (Features, Pricing, Changelog, Download), Account (Sign in, Sign up, Leaderboard), Legal (Privacy, GitHub, Contact), Brand (logo + tagline).

## 4. Visual system

### Primary — Editorial Precise

Sans-serif (Inter), confident typography, restrained neutral palette with a single accent. Linear / Vercel / Stripe lineage. Sells "this is serious software."

### Contrast — Code Mode block

The Code Mode section breaks out of the editorial system with a monospace/terminal aesthetic (JetBrains Mono on a dark frame). This is the **one** place we use a different visual register; the contrast is intentional and contained.

### Color tokens

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0f1115` | Primary text on light, primary backgrounds on dark |
| `ink-soft` | `#1f232b` | Secondary dark surfaces, code-block backgrounds |
| `mute` | `#6b7280` | Tertiary text, captions, metadata |
| `line` | `#e5e5e0` | Borders, dividers, card outlines |
| `paper-soft` | `#f3f3ef` | Hover/secondary surfaces |
| `paper` | `#fafaf9` | Primary background |
| `accent` | `#2d85d2` | Premium / AI surfaces, single highlight per page |
| `accent-deep` | `#1e5e96` | Accent hover/pressed states |
| `warm` | `#d97757` | Reserved (potential "new" pills) |
| `good` | `#16a34a` | Pricing matrix checks, success toasts |
| `warn` | `#d97706` | Form warnings |
| `bad` | `#dc2626` | Form errors |

Implemented as CSS custom properties in `src/styles/tokens.css`, surfaced as Tailwind theme tokens.

### Type ramp

| Style | Size / Line / Weight | Use |
| --- | --- | --- |
| display | 56 / 1.05 / 700 | Home hero |
| h1 | 40 / 1.1 / 600 | Page headers |
| h2 | 28 / 1.2 / 600 | Section headers |
| h3 | 20 / 1.3 / 600 | Card titles, big-feature subheads |
| body | 16 / 1.6 / 400 | Default paragraph |
| small | 14 / 1.5 / 400 | Captions, metadata |
| eyebrow | 12 / 1.4 / 600 uppercase | Section labels |
| mono | 14 / 1.5 | Code Mode block, numeric stats |

Sans: **Inter** via `next/font/google`. Mono: **JetBrains Mono**. The current `Inconsolata`-as-body is retired.

### Motion

- Library: **`motion`** (~6KB, framer-motion successor) for orchestrated reveals only. CSS transitions for hover/focus states.
- Entrance: 240ms ease-out, 8px upward translate + opacity 0→1, first-time-into-view only.
- Hover: 150ms on transform/border/background.
- One "look at me" element: the blinking cursor in the hero headline.
- Respects `prefers-reduced-motion`: entrance + cursor disabled, hover transitions retained (functional, not decorative).
- No parallax, scroll-jacking, video-with-sound autoplay, or Lottie.

### Iconography

FontAwesome Pro Duotone (per repo convention), used in four contexts only:
- One glyph per hero feature.
- Check / dash in pricing matrix.
- CTA arrows.
- Footer social icons.

No emoji in marketing copy.

## 5. Page anatomies

### 5.1 `/` (home)

Sections, in order:

1. **Hero** — eyebrow ("New: Real-time PvP duels"), display-weight headline with blinking cursor, sub paragraph, two CTAs (Download primary, See features secondary), store-badge row (Mac App Store, MS Store, Snap Store).
2. **Feature marquee** — five hero features as quick-glance cards: PvP, AI Coach, Stats, Multi-layout, Code Mode.
3. **Big-feature block — PvP** (left-image / right-text).
4. **Big-feature block — AI Coach** (reversed, includes "Premium" eyebrow tag).
5. **Big-feature block — Stats**.
6. **Big-feature block — Multi-layout** (reversed).
7. **Code Mode contrast block** — monospace/terminal-styled, dark frame, syntax-highlighted code snippet inline.
8. **Tier-2 feature grid** — heatmap, streaks, goals/challenges, leaderboard.
9. **Social proof strip** — three stats. Copy TBD against real metrics; current placeholders are "10k+ users · Mac/Win/Linux · Open source."
10. **Pricing teaser** — two cards (Free / Premium), link to `/pricing` for full matrix.
11. **Final CTA** — dark block, "Start typing better today", Download CTA.
12. **Footer**.

### 5.2 `/features`

Single long page with anchor nav. Each of the five hero features gets a richer treatment than the home block: header + 1-2 paragraphs of marketing prose + 1-2 supporting images/short videos + inline "Free vs Premium" mini-table where relevant.

Anchors: `#pvp #ai #stats #layouts #code`. No deep technical details — those belong in the desktop app's onboarding.

### 5.3 `/pricing`

Hybrid layout:

1. **Hero** — two cards (Free, Premium), monthly/yearly toggle, 4-5 marquee benefits per card. Premium card visually featured (border emphasis, "Most popular" eyebrow).
2. **Full feature matrix** — ~15 rows × 2 columns, every meaningful Free vs Premium difference, check / dash icons.
3. **FAQ** — accordion of 5-6 entries: free trial, cancellation, Mac App Store vs Stripe, payment methods, open source status, refund policy.

The "Subscribe" CTA links to `/buy`. The actual checkout flow stays as-is during Project A; Project B will rebuild `/buy`, `/checkout`, and the underlying Stripe integration.

### 5.4 `/changelog`

Vertical list, newest first. Each entry: date · version badge · title · 1-3 paragraphs · optional screenshot. Tag pills (e.g., "PvP", "AI", "Bugfix") for visual scanning. RSS feed at `/changelog/rss.xml`.

Source: `src/content/changelog/<YYYY-MM-DD>-<slug>.mdx` with frontmatter:

```yaml
---
version: "1.4.0"
date: "2026-05-13"
title: "Real-time PvP duels"
tags: ["PvP", "Multiplayer"]
---
```

Read at build time via `lib/changelog.ts`. Pure SSG, no runtime MDX fetching.

### 5.5 `/leaderboard`

Existing route. Refresh against the new design system: new Header/Footer, paper-themed table chrome, typography swap, accent color for the current-user row. **No behavioral changes** — same query, pagination, filtering.

### 5.6 Companion-page reskin scope

For each page below: Header/Footer swap, typography swap, button restyle, color tokens applied, container widths normalized. **Internal forms, Stripe Elements, Supabase calls, routing — all unchanged.**

- `/account` — restyle Plan section card, ChangePassword card, SignOut button. Form layout retained.
- `/buy` — restyle the `PlanSelection` radio cards. Toggle group, plan cards, "Continue" button.
- `/checkout` — Stripe Elements wrapper chrome restyled. The Stripe iframe is untouched.
- `/signin`, `/signup`, `/forgot-password` — input field styling per design system, button styling, layout centering. Formik logic unchanged.
- `/privacy` — typography pass, container width normalized. Otherwise unchanged.

## 6. File structure

```
src/
├── app/
│   ├── (marketing)/             # NEW route group — organizational only, no URL impact
│   │   ├── page.tsx             # rewritten home (replaces existing app/page.tsx)
│   │   ├── features/page.tsx    # NEW
│   │   ├── pricing/page.tsx     # NEW
│   │   └── changelog/
│   │       ├── page.tsx         # NEW
│   │       └── rss.xml/route.ts # NEW
│   ├── account/, buy/, …        # existing companion pages STAY at their current paths
│   ├── opengraph-image.tsx      # NEW — dynamic OG via next/og
│   ├── sitemap.ts               # NEW
│   └── robots.ts                # NEW
├── components/
│   ├── ui/                      # NEW — design system primitives
│   │   ├── Button.tsx
│   │   ├── Container.tsx
│   │   ├── Section.tsx
│   │   ├── Eyebrow.tsx
│   │   ├── Card.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── FeatureGlyph.tsx
│   │   └── StoreBadge.tsx
│   ├── marketing/               # NEW — page section components
│   │   ├── Hero.tsx
│   │   ├── FeatureMarquee.tsx
│   │   ├── BigFeatureBlock.tsx
│   │   ├── CodeModeSection.tsx
│   │   ├── Tier2Grid.tsx
│   │   ├── SocialProofStrip.tsx
│   │   ├── PricingTeaser.tsx
│   │   ├── PricingMatrix.tsx
│   │   ├── PricingFAQ.tsx
│   │   └── FinalCTA.tsx
│   ├── Header/                  # REWRITTEN against the new system
│   ├── Footer/                  # REWRITTEN
│   ├── AccountSettings/         # restyled, internals unchanged
│   ├── PlanSelection/           # restyled, internals unchanged
│   ├── Payment/                 # restyled, internals unchanged
│   ├── SignIn/, SignUp/         # restyled, internals unchanged
│   ├── LeaderboardSection/      # restyled, query unchanged
│   ├── ForgotPassword/          # restyled
│   ├── Notification/            # restyled
│   └── OpenInAppBanner.tsx      # restyled
├── content/                     # NEW
│   └── changelog/
│       └── 2026-05-13-pvp-launch.mdx   # one MDX file per release
├── lib/
│   ├── changelog.ts             # NEW — reads MDX from content/changelog
│   └── (existing lib files)
└── styles/
    ├── tokens.css               # NEW — design tokens as CSS custom properties
    └── main.css                 # updated to import tokens.css
```

The `(marketing)` route group is organizational only — Next.js ignores it in URL resolution. Companion pages keep their current paths (no file moves), minimizing diff and risk to working routes.

**Assets to delete:** `assets/haikei-*.svg`, `assets/layered-*.svg`, `assets/stacked-*.svg`, the screen-recording `.mov` files, `assets/analytics.png`, `assets/example_1.png`, `public/og.png`. Replaced by a fresh screenshot capture pass off the current desktop build, plus dynamic OG generation.

## 7. Content model

- **Marketing copy** lives in TSX (`components/marketing/*.tsx`). Type-safe; low frequency of change.
- **Changelog entries** live in `content/changelog/*.mdx` with frontmatter. Read at build time.
- **Pricing matrix rows** live in a single TS const in `components/marketing/PricingMatrix.tsx` so adding a row is one place to edit.

## 8. Dependencies

**Add:**
- `motion` (~6KB) — hero/feature entrance + cursor blink.
- `gray-matter` (~2KB) — changelog MDX frontmatter parsing.

**Remove:**
- `next-seo` — replaced by Next 16 native Metadata API.
- `Inconsolata` Google Font import — replaced by Inter + JetBrains Mono.

**Stay (unchanged):**
- Next 16, React 19, Tailwind v4, `@tailwindcss/forms`, FontAwesome Pro packs, `@headlessui/react`, `@supabase/ssr` + `supabase-js`, Stripe SDKs, Formik, `react-toastify`, Fathom, Sharp, `next-mdx-remote`.

## 9. SEO / metadata / OG

- Per-page `metadata` export using Next 16 Metadata API.
- `app/sitemap.ts` generates `/`, `/features`, `/pricing`, `/changelog`, `/changelog/<each-entry>`, `/leaderboard`. Excludes auth/account routes.
- `app/robots.ts` allows all marketing routes, disallows `/account`, `/checkout`, `/api/*`, `/auth/*`.
- `app/opengraph-image.tsx` generates dynamic OG images per route via `next/og`. Per-page title overlay.
- JSON-LD: `SoftwareApplication` on home, `FAQPage` on `/pricing`, `Article` on each changelog entry.

## 10. Branch & deployment strategy

- **Implementation branch:** `feature/website-rebuild-2026-05`, created off `main`.
- **Worktree:** Implementation runs in a git worktree per superpowers conventions (`using-git-worktrees`) to keep the rebuild isolated from any in-flight work on `main`.
- **Preview deploys:** Vercel auto-creates a per-branch preview URL on push. That URL is the test environment until launch. No additional staging infrastructure needed.
- **Commit hygiene:** Atomic commits per logical chunk (tokens, primitives, Header, Hero, each marketing section, etc.). The repo is public; commit history should read cleanly for anyone browsing it.
- **Merge gate:** Manual. The branch stays open as long as needed. When the user is satisfied with preview-URL testing, the branch merges to `main` and Vercel auto-deploys the rebuild to production. No automatic merge, no time pressure.
- **Rollback:** The branch is the rollback. If the rebuild merges and a critical issue surfaces, revert the merge commit. No `page.old.tsx` shim needed.

## 11. Verification (manual)

There is no automated test infrastructure in this repo and none is added by this project. Pre-merge checklist:

- **Build:** `pnpm build` succeeds. `npx tsc --noEmit` is clean.
- **Visual sweep:** Each of the 11 routes loads under `pnpm dev`, in both light and dark system themes if applicable, at 1440 / 1024 / 768 / 375 widths.
- **Auth round-trip:** Sign in → land on `/account` → sign out. No behavioral change expected; this confirms nothing regressed.
- **Billing smoke:** `/buy` page renders with plan cards. **Do not attempt checkout** — billing is broken; that's Project B's domain.
- **Leaderboard data:** Loads with real rows; current-user highlight works when signed in.
- **Changelog:** At least 3 sample MDX entries render. RSS feed validates against an online RSS validator.
- **OG previews:** Each marketing route's dynamic OG image renders correctly.
- **Lighthouse target:** Home page ≥ 90 Performance, ≥ 95 Accessibility, ≥ 95 SEO. Not a release gate; documented as the goal.
- **Reduced motion:** Toggle system reduce-motion → confirm hero cursor stops, entrance animations skip, hover transitions retained.

## 12. Boundaries with Project B

When implementing Project A, the following are explicit handoffs to Project B and must not be addressed inline:

- The `subscriptions` table read on `/account` showing stale or incorrect data.
- Plan-switching via `update-subscription-interval` not producing expected proration.
- `billing-portal` redirect failures or environment-mismatch errors.
- Stripe webhook reconciliation gaps.
- Streak-freeze purchase flow.
- Cross-environment subscription artifacts (subscription created in one Stripe env, viewed in another).
- New-customer first-time checkout failures.

If any of these surface during Project A work, log them in a Project B notes file (or wherever Project B is being tracked when it kicks off). Do not patch in this branch.

## 13. Open questions deferred to implementation

- Exact copy for the hero headline, sub, and each big-feature block. Drafts will land in the implementation plan, refined during the build.
- Real social-proof numbers (user count, etc.). Placeholders flagged in code for the user to fill in before launch.
- Specific screenshots/videos to use for each big-feature block. Capture pass happens against the current desktop build during implementation.
- FAQ copy on `/pricing`. Drafts during implementation.
