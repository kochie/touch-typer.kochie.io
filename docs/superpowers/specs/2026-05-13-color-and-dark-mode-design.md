# Color Amplification & Dark Mode — Design Spec

**Date:** 2026-05-13
**Project:** `touch-typer.kochie.io` (continuation on `website-rebuild` branch)
**Status:** Approved by user; ready for implementation plan
**Prior spec:** `2026-05-13-website-rebuild-design.md`

## 1. Purpose

The website rebuild shipped a clean editorial design that reads as competent but generic — "every other AI-generated site." This change adds two interrelated dimensions of distinctiveness:

1. **Bolder use of the existing accent blue** so the site has more visual identity without changing its underlying personality.
2. **Site-wide dark mode** with system-preference default + explicit user toggle, applied to marketing and companion pages.

The accent stays a single hue (`#2d85d2`); we don't introduce multi-color theming. The dark theme uses cool-dark neutrals (GitHub/Linear-adjacent) to pair cleanly with the blue accent.

## 2. Scope

### In scope

- New tokens: `accent-soft`, `accent-bright`, plus theme-aware `bg`, `bg-elevated`, `fg`, `fg-muted`, `border`
- Bolder accent treatments on Hero, BigFeatureBlock, PricingTeaser/Matrix, FinalCTA, Tier2Grid, FeatureMarquee
- `next-themes` integration: ThemeProvider, system-preference default, explicit toggle in Header + MobileSheet
- Dark theme palette (D1 Cool Dark) wired via `[data-theme="dark"]` selector
- Companion page token migration (`bg-paper` → `bg-bg`, etc.) — visual only, no logic changes
- Stripe Elements `appearance.theme` wired to resolved theme
- Logo variant swap based on resolved theme (Header / MobileSheet)

### Out of scope (hard "no" list)

- ❌ Project B billing fixes — auth `getSession→getUser`, missing middleware, etc.
- ❌ OG image dark variant — `/opengraph-image` stays light (OG previews are out-of-context)
- ❌ New tests or test infrastructure
- ❌ Multi-hue feature theming (rejected during brainstorming in favor of single accent)
- ❌ Per-page custom illustrations or Lottie animations
- ❌ Refactoring Code Mode beyond the `tone="terminal"` migration
- ❌ Behavioral changes to billing, auth, or any companion-page logic

## 3. Decisions locked

| Question | Choice |
|---|---|
| Color direction | B — Bolder (single accent, made louder) |
| Dark trigger | c — Both (system default + explicit toggle) |
| Dark scope | ii — Whole site (marketing + companion) |
| Dark palette | D1 — Cool Dark (GitHub/Linear-adjacent neutrals) |
| Theme persistence | `next-themes` library |
| Footer in dark theme | Stays always-dark (does not flip with theme) |
| Code Mode in dark theme | Stays always-dark (terminal aesthetic locked) |
| FinalCTA in dark theme | Stays always-dark (anchor block) |
| OG image | Stays light variant only |

## 4. Token architecture

The token system splits into two groups: **theme-aware** (flip on `[data-theme="dark"]`) and **never-swap** (literal-locked).

### Theme-aware tokens

Used by surfaces that should follow theme:

```css
:root {
  --color-bg:           #fafaf9;
  --color-bg-elevated:  #f3f3ef;
  --color-fg:           #0f1115;
  --color-fg-muted:     #6b7280;
  --color-border:       #e5e5e0;
  --color-accent:       #2d85d2;
  --color-accent-deep:  #1e5e96;
  --color-accent-soft:  #cfe2f3;
  --color-accent-bright:#4ba0e8;
}

[data-theme="dark"] {
  --color-bg:           #0d1117;
  --color-bg-elevated:  #161b22;
  --color-fg:           #f0f6fc;
  --color-fg-muted:     #8b949e;
  --color-border:       #30363d;
  --color-accent:       #2d85d2;
  --color-accent-deep:  #1e5e96;
  --color-accent-soft:  rgba(45,133,210,0.18);
  --color-accent-bright:#58a6ff;
}
```

Exposed as Tailwind utilities via `@theme`: `bg-bg`, `bg-bg-elevated`, `text-fg`, `text-fg-muted`, `border-border`, `bg-accent`, `bg-accent-deep`, `bg-accent-soft`, `text-accent`, `text-accent-bright`, etc.

### Never-swap tokens

