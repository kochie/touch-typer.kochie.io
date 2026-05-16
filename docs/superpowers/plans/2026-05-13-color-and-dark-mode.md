# Color Amplification & Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bolder use of the existing accent blue across the marketing site, plus site-wide dark mode (system-default + explicit header toggle) using `next-themes` and a GitHub/Linear-adjacent Cool Dark palette. Per the spec at `docs/superpowers/specs/2026-05-13-color-and-dark-mode-design.md`.

**Architecture:** Split design tokens into theme-aware (flip on `[data-theme="dark"]`) and never-swap (literal-locked) groups. Marketing surfaces use `tone="paper"`/`tone="paper-soft"` which we redefine to map to theme-aware Tailwind classes (`bg-bg` / `bg-bg-elevated`). Always-dark surfaces (Footer, Code Mode, FinalCTA) keep using never-swap `bg-ink`/`bg-ink-soft`. `next-themes` provides the toggle infrastructure with no-flash inline script. ~15 atomic commits on the existing `website-rebuild` branch.

**Tech Stack:** Next 16, React 19, Tailwind v4, `next-themes` (new dep), FontAwesome Pro, Supabase SSR, Stripe SDKs (untouched), TypeScript 5.9.

---

## Preconditions

- [ ] **P1:** Confirm working directory and branch.

```bash
cd /Users/kochie/projects/touch-typer/touch-typer.kochie.io
git branch --show-current
git status --short
```

Expected: branch is `website-rebuild`. Status may show `.env.local`, `pnpm-workspace.yaml`, and `docs/superpowers/plans/` as untracked (or otherwise ignored) — those are local-only artifacts. No tracked changes pending.

All subsequent task paths are relative to `/Users/kochie/projects/touch-typer/touch-typer.kochie.io`.

---

## Task 1: Add `next-themes` dependency

**Files:**
- Modify: `package.json`
- Generated: `pnpm-lock.yaml`

- [ ] **Step 1: Add the dep**

```bash
pnpm add next-themes --config.blockExoticSubdeps=false
```

- [ ] **Step 2: Verify the diff**

```bash
git diff package.json
```

Expected: `next-themes` added to `devDependencies` (match the repo's convention of listing everything under devDependencies).

- [ ] **Step 3: Smoke check**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add next-themes"
```

---

## Task 2: Expand design tokens (accent variants + theme-aware bg/fg)

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Update `src/styles/tokens.css`**

Replace the file contents with:

```css
/* Design tokens — single source of truth for color.
 * Surfaced as Tailwind v4 theme tokens via the @theme directive in main.css.
 *
 * Two groups:
 *   - Never-swap: paper/paper-soft, ink/ink-soft, mute, line — literal hex,
 *     used by surfaces locked to a specific tone (Footer, Code Mode, FinalCTA).
 *   - Theme-aware: bg/bg-elevated, fg/fg-muted, border, accent-soft, accent-bright
 *     — flip on [data-theme="dark"]. Used by everything that should follow theme.
 */

:root {
  /* Never-swap neutrals (light-literal values) */
  --color-ink: #0f1115;
  --color-ink-soft: #1f232b;
  --color-mute: #6b7280;
  --color-line: #e5e5e0;
  --color-paper-soft: #f3f3ef;
  --color-paper: #fafaf9;

  /* Never-swap accent base + deep (same hue both themes) */
  --color-accent: #2d85d2;
  --color-accent-deep: #1e5e96;

  /* State colors (never-swap) */
  --color-warm: #d97757;
  --color-good: #16a34a;
  --color-warn: #d97706;
  --color-bad: #dc2626;

  /* Theme-aware (light values) */
  --color-bg: #fafaf9;
  --color-bg-elevated: #f3f3ef;
  --color-fg: #0f1115;
  --color-fg-muted: #6b7280;
  --color-border: #e5e5e0;
  --color-accent-soft: #cfe2f3;
  --color-accent-bright: #4ba0e8;
}

[data-theme="dark"] {
  --color-bg: #0d1117;
  --color-bg-elevated: #161b22;
  --color-fg: #f0f6fc;
  --color-fg-muted: #8b949e;
  --color-border: #30363d;
  --color-accent-soft: rgba(45, 133, 210, 0.18);
  --color-accent-bright: #58a6ff;
}
```

- [ ] **Step 2: Update `src/styles/main.css`**

Replace the `@theme { ... }` block content with the expanded set. The full file should look like:

```css
@import "tailwindcss";
@import "./tokens.css";

@theme {
  --color-ink: var(--color-ink);
  --color-ink-soft: var(--color-ink-soft);
  --color-mute: var(--color-mute);
  --color-line: var(--color-line);
  --color-paper-soft: var(--color-paper-soft);
  --color-paper: var(--color-paper);
  --color-accent: var(--color-accent);
  --color-accent-deep: var(--color-accent-deep);
  --color-warm: var(--color-warm);
  --color-good: var(--color-good);
  --color-warn: var(--color-warn);
  --color-bad: var(--color-bad);

  /* NEW theme-aware tokens */
  --color-bg: var(--color-bg);
  --color-bg-elevated: var(--color-bg-elevated);
  --color-fg: var(--color-fg);
  --color-fg-muted: var(--color-fg-muted);
  --color-border: var(--color-border);
  --color-accent-soft: var(--color-accent-soft);
  --color-accent-bright: var(--color-accent-bright);

  --font-sans: var(--font-sans), -apple-system, system-ui, "Segoe UI", sans-serif;
  --font-mono: var(--font-mono), ui-monospace, "Menlo", monospace;
}

html {
  scroll-behavior: smooth;
}

@keyframes blink-cursor {
  0%, 50%   { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}

@layer utilities {
  .cursor-blink {
    animation: blink-cursor 1s steps(1, end) infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .cursor-blink { animation: none; opacity: 1; }
  }

  /* Accent shadow for amplified-color treatments */
  .shadow-accent {
    box-shadow: 0 4px 20px -2px rgba(45, 133, 210, 0.35);
  }
  .shadow-accent-glow {
    box-shadow: 0 16px 48px -8px rgba(45, 133, 210, 0.25);
  }
}

@layer components {
  .prose-styles p { margin-bottom: 1em; }
  .prose-styles p:last-child { margin-bottom: 0; }
  .prose-styles strong { font-weight: 600; color: var(--color-fg); }
  .prose-styles em { font-style: italic; }
  .prose-styles ul { list-style: disc; padding-left: 1.25em; margin-bottom: 1em; }
  .prose-styles ol { list-style: decimal; padding-left: 1.25em; margin-bottom: 1em; }
  .prose-styles li { margin-bottom: 0.25em; }
  .prose-styles a { color: var(--color-accent); text-decoration: underline; }
  .prose-styles a:hover { color: var(--color-accent-deep); }
  .prose-styles code { font-family: var(--font-mono); font-size: 0.9em; background: var(--color-bg-elevated); padding: 0.1em 0.3em; border-radius: 0.25em; }
}
```

(Note: `prose-styles strong` and `prose-styles code` are switched to use the theme-aware `--color-fg` and `--color-bg-elevated` so changelog entries adapt in dark mode.)

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

Expected: build compiles successfully (the prerender phase may warn about a `metadataBase`/Supabase env if env vars aren't set; those are acceptable baseline).

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/main.css
git commit -m "feat(tokens): expand for theme-aware bg/fg + accent-soft/bright + accent shadows"
```

---

## Task 3: Update `Section` primitive — theme-aware `paper` tones

**Files:**
- Modify: `src/components/ui/Section.tsx`

- [ ] **Step 1: Update the tone map**

Replace the file contents with:

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "paper" | "paper-soft" | "ink" | "ink-soft";
type Density = "compact" | "default" | "spacious";

// paper / paper-soft are now theme-aware (flip with theme).
// ink / ink-soft stay never-swap (always dark in both themes).
const tones: Record<Tone, string> = {
  paper: "bg-bg text-fg",
  "paper-soft": "bg-bg-elevated text-fg",
  ink: "bg-ink text-paper",
  "ink-soft": "bg-ink-soft text-paper",
};

const densities: Record<Density, string> = {
  compact: "py-12 sm:py-16",
  default: "py-20 sm:py-28",
  spacious: "py-28 sm:py-40",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: Tone;
  density?: Density;
}

export function Section({
  children,
  tone = "paper",
  density = "default",
  className,
  id,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(tones[tone], densities[density], className)}
      {...rest}
    >
      {children}
    </section>
  );
}
```

The only semantic change: `tone="paper"` now uses `bg-bg text-fg` (theme-aware) instead of `bg-paper text-ink` (never-swap). Existing callers don't need to change.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Section.tsx
git commit -m "refactor(ui): Section paper tones now theme-aware; ink tones stay never-swap"
```

---

## Task 4: Update `Card` primitive — `emphasis="gradient"` + theme-aware tones

**Files:**
- Modify: `src/components/ui/Card.tsx`

- [ ] **Step 1: Replace the component**

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type CardTone = "paper" | "paper-soft" | "ink";
type Emphasis = "default" | "featured" | "gradient";

// paper / paper-soft are theme-aware; ink stays never-swap.
const tones: Record<CardTone, string> = {
  paper: "bg-bg border-border",
  "paper-soft": "bg-bg-elevated border-border",
  ink: "bg-ink border-ink-soft text-paper",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: CardTone;
  emphasis?: Emphasis;
}

export function Card({
  children,
  tone = "paper",
  emphasis = "default",
  className,
  ...rest
}: CardProps) {
  // emphasis="gradient" overrides tone styling with an accent gradient — used by Premium pricing card.
  const gradientClasses =
    emphasis === "gradient"
      ? "bg-gradient-to-br from-accent to-accent-deep border-transparent text-paper shadow-accent"
      : tones[tone];

  return (
    <div
      className={clsx(
        "rounded-xl border p-6",
        gradientClasses,
        emphasis === "featured" && "border-fg shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat(ui): Card emphasis=gradient (accent gradient for Premium pricing)"
```

---

## Task 5: Update `Button` primitive — theme-aware focus rings

**Files:**
- Modify: `src/components/ui/Button.tsx`

- [ ] **Step 1: Update the variants and base classes**

Find the `variants` object and `base` string and update them to use theme-aware focus rings. Replace those two declarations in `src/components/ui/Button.tsx` with:

```tsx
const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft focus-visible:ring-fg",
  secondary: "bg-bg text-fg border border-border hover:bg-bg-elevated focus-visible:ring-fg",
  ghost: "bg-transparent text-fg hover:bg-bg-elevated focus-visible:ring-fg",
  accent: "bg-accent text-paper hover:bg-accent-deep focus-visible:ring-accent",
  inverse: "bg-paper text-ink hover:bg-paper-soft focus-visible:ring-paper",
};

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "disabled:opacity-50 disabled:cursor-not-allowed";
```

The other parts of the file (sizes, the `Button` component itself, types) stay unchanged.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "refactor(ui): Button focus rings + secondary/ghost surfaces are theme-aware"
```

---

## Task 6: Wrap app in `<ThemeProvider>` + `suppressHydrationWarning`

**Files:**
- Modify: `src/app/Providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read existing `src/app/Providers.tsx`**

```bash
cat src/app/Providers.tsx
```

Take note of what other providers it composes (Supabase provider, etc.).

- [ ] **Step 2: Update `src/app/Providers.tsx`** to wrap children in `<ThemeProvider>`

Add the import and wrap the existing return value. Example shape (adjust to match the existing providers, keeping all of them in their current order):

```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
// ... other existing imports (SupabaseProvider, etc.)

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* preserve whatever other providers were already nested here */}
      {children}
    </ThemeProvider>
  );
}
```

If the existing file already has a `"use client"` directive and other providers, keep them — only ADD the ThemeProvider wrap at the outermost layer.

- [ ] **Step 3: Add `suppressHydrationWarning` to `<html>` in `src/app/layout.tsx`**

Find the `<html lang="en" className={...}>` line and change to:

```tsx
<html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
```

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

Build should still succeed.

- [ ] **Step 5: Commit**

```bash
git add src/app/Providers.tsx src/app/layout.tsx
git commit -m "feat(theme): wrap app in next-themes ThemeProvider; suppress hydration warning"
```

---

## Task 7: ThemeToggle component

**Files:**
- Create: `src/components/Header/ThemeToggle.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/pro-duotone-svg-icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the right theme on the client. Render a
  // placeholder until mounted so the SSR markup doesn't claim a wrong icon.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg/80"
      >
        <span className="block h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg/80 hover:bg-bg-elevated transition-colors"
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="h-4 w-4" />
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header/ThemeToggle.tsx
git commit -m "feat(theme): ThemeToggle component (sun/moon, mount-guarded)"
```

---

## Task 8: Insert ThemeToggle into Header + theme-aware logo swap

**Files:**
- Modify: `src/components/Header/index.tsx`

- [ ] **Step 1: Replace `src/components/Header/index.tsx`**

```tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DownloadMenu } from "./DownloadMenu";
import { MobileSheet } from "./MobileSheet";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderLogo } from "./HeaderLogo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="Touch Typer home">
            <HeaderLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-fg/80 hover:text-fg transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button href={signedIn ? "/account" : "/signin"} variant="ghost" size="md">
              {signedIn ? "Account" : "Sign in"}
            </Button>
            <DownloadMenu />
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <MobileSheet signedIn={signedIn} />
          </div>
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 2: Create the `HeaderLogo` client subcomponent**