The existing `paper` / `paper-soft` / `ink` / `ink-soft` / `mute` / `line` tokens stay defined at their original light-theme hex values and **do not flip with theme**. They're now used only by surfaces locked to a specific tone:

- `bg-ink`, `bg-ink-soft` — always-dark surfaces (Footer, Code Mode, FinalCTA)
- `text-paper` — text on always-dark surfaces
- `bg-paper`, `bg-paper-soft` — kept available for any future always-light surface; not used in this change

This split is deliberate. It lets us keep "the dark sections" anchored visually while everything else inverts cleanly.

## 5. Theme provider

`next-themes` (~3KB) wraps the app:

```tsx
// src/app/Providers.tsx
<ThemeProvider
  attribute="data-theme"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {/* existing supabase provider stays */}
</ThemeProvider>
```

`src/app/layout.tsx` gets `<html suppressHydrationWarning>` to silence the expected mismatch on hydration (next-themes injects an inline script that sets `data-theme` before React hydration).

The library's inline blocking script handles no-flash on first paint when system preference is the chosen theme. Cookie persistence is automatic.

## 6. Theme toggle UI

A new client component `src/components/Header/ThemeToggle.tsx`:

- Uses `useTheme()` from `next-themes`
- Icon: `faSun` (FA Pro Duotone) when theme is dark, `faMoon` when light. Renders a placeholder until mounted to avoid hydration mismatch.
- Click toggles between `light` and `dark`. (We do not expose a "system" choice in the UI; on first visit system preference seeds the default, after that the explicit choice persists.)
- `aria-label` reflects current state.
- Placed in `Header/index.tsx` between Sign in and the Download dropdown.
- Mirrored in `MobileSheet.tsx`, positioned top-right next to the close button.

## 7. B-bolder treatments per section

### Hero (`Hero.tsx`)

- **Background:** gradient wash — light: `bg-gradient-to-br from-accent-soft to-bg` with a soft radial blob top-right (`radial-gradient(circle, rgba(45,133,210,0.15), transparent 70%)`); dark: same gradient using the rgba version of `accent-soft`
- **Eyebrow:** pill — `bg-accent text-paper rounded-full px-3 py-1` (replaces the current colored-text version)
- **Headline `<em>faster</em>`:** keeps `text-accent` color, adds `border-b-4 border-accent pb-1` underline emphasis
- **Primary CTA:** `Button variant="accent"` (replaces current `variant="primary"`) with new `shadow-accent` class
- **Secondary CTA:** unchanged
- **Store badge row:** unchanged

### BigFeatureBlock (`BigFeatureBlock.tsx`)

- **Media frame:** `border-accent` (replaces `border-line`) plus `shadow-accent-glow` class (`0 16px 48px -8px rgba(45,133,210,0.25)`)
- **Title `<h2>`:** unchanged
- **Eyebrow:** unchanged (already supports accent tone via prop)

### PricingTeaser & `/pricing` page

- **Premium card:** new `Card emphasis="gradient"` variant — `bg-gradient-to-br from-accent to-accent-deep text-paper` with `shadow-accent`. Replaces current `emphasis="featured"`.
- **Free card:** unchanged
- **PricingMatrix:** unchanged

### FinalCTA (`FinalCTA.tsx`)

- **Section:** stays `tone="ink"` but updated so `tone="ink"` is never-swap (always-dark). Implementation: `tone="ink"` keeps using `bg-ink` literal, which is in the never-swap group.
- **"Download for Mac" button:** changes to `variant="accent"` with `shadow-accent` (the recommended platform default)
- **Other two buttons:** stay `variant="inverse"` (paper bg on dark)

### Tier2Grid (`Tier2Grid.tsx`)

- **Card hover:** `hover:border-accent/40` (replaces `hover:border-ink/40`)
- **FeatureGlyph:** `bg-accent` (replaces `bg-ink`)

### FeatureMarquee (`FeatureMarquee.tsx`)

- **Card hover:** `hover:border-accent/40` (replaces `hover:border-ink/40`)
- **FeatureGlyph:** stays `bg-ink` (five-up tight grid; all-accent would be visual noise)

### Header & Footer

- **Header:** `bg-paper/80 backdrop-blur` → `bg-bg/80 backdrop-blur` (theme-aware). Border `border-line` → `border-border`. Logo swaps via `useTheme()`: `/logo-ink.svg` in light, `/logo-white.svg` in dark.
- **Footer:** stays its current always-dark style (`bg-ink-soft text-paper`). Logo stays `/logo-white.svg`. The Footer is the visual anchor of the page; making it theme-aware adds work without benefit.