The header is a server component but the logo needs `useTheme()` to swap variants. Create `src/components/Header/HeaderLogo.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function HeaderLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // During SSR + initial paint, render the light-mode logo. After mount, swap if needed.
  // (The image dimensions stay constant, so no layout shift.)
  const src = mounted && resolvedTheme === "dark" ? "/logo-white.svg" : "/logo-ink.svg";

  return (
    <Image
      src={src}
      alt="Touch Typer"
      width={730}
      height={284}
      priority
      className="h-8 w-auto"
    />
  );
}
```

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Header/index.tsx src/components/Header/HeaderLogo.tsx
git commit -m "feat(header): theme toggle + theme-aware logo swap"
```

---

## Task 9: Update MobileSheet — toggle + theme-aware logo + theme-aware surface

**Files:**
- Modify: `src/components/Header/MobileSheet.tsx`

- [ ] **Step 1: Replace `src/components/Header/MobileSheet.tsx`**

```tsx
"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

interface MobileSheetProps {
  signedIn: boolean;
}

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const downloadLinks = [
  { href: "https://apps.apple.com/au/app/touch-typer/id1637786724", label: "Mac App Store" },
  { href: "https://www.microsoft.com/store/apps/9NG3CCFL631D", label: "Microsoft Store" },
  { href: "https://snapcraft.io/touch-typer", label: "Snap Store (Linux)" },
];