### MobileSheet

- Same logo swap as Header
- `bg-paper p-6` → `bg-bg p-6` (theme-aware)
- ThemeToggle placed adjacent to close button at top-right

### Code Mode (`CodeModeSection.tsx`)

- Stays at `tone="ink-soft"` — no code change. `ink-soft` is a never-swap token (always dark), so Code Mode is automatically locked-dark in both themes once the Section primitive's tone mapping is updated below.
- Hand-authored syntax tokens inside `CodeBlock` already use literal colors.

### Section primitive update

The `tone` prop's mapping is redefined so the **same prop name keeps its semantic meaning** but maps to different underlying classes:

| Tone prop | Light theme | Dark theme | Mechanism |
|---|---|---|---|
| `tone="paper"` | light surface (current) | dark surface | theme-aware (`bg-bg text-fg`) |
| `tone="paper-soft"` | softly-elevated light (current) | softly-elevated dark | theme-aware (`bg-bg-elevated text-fg`) |
| `tone="ink"` | dark surface (current) | **stays dark** | never-swap (`bg-ink text-paper`) |
| `tone="ink-soft"` | softly-darker (current) | **stays dark** | never-swap (`bg-ink-soft text-paper`) |

So `paper`/`paper-soft` flip with theme, `ink`/`ink-soft` stay anchored. No new tones are added. Marketing sections that should follow theme keep `tone="paper"` or `tone="paper-soft"` and get the flip for free. Sections that should stay dark (Footer, FinalCTA, Code Mode) keep `tone="ink"` / `tone="ink-soft"` and stay anchored.

### Card primitive update

Adds one new emphasis: `emphasis="gradient"` — applies the accent-to-accent-deep gradient + paper text + accent shadow. Used by Premium pricing cards.

### Button primitive update

- Adds a `shadow-accent` class option that any variant can compose (the new pricing/CTA usage applies this)
- Focus rings update to theme-aware (`focus-visible:ring-fg` etc.)

## 8. Companion page token migration

The following components/pages get `bg-paper` → `bg-bg`, `text-ink` → `text-fg`, `border-line` → `border-border`, `text-mute` → `text-fg-muted` renames (Tailwind utility renames; no logic changes). Specifically:

- `src/components/AccountSettings/*.tsx` (UserDetails, ChangePasswordForm, MfaSection, SettingsMenu)
- `src/components/PlanSelection/index.tsx`
- `src/components/Payment/index.tsx`
- `src/components/SignIn/index.tsx`
- `src/components/SignUp/index.tsx`
- `src/components/ForgotPassword/index.tsx`
- `src/components/LeaderboardSection/index.tsx`
- `src/app/account/page.tsx`, `/buy/plans/page.tsx`, `/checkout/page.tsx`, `/signin/page.tsx`, `/signup/page.tsx`, `/forgot-password/page.tsx`, `/privacy/page.tsx`