export function MobileSheet({ signedIn }: MobileSheetProps) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc = mounted && resolvedTheme === "dark" ? "/logo-white.svg" : "/logo-ink.svg";

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="p-2 text-fg md:hidden"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="ml-auto h-full w-full max-w-sm bg-bg p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Image src={logoSrc} alt="Touch Typer" width={730} height={284} className="h-7 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 text-fg">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-base text-fg hover:bg-bg-elevated"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-muted mb-2">
                Download
              </p>
              <div className="flex flex-col gap-1">
                {downloadLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-3 py-2 text-sm text-fg hover:bg-bg-elevated"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <Button href={signedIn ? "/account" : "/signin"} variant="secondary" size="md">
                {signedIn ? "Account" : "Sign in"}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header/MobileSheet.tsx
git commit -m "feat(header): mobile sheet uses theme-aware surfaces + logo swap"
```

---

## Task 10: Bolder Hero — pill eyebrow, headline underline, accent CTA, gradient + blob

**Files:**
- Modify: `src/components/marketing/Hero.tsx`

- [ ] **Step 1: Replace `src/components/marketing/Hero.tsx`**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { StoreBadge } from "@/components/ui/StoreBadge";

export function Hero() {
  return (
    <Section
      tone="paper"
      density="spacious"
      className="relative overflow-hidden bg-gradient-to-br from-accent-soft to-bg"
    >
      {/* Decorative radial blob top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,133,210,0.18), transparent 70%)",
        }}
      />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <span className="inline-block bg-accent text-paper rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
            New — Real-time PvP duels
          </span>

          <h1 className="mt-5 text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Practice typing. Get measurably{" "}
            <span className="text-accent border-b-4 border-accent pb-1">
              faster
              <span
                className="cursor-blink inline-block w-[3px] h-[0.9em] bg-accent align-[-0.1em] ml-1"
                aria-hidden
              />
            </span>
            .
          </h1>

          <p className="mt-6 text-lg text-fg/70 max-w-2xl leading-relaxed">
            Touch Typer is the desktop typing tutor that turns deliberate practice into real progress.
            Free and open source. Mac, Windows, Linux.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="#download" variant="accent" size="lg" className="shadow-accent">
              Download free
            </Button>
            <Button href="/features" variant="secondary" size="lg">
              See features
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <StoreBadge store="mac" />
            <StoreBadge store="ms" />
            <StoreBadge store="snap" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/Hero.tsx
git commit -m "feat(hero): pill eyebrow, headline underline, accent CTA + gradient wash + blob"
```

---

## Task 11: BigFeatureBlock — accent media frame + glow

**Files:**
- Modify: `src/components/marketing/BigFeatureBlock.tsx`

- [ ] **Step 1: Find the media-frame div and update its classes**

In `src/components/marketing/BigFeatureBlock.tsx`, find the `<div>` that wraps the `<Image>` (the one currently with `className="rounded-xl border border-line bg-paper-soft p-2 shadow-sm"`) and replace its className with:

```tsx
className="rounded-xl border border-accent bg-bg-elevated p-2 shadow-accent-glow"
```

(Keep the inner `<Image>` and the surrounding column structure intact.)

Also: change the body text from `text-ink/70` to `text-fg/70` so it follows theme. And the "Learn more" link's hover from `hover:text-accent-deep` is already correct — leave it.

- [ ] **Step 2: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/BigFeatureBlock.tsx
git commit -m "feat(big-feature): accent media-frame border + glow; theme-aware body text"
```

---

## Task 12: PricingTeaser + /pricing — Premium card uses `emphasis="gradient"`

**Files:**
- Modify: `src/components/marketing/PricingTeaser.tsx`
- Modify: `src/app/pricing/page.tsx`

- [ ] **Step 1: PricingTeaser — switch the Premium card**

In `src/components/marketing/PricingTeaser.tsx`, find the `<Card tone="paper" emphasis="featured">` for the Premium tier and change it to `<Card emphasis="gradient">`. Also update the inner text classes that depended on the old card background:

- Premium card `<Eyebrow tone="accent">Premium · Most popular</Eyebrow>` → change to `<Eyebrow tone="default">Premium · Most popular</Eyebrow>` (since the gradient card already has paper text; the accent eyebrow color would clash). Then update Eyebrow to render `<span className="...text-paper/80 ...">` style — but that's a per-call concern; simpler is to pass an explicit className: `<Eyebrow tone="default" className="!text-paper/80">Premium · Most popular</Eyebrow>`.
- Premium card price: keep `text-4xl font-bold`. It inherits `text-paper` from Card's gradient emphasis — works.
- Cadence text `<small>` and the `<div className="text-xs text-mute mt-1">` → change `text-mute` to `text-paper/70`.
- Feature list `<ul className="...text-sm text-ink/80">` → change to `text-sm text-paper/90`.
- "Go Premium" button: change `<Button href="/buy/plans" variant="primary" size="md">` to `<Button href="/buy/plans" variant="inverse" size="md">` (paper button on the gradient looks better than ink button).
- "Compare →" button: change `<Button href="/pricing" variant="ghost" size="md">` to add `className="!text-paper/80 hover:!text-paper hover:bg-paper/10"` so it's readable on the gradient.

The Free card and other surrounding chrome stay unchanged.

- [ ] **Step 2: /pricing page — same Premium card swap**

In `src/app/pricing/page.tsx`, find the same Premium card (`<Card tone="paper" emphasis="featured">`) and apply the same set of edits as Step 1: change to `<Card emphasis="gradient">`, override the inner text classes for paper-on-gradient legibility, swap the "Go Premium" button to `variant="inverse"`.

The Free card and PricingMatrix below stay unchanged.

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/PricingTeaser.tsx src/app/pricing/page.tsx
git commit -m "feat(pricing): Premium cards use gradient emphasis"
```

---

## Task 13: FinalCTA — accent Mac button

**Files:**
- Modify: `src/components/marketing/FinalCTA.tsx`

- [ ] **Step 1: Update the Mac download button**

In `src/components/marketing/FinalCTA.tsx`, change the first `<Button>` (the one with `href="https://apps.apple.com/au/app/touch-typer/id1637786724"`) from `variant="inverse"` to `variant="accent"` and add `className="shadow-accent"`. The other two buttons (Windows, Linux) stay `variant="inverse"`.

Also: change body paragraph from `text-paper/70` to stay `text-paper/70` (no change — it's on the always-dark `tone="ink"` section, so paper text is correct).

- [ ] **Step 2: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/FinalCTA.tsx
git commit -m "feat(final-cta): Mac download CTA uses accent variant + shadow"
```

---

## Task 14: Tier2Grid + FeatureMarquee — accent hover + Tier2 glyph

**Files:**
- Modify: `src/components/marketing/Tier2Grid.tsx`
- Modify: `src/components/marketing/FeatureMarquee.tsx`
- Modify: `src/components/ui/FeatureGlyph.tsx`

- [ ] **Step 1: FeatureGlyph — allow tone override**

In `src/components/ui/FeatureGlyph.tsx`, add a `tone` prop:

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";
type Tone = "ink" | "accent";

const sizes: Record<Size, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  accent: "bg-accent text-paper",
};

interface FeatureGlyphProps {
  icon: IconDefinition;
  size?: Size;
  tone?: Tone;
  className?: string;
  ariaLabel?: string;
}

export function FeatureGlyph({
  icon,
  size = "md",
  tone = "ink",
  className,
  ariaLabel,
}: FeatureGlyphProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
```

- [ ] **Step 2: Tier2Grid — use accent glyph + accent hover**

In `src/components/marketing/Tier2Grid.tsx`:

- Change the `<FeatureGlyph icon={item.icon} size="sm" ariaLabel={item.title} />` to `<FeatureGlyph icon={item.icon} size="sm" tone="accent" ariaLabel={item.title} />`.
- Change `<Card key={item.title} tone="paper-soft">` if you want hover: this Card doesn't currently have a hover state. Leave it unless you also want a `hover:border-accent/40` — for consistency with FeatureMarquee add `className="transition-colors hover:border-accent/40"`.
- Change body text `text-sm text-ink/70` to `text-sm text-fg/70` (theme-aware).
- Change the heading `<div className="mt-4 font-semibold">` — no change needed (no color).
- The big intro h2 currently has no explicit color — leave it.

- [ ] **Step 3: FeatureMarquee — accent hover**

In `src/components/marketing/FeatureMarquee.tsx`, change the Card invocation from `<Card tone="paper" className="h-full transition-colors hover:border-ink/40">` to `<Card tone="paper" className="h-full transition-colors hover:border-accent/40">`. Also change `text-xs text-mute` to `text-xs text-fg-muted` for the blurb.

(Don't change the FeatureGlyph tone in FeatureMarquee — those stay ink per spec to avoid visual noise in the 5-up grid.)

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/FeatureGlyph.tsx src/components/marketing/Tier2Grid.tsx src/components/marketing/FeatureMarquee.tsx
git commit -m "feat(marketing): Tier2 glyph + hover use accent; FeatureMarquee hover accent"
```

---

## Task 15: Companion page token migration — marketing-adjacent surfaces

**Files (all modify):**
- `src/components/AccountSettings/index.tsx`, `UserDetails.tsx`, `ChangePasswordForm.tsx`, `MfaSection.tsx`, `SettingsMenu.tsx` (or whichever files exist under that dir — confirm with `ls`)
- `src/components/PlanSelection/index.tsx`
- `src/components/Payment/index.tsx`
- `src/components/SignIn/index.tsx`
- `src/components/SignUp/index.tsx`
- `src/components/ForgotPassword/index.tsx`
- `src/components/LeaderboardSection/index.tsx`
- `src/app/account/page.tsx`
- `src/app/buy/plans/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/signin/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/privacy/page.tsx`

This is a mechanical token rename across these files. **No logic changes.** Walk each file and apply these substitutions in any `className` strings (or `clsx()` arguments):

| Old utility | New utility |
|---|---|
| `bg-paper` | `bg-bg` |
| `bg-paper-soft` | `bg-bg-elevated` |
| `text-ink` | `text-fg` |
| `text-ink/80` | `text-fg/80` |
| `text-ink/70` | `text-fg/70` |
| `text-ink/60` | `text-fg/60` |
| `text-ink/50` | `text-fg/50` |
| `text-mute` | `text-fg-muted` |
| `text-mute/70` | `text-fg-muted/70` |
| `border-line` | `border-border` |
| `border-line/60` | `border-border/60` |
| `divide-line` | `divide-border` |
| `divide-line/60` | `divide-border/60` |
| `hover:bg-paper-soft` | `hover:bg-bg-elevated` |
| `hover:bg-paper` | `hover:bg-bg` |
| `focus:border-accent focus:ring-accent/20` | `focus:border-accent focus:ring-accent/20` (unchanged — accent isn't theme-aware) |

**Do NOT touch:**
- `bg-ink`, `bg-ink-soft`, `text-paper` — these are intentional always-dark anchors
- Any Formik / Supabase / Stripe / event handler / state code
- Markup structure (no JSX restructuring)
- Inline styles, FontAwesome icons, button variants — these are all unaffected by theme

Suggested sequence to keep commits atomic:

- [ ] **Step 1: AccountSettings + /account/page.tsx**

```bash
ls src/components/AccountSettings/
# apply renames to each .tsx file there + src/app/account/page.tsx
npx tsc --noEmit
git add src/components/AccountSettings src/app/account
git commit -m "refactor(account): migrate to theme-aware tokens (visual only)"
```

- [ ] **Step 2: PlanSelection + Payment + /buy/plans + /checkout**

```bash
# apply renames
npx tsc --noEmit
git add src/components/PlanSelection src/components/Payment src/app/buy src/app/checkout
git commit -m "refactor(billing-pages): migrate to theme-aware tokens (visual only)"
```

- [ ] **Step 3: Auth pages — SignIn, SignUp, ForgotPassword + pages**

```bash
npx tsc --noEmit
git add src/components/SignIn src/components/SignUp src/components/ForgotPassword src/app/signin src/app/signup src/app/forgot-password
git commit -m "refactor(auth): migrate to theme-aware tokens (visual only)"
```

- [ ] **Step 4: LeaderboardSection + /privacy**

```bash
npx tsc --noEmit
git add src/components/LeaderboardSection src/app/privacy
git commit -m "refactor(leaderboard,privacy): migrate to theme-aware tokens (visual only)"
```

- [ ] **Step 5: Build smoke after all four commits**

```bash
pnpm build
```

Expected: compile success. Supabase env / metadataBase warnings during prerender are acceptable baseline.

---

## Task 16: Stripe Elements appearance — wire to resolved theme

**Files:**
- Modify: `src/components/Payment/index.tsx`

- [ ] **Step 1: Read current Stripe Elements setup**

```bash
cat src/components/Payment/index.tsx | head -60
```

Note where `Elements` is invoked and what `options` are passed.

- [ ] **Step 2: Add theme-aware appearance**

In `src/components/Payment/index.tsx`, add `useTheme` from `next-themes` and pass `appearance.theme` to the existing `<Elements options={...}>` call.

Add at the top:

```tsx
"use client";
import { useTheme } from "next-themes";
// ... existing imports
```

Inside the component, where the options object is constructed (or just before `<Elements>`):

```tsx
const { resolvedTheme } = useTheme();
const stripeOptions = {
  // ...existing options (clientSecret, etc.)
  appearance: {
    theme: resolvedTheme === "dark" ? "night" : "stripe" as "stripe" | "night",
  },
};
```

Then pass `stripeOptions` to `<Elements options={stripeOptions}>` (or merge the appearance into whatever existing options object is there).

If the file is already a server component, add `"use client"` at the top — Stripe Elements is client-only anyway.

**Do NOT touch:** the Stripe iframe wrapper, the `loadStripe()` call, or any submit/payment handlers.

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Payment/index.tsx
git commit -m "feat(checkout): wire Stripe Elements appearance to resolved theme"
```

---

## Task 17: Pre-merge sweep

This is manual verification — no code changes.

- [ ] **Build + type-check:**

```bash
pnpm build
npx tsc --noEmit
```

- [ ] **No-flash check:** Hard-reload `/` with macOS in dark mode → expect dark theme on first paint. Repeat with macOS in light mode → expect light. There should be no flash of the wrong theme.

- [ ] **Toggle round-trip:** Click sun/moon in header → theme switches → reload → preference persists. Click again → switches back → reload → persists.

- [ ] **All routes light + dark:** Visit each of these in both themes:
  - `/`, `/features`, `/pricing`, `/changelog`, `/leaderboard`
  - `/account` (signed-in), `/buy/plans`, `/checkout`, `/signin`, `/signup`, `/forgot-password`, `/privacy`

- [ ] **Code Mode** stays terminal-dark in both themes.
- [ ] **Footer** stays its current dark style in both themes.
- [ ] **Hero** shows gradient wash + pill eyebrow + underlined "faster" + accent CTA with shadow in both themes.
- [ ] **Premium pricing card** shows accent gradient in both themes.
- [ ] **`/checkout`:** Stripe iframe theme matches the surrounding page (try dark → expect Stripe night theme). Do NOT attempt actual checkout.
- [ ] **Reduced motion:** Toggle System Preferences → Reduce motion → reload `/` → hero cursor blink stops, entrance animations skip.
- [ ] **Lighthouse Accessibility on `/` in both themes** ≥ 95.

- [ ] **Final polish commit (only if anything was fixed during the sweep):**

```bash
git add -A
git commit -m "chore: final polish pass before merge"
```

- [ ] **Push:**

```bash
git push 2>&1 | tail -5
```

Vercel preview redeploys automatically.

---

## Implementation Notes

- **DRY:** The token-aware classes (`bg-bg`, `text-fg`, etc.) replace per-component dark variants. No `dark:` Tailwind variants are written by hand — the `[data-theme="dark"]` selector in `tokens.css` handles all swaps via CSS custom properties.
- **YAGNI:** No automated tests (per spec). No system-preference subscribe (next-themes handles it). No theme transitions / animations between modes (disabled via `disableTransitionOnChange`).
- **Mount-guard pattern:** `ThemeToggle` and `HeaderLogo` both render placeholder/light variant until mounted to avoid hydration mismatches. This is a well-known next-themes pattern.
- **Atomic commits:** 17 tasks → ~17 commits. The companion-page migration task is split into 4 sub-commits internally for readability.
- **No Footer touch:** Spec decision — Footer stays always-dark in both themes. Confirms during pre-merge sweep.

## Project B Reminders

If any of these surface during implementation, **log them, don't fix them:**
- Stripe webhook reconciliation gaps
- Plan-switching proration weirdness
- `billing-portal` redirect failures
- Cross-environment subscription artifacts
- New-customer first-time checkout failures
- Streak-freeze purchase flow
- Subscription state stale or wrong on `/account`
- The pre-existing `getSession()` → `getUser()` regressions in checkout/PlanSelection
- The missing `src/middleware.ts` session refresh
  - (Note: there is currently a `src/proxy.ts` that handles session refresh; on Next 16 it replaces middleware. Don't touch it in this change.)

Log file: `docs/superpowers/notes/project-b-billing-bugs.md`