Pre-existing always-dark elements (e.g. the Footer's `bg-ink-soft`) are left alone. The OpenInAppBanner's `bg-accent/10` etc. stay as-is — they already follow theme via the accent tokens.

## 9. Stripe Elements appearance

`Payment/index.tsx` reads the resolved theme via `useTheme()` and passes the `appearance.theme` option to the Stripe `Elements` provider:

```tsx
const { resolvedTheme } = useTheme();
const stripeOptions = {
  // ...existing options
  appearance: {
    theme: resolvedTheme === "dark" ? "night" : "stripe",
  },
};
```

No iframe innards are touched; just the appearance prop on the wrapper.

## 10. Dependencies

**Add:**
- `next-themes` (~3KB) — theme provider, no-flash inline script, system preference detection

**Stay (unchanged):**
- Existing: Next 16, React 19, Tailwind v4, `@headlessui/react`, FontAwesome Pro packs, `@supabase/ssr` + `supabase-js`, `motion`, `gray-matter`, `next-mdx-remote`, Stripe SDKs, Formik.

## 11. File structure changes

```
src/
├── app/
│   ├── Providers.tsx                # MODIFY: wrap in <ThemeProvider>
│   └── layout.tsx                   # MODIFY: <html suppressHydrationWarning>
├── components/
│   ├── ui/
│   │   ├── Button.tsx               # MODIFY: shadow-accent class, theme-aware focus
│   │   ├── Card.tsx                 # MODIFY: emphasis="gradient"
│   │   └── Section.tsx              # MODIFY: redefine tone="paper"/"paper-soft" as theme-aware
│   ├── Header/
│   │   ├── index.tsx                # MODIFY: insert ThemeToggle, theme-aware logo
│   │   ├── MobileSheet.tsx          # MODIFY: insert ThemeToggle, theme-aware logo
│   │   └── ThemeToggle.tsx          # NEW
│   ├── marketing/
│   │   ├── Hero.tsx                 # MODIFY: pill eyebrow, underline em, accent CTA, blob
│   │   ├── BigFeatureBlock.tsx      # MODIFY: accent border + glow
│   │   ├── PricingTeaser.tsx        # MODIFY: gradient premium card
│   │   ├── PricingMatrix.tsx        # UNCHANGED
│   │   ├── CodeModeSection.tsx      # UNCHANGED (tone="ink-soft" already locks dark)
│   │   ├── FinalCTA.tsx             # MODIFY: accent Mac button
│   │   ├── FeatureMarquee.tsx       # MODIFY: hover accent
│   │   └── Tier2Grid.tsx            # MODIFY: hover accent, glyph bg-accent
│   ├── AccountSettings/*.tsx        # MODIFY: token rename (paper→bg, ink→fg, etc.)
│   ├── PlanSelection/index.tsx      # MODIFY: token rename
│   ├── Payment/index.tsx            # MODIFY: token rename + Stripe appearance prop
│   ├── SignIn/index.tsx             # MODIFY: token rename
│   ├── SignUp/index.tsx             # MODIFY: token rename
│   ├── ForgotPassword/index.tsx     # MODIFY: token rename
│   └── LeaderboardSection/index.tsx # MODIFY: token rename
├── lib/
│   └── theme-bridge.ts              # NEW: tiny useResolvedTheme() re-export
└── styles/
    ├── tokens.css                   # MODIFY: add accent-soft, accent-bright, bg, fg, border + [data-theme="dark"] block
    └── main.css                     # MODIFY: @theme exposes new tokens
```

## 12. Branch & deploy

Continues on the existing `website-rebuild` branch. Atomic commits per logical chunk:

1. Add `next-themes` dep
2. Token expansion (tokens.css + main.css)
3. Section + Card + Button primitive updates
4. ThemeProvider in Providers.tsx + layout suppressHydrationWarning
5. ThemeToggle component
6. Header + MobileSheet integration (toggle + logo swap)
7. Hero bolder treatment
8. BigFeatureBlock accent border + glow
9. PricingTeaser + /pricing premium card gradient
10. FinalCTA accent Mac button
11. Tier2Grid + FeatureMarquee hover/glyph updates
12. Companion page token migration (account, buy, checkout)
13. Companion auth page token migration (signin, signup, forgot-password)
14. Companion misc migration (leaderboard, privacy)
15. Stripe Elements appearance prop wiring

Manual merge to `main` when the user is satisfied with the Vercel preview.

## 13. Verification (manual)

- **Build:** `pnpm build` succeeds. `npx tsc --noEmit` clean.
- **No-flash:** Hard reload `/` with system in dark mode; first paint is dark. Repeat with system in light.
- **Toggle round-trip:** Click toggle → switch → reload → preference persists.
- **All routes** (`/`, `/features`, `/pricing`, `/changelog`, `/leaderboard`, `/account`, `/buy/plans`, `/checkout`, `/signin`, `/signup`, `/forgot-password`, `/privacy`) load cleanly in both themes at 1440 / 1024 / 768 / 375 widths.
- **Code Mode** stays terminal-dark in both themes.
- **Footer** stays its current dark style in both themes.
- **Hero** shows gradient wash + pill eyebrow + headline underline + accent CTA shadow in both themes.
- **Premium pricing card** shows accent gradient in both themes.
- **Stripe `/checkout`:** Stripe iframe inherits `theme: "night"` when site is dark. Do not attempt actual checkout.
- **Reduced motion:** hero cursor blink + entrance reveals respect `prefers-reduced-motion`.
- **Lighthouse Accessibility on `/`** in both themes still ≥95.
- **Project B handoff log:** unchanged — no new entries unless we surface fresh issues during migration.

## 14. Open questions deferred to implementation

- Exact pill eyebrow rounding (full pill vs. soft) — visual call during implementation
- Exact gradient stop positions on hero — tuned against the actual viewport
- Whether the accent radial blob top-right deserves a subtle animation — defer; CSS-only static likely sufficient
