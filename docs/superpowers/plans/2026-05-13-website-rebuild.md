# Website Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `touch-typer.kochie.io` as a marketing-led product showcase + companion hub, per the design spec at `docs/superpowers/specs/2026-05-13-website-rebuild-design.md`. Project A only — billing fixes are deferred to Project B.

**Architecture:** Next 16 App Router (server-rendered on Vercel — confirm in `next.config.js`). New design tokens via Tailwind v4 `@theme` directive in CSS. New UI primitive layer at `src/components/ui/`, new marketing section layer at `src/components/marketing/`. Companion pages keep their current URL paths and internal logic — only chrome and tokens applied. Implementation runs on `feature/website-rebuild-2026-05` in a worktree at `~/projects/touch-typer/touch-typer.kochie.io-rebuild/`. Vercel auto-creates a per-branch preview URL; manual merge to `main` when the user is ready to launch.

**Tech Stack:** Next 16, React 19, TypeScript 5.9, Tailwind v4 (CSS-first config), `@tailwindcss/forms`, `@headlessui/react`, FontAwesome Pro Duotone, Supabase JS/SSR, Stripe SDKs (untouched), Formik (untouched), `next-mdx-remote` + `gray-matter` (new) for changelog, `motion` (new) for animations, Fathom analytics.

---

## Preconditions

- [ ] **P1:** Confirm working directory is clean on `main` and the rebuild branch does not yet exist.

```bash
cd /Users/kochie/projects/touch-typer/touch-typer.kochie.io
git status --short
git branch --list feature/website-rebuild-2026-05
```

Expected: only the pre-existing in-progress changes (auth/set-password, supabase-provider, pnpm-workspace.yaml, auth/callback) — these stay on main and are not part of the rebuild. The branch listing should be empty.

- [ ] **P2:** Create a git worktree for the rebuild.

Use the `superpowers:using-git-worktrees` skill to create:
- Worktree path: `/Users/kochie/projects/touch-typer/touch-typer.kochie.io-rebuild`
- Branch name: `feature/website-rebuild-2026-05`
- Base: `main`

All subsequent task paths are **relative to the worktree root** unless otherwise noted.

- [ ] **P3:** Install dependencies in the worktree.

```bash
cd /Users/kochie/projects/touch-typer/touch-typer.kochie.io-rebuild
pnpm install
```

---

## Phase 1 — Foundations

### Task 1: Dependency updates

**Files:**
- Modify: `package.json`
- Generated: `pnpm-lock.yaml`

- [ ] **Step 1: Add and remove dependencies**

```bash
pnpm add motion gray-matter
pnpm remove next-seo
```

- [ ] **Step 2: Verify the diff**

```bash
git diff package.json
```

Expected: `motion` and `gray-matter` added under `devDependencies` (this repo lists everything under devDependencies — match the existing pattern), `next-seo` removed.

- [ ] **Step 3: Sanity-build to make sure nothing else broke**

```bash
pnpm build
```

Expected: build completes. It may warn about unused `next-seo` imports — those will be cleaned up later.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add motion + gray-matter, remove next-seo"
```

---

### Task 2: Replace fonts (Inconsolata → Inter + JetBrains Mono)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx` (remove old `Inconsolata` import — page itself gets rewritten later, but the import goes now)

- [ ] **Step 1: Update `src/app/layout.tsx`**

Replace the entire file with:

```tsx
import { ReactNode } from "react";

import "@/styles/main.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { Inter, JetBrains_Mono } from "next/font/google";
import Fathom from "./Fathom";
import Providers from "./Providers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head></head>
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto] font-sans antialiased text-ink bg-paper">
        <Fathom />
        <Header />
        <div>
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Remove the old `Inconsolata` import from `src/app/page.tsx`**

In `src/app/page.tsx`, delete the import line `import { Inconsolata } from "next/font/google";` and the line `const inconsolata = Inconsolata({ subsets: ["latin"] });`. Replace the wrapping `<div className={inconsolata.className}>` with a plain `<div>`. The page is being rewritten later — this is just an interim cleanup so the build stays green.

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

Expected: clean. Page may look ugly visually because the new font variables aren't yet referenced by the old page — that's fine, the page is in transit.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat(fonts): swap Inconsolata for Inter + JetBrains Mono"
```

---

### Task 3: Add design tokens

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
/* Design tokens — single source of truth for color and type.
 * Surfaced as Tailwind v4 theme tokens via the @theme directive in main.css. */

:root {
  /* Color */
  --color-ink: #0f1115;
  --color-ink-soft: #1f232b;
  --color-mute: #6b7280;
  --color-line: #e5e5e0;
  --color-paper-soft: #f3f3ef;
  --color-paper: #fafaf9;
  --color-accent: #2d85d2;
  --color-accent-deep: #1e5e96;
  --color-warm: #d97757;
  --color-good: #16a34a;
  --color-warn: #d97706;
  --color-bad: #dc2626;
}
```

- [ ] **Step 2: Wire tokens into Tailwind via `src/styles/main.css`**

Replace `src/styles/main.css` with:

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
}
```

Note: the legacy `typewriter`, `iconHover`, `logoHover`, `logo`, `logoPrimary`, `fillRuleNonZero`, `animated-text`, `animated-cursor` utilities are deleted. They were specific to the old home page.

- [ ] **Step 3: Verify Tailwind sees the new tokens**

Temporarily add a sanity element to `src/app/page.tsx` (revert after the check):

```tsx
<div className="bg-accent text-paper p-4">accent works</div>
```

Run `pnpm dev`, open `http://localhost:3000`, confirm the element renders with blue background. Then revert.

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/styles/main.css
git commit -m "feat(design-system): add color tokens via Tailwind @theme"
```

---

### Task 4: Delete obsolete assets

**Files:**
- Delete the wave dividers, screen recordings, old example/analytics PNGs, the old OG image, the demo video.
- Keep: `src/assets/logo.svg`, `src/assets/logo-color.svg`, `src/assets/logo-dark.png`, `src/assets/logo-white.svg`.

- [ ] **Step 1: Delete the files**

```bash
git rm src/assets/Download_on_the_Mac_App_Store_Badge_US-UK_RGB_wht_092917.svg \
       src/assets/analytics.png \
       src/assets/example_1.png \
       src/assets/layered-peaks-haikei-1.svg \
       src/assets/layered-peaks-haikei.svg \
       src/assets/layered-waves-haikei.svg \
       src/assets/stacked-peaks-haikei.svg \
       src/assets/stacked-steps-haikei.svg \
       "src/assets/Screen Recording 2022-12-04 at 12.38.07 am.mov" \
       "src/assets/Screen Recording 2022-12-04 at 12.38.50 am.mov" \
       public/og.png \
       public/demo.mov
```

- [ ] **Step 2: Confirm nothing else imports them**

```bash
grep -rn "haikei\|example_1\|analytics.png\|Download_on_the_Mac\|Screen Recording" src/ || echo "clean"
```

Expected: `clean`. The old `src/app/page.tsx` will be rewritten in a later task — for now its broken imports get replaced.

- [ ] **Step 3: Strip the broken imports from `src/app/page.tsx`**

Replace `src/app/page.tsx` with a minimal placeholder so the build stays green during the build-out:

```tsx
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Touch Typer",
  description: "Practice typing. Get measurably faster. Free desktop typing tutor for Mac, Windows, and Linux.",
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
};

export default function Page() {
  return (
    <main className="container mx-auto px-6 py-24">
      <h1 className="text-4xl font-semibold">Touch Typer — rebuild in progress</h1>
    </main>
  );
}
```

- [ ] **Step 4: Build + type-check**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(assets): delete obsolete dividers + screen recordings; stub home page"
```

---

## Phase 2 — UI Primitives

All primitives live in `src/components/ui/`. They use Tailwind tokens. None of them carry business logic.

### Task 5: Container primitive

**Files:**
- Create: `src/components/ui/Container.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Width = "narrow" | "default" | "wide";

const widths: Record<Width, string> = {
  narrow: "max-w-2xl",   // 672px — text-heavy pages, changelog entries
  default: "max-w-6xl",  // 1152px — most marketing pages
  wide: "max-w-7xl",     // 1280px — feature blocks with side-by-side media
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  width?: Width;
}

export function Container({
  children,
  width = "default",
  className,
  ...rest
}: ContainerProps) {
  return (
    <div className={clsx("mx-auto px-6 sm:px-8", widths[width], className)} {...rest}>
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
git add src/components/ui/Container.tsx
git commit -m "feat(ui): Container primitive with three width variants"
```

---

### Task 6: Section primitive

**Files:**
- Create: `src/components/ui/Section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "paper" | "paper-soft" | "ink" | "ink-soft";
type Density = "compact" | "default" | "spacious";

const tones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  "paper-soft": "bg-paper-soft text-ink",
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

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Section.tsx
git commit -m "feat(ui): Section primitive with tone + density variants"
```

---

### Task 7: Eyebrow primitive

**Files:**
- Create: `src/components/ui/Eyebrow.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type EyebrowTone = "default" | "accent" | "muted";

const tones: Record<EyebrowTone, string> = {
  default: "text-mute",
  accent: "text-accent",
  muted: "text-mute/70",
};

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: EyebrowTone;
}

export function Eyebrow({
  children,
  tone = "default",
  className,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={clsx(
        "text-xs font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Eyebrow.tsx
git commit -m "feat(ui): Eyebrow primitive"
```

---

### Task 8: Button primitive

**Files:**
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft focus-visible:ring-ink",
  secondary: "bg-paper text-ink border border-line hover:bg-paper-soft focus-visible:ring-ink",
  ghost: "bg-transparent text-ink hover:bg-paper-soft focus-visible:ring-ink",
  accent: "bg-accent text-paper hover:bg-accent-deep focus-visible:ring-accent",
  inverse: "bg-paper text-ink hover:bg-paper-soft focus-visible:ring-paper",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkButtonProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      className,
      children,
      ...rest
    } = props as CommonProps & { className?: string; href?: string };

    const cls = clsx(base, variants[variant], sizes[size], className);

    if ("href" in rest && rest.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat(ui): Button primitive — 5 variants, 3 sizes, button/link polymorphism"
```

---

### Task 9: Card primitive

**Files:**
- Create: `src/components/ui/Card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type CardTone = "paper" | "paper-soft" | "ink";
type Emphasis = "default" | "featured";

const tones: Record<CardTone, string> = {
  paper: "bg-paper border-line",
  "paper-soft": "bg-paper-soft border-line",
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
  return (
    <div
      className={clsx(
        "rounded-xl border p-6",
        tones[tone],
        emphasis === "featured" && "border-ink shadow-sm",
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
git commit -m "feat(ui): Card primitive with featured emphasis"
```

---

### Task 10: CodeBlock primitive

**Files:**
- Create: `src/components/ui/CodeBlock.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={clsx(
        "bg-ink-soft text-paper rounded-xl p-6 overflow-x-auto",
        "font-mono text-sm leading-relaxed",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

/** Inline span helpers for hand-authored syntax highlighting inside CodeBlock. */
export const Token = {
  Keyword: ({ children }: { children: ReactNode }) => (
    <span className="text-accent">{children}</span>
  ),
  Comment: ({ children }: { children: ReactNode }) => (
    <span className="text-mute">{children}</span>
  ),
  String: ({ children }: { children: ReactNode }) => (
    <span className="text-warm">{children}</span>
  ),
  Prompt: ({ children }: { children: ReactNode }) => (
    <span className="text-accent">{children}</span>
  ),
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CodeBlock.tsx
git commit -m "feat(ui): CodeBlock primitive with hand-auth syntax tokens"
```

---

### Task 11: FeatureGlyph primitive

**Files:**
- Create: `src/components/ui/FeatureGlyph.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

interface FeatureGlyphProps {
  icon: IconDefinition;
  size?: Size;
  className?: string;
  ariaLabel?: string;
}

export function FeatureGlyph({
  icon,
  size = "md",
  className,
  ariaLabel,
}: FeatureGlyphProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg bg-ink text-paper",
        sizes[size],
        className,
      )}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/FeatureGlyph.tsx
git commit -m "feat(ui): FeatureGlyph wraps FA icons with consistent sizing"
```

---

### Task 12: StoreBadge primitive

**Files:**
- Create: `src/components/ui/StoreBadge.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import Link from "next/link";
import Script from "next/script";

type Store = "mac" | "snap" | "ms";

interface StoreBadgeProps {
  store: Store;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ms-store-badge": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          productid?: string;
          size?: "small" | "large";
          "window-mode"?: string;
          theme?: "auto" | "light" | "dark";
          language?: string;
          animation?: "on" | "off";
        },
        HTMLElement
      >;
    }
  }
}

export function StoreBadge({ store }: StoreBadgeProps) {
  if (store === "mac") {
    return (
      <Link
        href="https://apps.apple.com/au/app/touch-typer/id1637786724"
        aria-label="Download on the Mac App Store"
        className="inline-block transition-transform hover:-translate-y-0.5"
      >
        <img
          src="https://tools.applemediaservices.com/api/badges/download-on-the-mac-app-store/black/en-us"
          alt="Download on the Mac App Store"
          className="h-12"
        />
      </Link>
    );
  }

  if (store === "snap") {
    return (
      <Link
        href="https://snapcraft.io/touch-typer"
        aria-label="Get it from the Snap Store"
        className="inline-block transition-transform hover:-translate-y-0.5"
      >
        <img
          src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg"
          alt="Get it from the Snap Store"
          className="h-12"
        />
      </Link>
    );
  }

  // ms
  return (
    <>
      <Script
        type="module"
        src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"
        strategy="afterInteractive"
      />
      <ms-store-badge
        productid="9NG3CCFL631D"
        size="large"
        window-mode="full"
        theme="light"
        language="en"
        animation="on"
      />
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
git add src/components/ui/StoreBadge.tsx
git commit -m "feat(ui): StoreBadge primitive consolidates Mac/Snap/MS badges"
```

---

## Phase 3 — Header & Footer

### Task 13: New Header

**Files:**
- Delete: `src/components/Header/` (existing directory and its files)
- Create: `src/components/Header/index.tsx`
- Create: `src/components/Header/DownloadMenu.tsx`
- Create: `src/components/Header/MobileSheet.tsx`

- [ ] **Step 1: Delete the old Header**

```bash
git rm -r src/components/Header
mkdir -p src/components/Header
```

- [ ] **Step 2: Create `src/components/Header/DownloadMenu.tsx`**

```tsx
"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { faApple, faWindows, faLinux } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/Button";

const items = [
  { href: "https://apps.apple.com/au/app/touch-typer/id1637786724", label: "Mac App Store", icon: faApple },
  { href: "https://www.microsoft.com/store/apps/9NG3CCFL631D", label: "Microsoft Store", icon: faWindows },
  { href: "https://snapcraft.io/touch-typer", label: "Snap Store (Linux)", icon: faLinux },
];

export function DownloadMenu() {
  return (
    <Menu as="div" className="relative">
      <MenuButton as={Button} variant="primary" size="md">
        Download <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="mt-2 w-56 rounded-lg border border-line bg-paper p-1 shadow-lg focus:outline-none"
      >
        {items.map((item) => (
          <MenuItem key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-paper-soft data-[focus]:bg-paper-soft"
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </a>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
```

- [ ] **Step 3: Create `src/components/Header/MobileSheet.tsx`**

```tsx
"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import Link from "next/link";
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

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="p-2 text-ink md:hidden"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="ml-auto h-full w-full max-w-sm bg-paper p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Touch Typer</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-base hover:bg-paper-soft"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute mb-2">
                Download
              </p>
              <div className="flex flex-col gap-1">
                {downloadLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-3 py-2 text-sm hover:bg-paper-soft"
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

- [ ] **Step 4: Create `src/components/Header/index.tsx`**

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { DownloadMenu } from "./DownloadMenu";
import { MobileSheet } from "./MobileSheet";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="font-mono">⌨</span>
            <span>Touch Typer</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-ink/80 hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button href={signedIn ? "/account" : "/signin"} variant="ghost" size="md">
              {signedIn ? "Account" : "Sign in"}
            </Button>
            <DownloadMenu />
          </div>

          <MobileSheet signedIn={signedIn} />
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 5: Verify `@/lib/supabase-server` exists**

```bash
ls src/lib/supabase-server* 2>/dev/null || ls src/lib/supabase* 2>/dev/null
```

If `supabase-server.ts` doesn't exist, check what server-side Supabase helper the repo uses (likely `createServerClient` from `@supabase/ssr`). If neither exists, create `src/lib/supabase-server.ts`:

```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — setAll is a no-op there.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 6: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 7: Visual check**

```bash
pnpm dev
```

Open `http://localhost:3000`. Confirm: header sticky, logo + 4 nav links, Sign in + Download menu visible. On mobile width (DevTools 375px), confirm hamburger opens the sheet.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header src/lib/supabase-server.ts 2>/dev/null
git commit -m "feat(header): new sticky header with download menu and mobile sheet"
```

---

### Task 14: New Footer

**Files:**
- Delete: `src/components/Footer/` (existing directory and files)
- Create: `src/components/Footer/index.tsx`

- [ ] **Step 1: Delete the old Footer**

```bash
git rm -r src/components/Footer
mkdir -p src/components/Footer
```

- [ ] **Step 2: Create `src/components/Footer/index.tsx`**

```tsx
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signin", label: "Sign in" },
      { href: "/signup", label: "Sign up" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "mailto:hello@kochie.io", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-soft text-paper">
      <Container width="wide">
        <div className="py-16 grid gap-10 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="font-mono">⌨</span>
              <span>Touch Typer</span>
            </div>
            <p className="mt-3 text-sm text-paper/70 max-w-xs">
              The desktop typing tutor that turns deliberate practice into real progress.
            </p>
            <a
              href="https://github.com/kochie/touch-type"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="mt-4 inline-flex items-center gap-2 text-paper/70 hover:text-paper transition-colors"
            >
              <FontAwesomeIcon icon={faGithub} />
              <span className="text-sm">Open source on GitHub</span>
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/60 mb-3">
                {col.title}
              </p>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-paper/80 hover:text-paper transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-paper/10 py-6 text-xs text-paper/50 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Touch Typer</span>
          <span>Made by <a href="https://kochie.io" className="hover:text-paper">kochie</a></span>
        </div>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Visual check**

```bash
pnpm dev
```

Open `http://localhost:3000`. Confirm footer renders with 4 columns, GitHub link, copyright.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer
git commit -m "feat(footer): new dark footer with 4-column nav"
```

---

## Phase 4 — Marketing Sections

### Task 15: Hero section

**Files:**
- Create: `src/components/marketing/Hero.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StoreBadge } from "@/components/ui/StoreBadge";

export function Hero() {
  return (
    <Section tone="paper" density="spacious">
      <Container width="wide">
        <div className="max-w-3xl">
          <Eyebrow>New — Real-time PvP duels</Eyebrow>
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Practice typing. Get measurably{" "}
            <span className="text-accent">
              faster<span className="cursor-blink inline-block w-[3px] h-[0.9em] bg-accent align-[-0.1em] ml-1" aria-hidden />
            </span>
            .
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-2xl leading-relaxed">
            Touch Typer is the desktop typing tutor that turns deliberate practice into real progress.
            Free and open source. Mac, Windows, Linux.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="#download" variant="primary" size="lg">
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

- [ ] **Step 2: Add Hero to the home page**

Replace `src/app/page.tsx` with:

```tsx
import { Metadata, Viewport } from "next";
import { Hero } from "@/components/marketing/Hero";

const description =
  "Practice typing. Get measurably faster. Free desktop typing tutor for Mac, Windows, and Linux. Real-time PvP, AI coach, and deep stats.";

export const metadata: Metadata = {
  title: "Touch Typer — Practice typing. Get measurably faster.",
  description,
  alternates: { canonical: "https://touch-typer.kochie.io" },
  openGraph: {
    type: "website",
    title: "Touch Typer",
    description,
    url: "https://touch-typer.kochie.io",
    siteName: "Touch Typer",
  },
  twitter: { card: "summary_large_image", site: "@kochie", creator: "@kochie" },
};

export const viewport: Viewport = { themeColor: "#fafaf9" };

export default function Page() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Confirm hero renders: eyebrow, big headline with blue cursor blinking, sub paragraph, two CTAs, store badge row. Cursor should pause when `prefers-reduced-motion: reduce` is set in system settings.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/Hero.tsx src/app/page.tsx
git commit -m "feat(marketing): hero section + home page replacement"
```

---

### Task 16: FeatureMarquee section

**Files:**
- Create: `src/components/marketing/FeatureMarquee.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { FeatureGlyph } from "@/components/ui/FeatureGlyph";
import {
  faSwords,
  faSparkles,
  faChartLine,
  faKeyboard,
  faCode,
} from "@fortawesome/pro-duotone-svg-icons";

const items = [
  { icon: faSwords, name: "Real-time PvP", blurb: "Race anyone, anywhere", href: "/features#pvp" },
  { icon: faSparkles, name: "AI Coach", blurb: "Adaptive practice", href: "/features#ai" },
  { icon: faChartLine, name: "Deep stats", blurb: "Track your progress", href: "/features#stats" },
  { icon: faKeyboard, name: "Any layout", blurb: "QWERTY, Dvorak, Colemak…", href: "/features#layouts" },
  { icon: faCode, name: "Code Mode", blurb: "40+ languages", href: "/features#code" },
];

export function FeatureMarquee() {
  return (
    <Section tone="paper-soft" density="compact">
      <Container width="wide">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <a key={item.name} href={item.href} className="block">
              <Card tone="paper" className="h-full transition-colors hover:border-ink/40">
                <FeatureGlyph icon={item.icon} size="sm" ariaLabel={item.name} />
                <div className="mt-3 font-semibold text-sm">{item.name}</div>
                <div className="mt-1 text-xs text-mute">{item.blurb}</div>
              </Card>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, import and add `<FeatureMarquee />` after `<Hero />`.

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/FeatureMarquee.tsx src/app/page.tsx
git commit -m "feat(marketing): five-up feature marquee under hero"
```

---

### Task 17: BigFeatureBlock section + 4 instances on home

**Files:**
- Create: `src/components/marketing/BigFeatureBlock.tsx`
- Create: `src/components/marketing/blocks/PvpBlock.tsx`
- Create: `src/components/marketing/blocks/AiCoachBlock.tsx`
- Create: `src/components/marketing/blocks/StatsBlock.tsx`
- Create: `src/components/marketing/blocks/LayoutsBlock.tsx`
- Modify: `src/app/page.tsx`
- Placeholder: `public/screenshots/{pvp,coach,stats,layouts}.png`

- [ ] **Step 1: Create the generic `BigFeatureBlock.tsx`**

```tsx
import { ReactNode } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface BigFeatureBlockProps {
  eyebrow: string;
  eyebrowTone?: "default" | "accent";
  title: ReactNode;
  body: ReactNode;
  linkHref: string;
  linkLabel: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  imagePosition?: "left" | "right";
  tone?: "paper" | "paper-soft";
  anchor?: string;
}

export function BigFeatureBlock({
  eyebrow,
  eyebrowTone = "default",
  title,
  body,
  linkHref,
  linkLabel,
  imageSrc,
  imageAlt,
  imagePosition = "right",
  tone = "paper",
  anchor,
}: BigFeatureBlockProps) {
  return (
    <Section tone={tone} id={anchor}>
      <Container width="wide">
        <div className="grid gap-12 items-center md:grid-cols-2">
          <div className={clsx(imagePosition === "left" && "md:order-2")}>
            <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-4 text-base text-ink/70 leading-relaxed max-w-prose">
              {body}
            </p>
            <Link
              href={linkHref}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep"
            >
              {linkLabel} →
            </Link>
          </div>
          <div className={clsx(imagePosition === "left" && "md:order-1")}>
            <div className="rounded-xl border border-line bg-paper-soft p-2 shadow-sm">
              <Image
                src={imageSrc}
                alt={imageAlt}
                className="rounded-lg w-full h-auto"
                width={1200}
                height={760}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add placeholder screenshots**

`touch`-empty PNGs will break Next.js Image at runtime. Generate real 1200×760 placeholder PNGs using `sharp` (already in deps):

```bash
mkdir -p public/screenshots
node -e "
const sharp = require('sharp');
const names = ['pvp', 'coach', 'stats', 'layouts'];
Promise.all(names.map(n =>
  sharp({ create: { width: 1200, height: 760, channels: 3, background: '#f3f3ef' } })
    .png()
    .toFile(\`public/screenshots/\${n}.png\`)
)).then(() => console.log('placeholders generated'));
"
```

Verify all four files exist and are non-empty:

```bash
ls -la public/screenshots/
```

Expected: four `.png` files, each a few KB (not zero bytes). Add a top-of-file comment in `src/app/page.tsx`:

```tsx
// TODO(user): Capture real screenshots before launch.
// Replace public/screenshots/{pvp,coach,stats,layouts}.png with real product captures.
// Target dimensions: 1200×760 PNG at 2x display density.
```

- [ ] **Step 3: Create the four block wrappers**

`src/components/marketing/blocks/PvpBlock.tsx`:

```tsx
import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function PvpBlock() {
  return (
    <BigFeatureBlock
      anchor="pvp"
      eyebrow="Real-time PvP"
      eyebrowTone="accent"
      title="Race friends. Race strangers. Race the clock."
      body="Live 60-second duels with WPM, accuracy, and error feedback as you type. Invite a friend with a shareable link — they don't even need an account to play."
      linkHref="/features#pvp"
      linkLabel="Learn more"
      imageSrc="/screenshots/pvp.png"
      imageAlt="Touch Typer PvP — split-screen race against another player"
      imagePosition="right"
    />
  );
}
```

`src/components/marketing/blocks/AiCoachBlock.tsx`:

```tsx
import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function AiCoachBlock() {
  return (
    <BigFeatureBlock
      anchor="ai"
      eyebrow="AI Coach · Premium"
      eyebrowTone="accent"
      title="Your weakest keys, on a schedule."
      body="AI Coach reads your last 30 days of practice, generates targeted drills for the keys you struggle with, and tells you why your progress stalled."
      linkHref="/features#ai"
      linkLabel="Learn more"
      imageSrc="/screenshots/coach.png"
      imageAlt="Touch Typer AI Coach — drill recommendation panel"
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
```

`src/components/marketing/blocks/StatsBlock.tsx`:

```tsx
import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function StatsBlock() {
  return (
    <BigFeatureBlock
      anchor="stats"
      eyebrow="Analytics"
      title="See progress in numbers and pictures."
      body="WPM and accuracy over time. Per-key heatmaps. Streaks, goals, milestones. Everything synced across your devices."
      linkHref="/features#stats"
      linkLabel="Learn more"
      imageSrc="/screenshots/stats.png"
      imageAlt="Touch Typer stats — WPM chart over 6 months"
      imagePosition="right"
    />
  );
}
```

`src/components/marketing/blocks/LayoutsBlock.tsx`:

```tsx
import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function LayoutsBlock() {
  return (
    <BigFeatureBlock
      anchor="layouts"
      eyebrow="Keyboard layouts"
      title="QWERTY, Dvorak, Colemak — switch in one click."
      body="Practice on the layout you use, or learn a new one. Drills adapt to layout. Switch back any time."
      linkHref="/features#layouts"
      linkLabel="Learn more"
      imageSrc="/screenshots/layouts.png"
      imageAlt="Touch Typer layout picker — Dvorak selected"
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
```

- [ ] **Step 4: Add to home page**

In `src/app/page.tsx`, after `<FeatureMarquee />`:

```tsx
<PvpBlock />
<AiCoachBlock />
<StatsBlock />
<LayoutsBlock />
```

- [ ] **Step 5: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Confirm: four big-feature blocks render in alternating left/right layouts. Tone alternates paper / paper-soft. Anchor IDs work (`/#pvp` should scroll to PvP block).

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/BigFeatureBlock.tsx src/components/marketing/blocks public/screenshots src/app/page.tsx
git commit -m "feat(marketing): BigFeatureBlock + PvP/AI/Stats/Layouts instances"
```

---

### Task 18: CodeModeSection

**Files:**
- Create: `src/components/marketing/CodeModeSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CodeBlock, Token } from "@/components/ui/CodeBlock";

export function CodeModeSection() {
  return (
    <Section tone="ink" density="spacious" id="code">
      <Container width="wide">
        <div className="max-w-3xl">
          <Eyebrow tone="accent">Code Mode</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Practice the syntax you actually write.
          </h2>
          <p className="mt-4 text-base text-paper/70 leading-relaxed">
            Type TypeScript, Python, Rust, Go, and 40+ more languages — with real syntax highlighting,
            real indentation, and the special characters that actually slow you down.
          </p>
        </div>

        <div className="mt-10 max-w-3xl">
          <CodeBlock>
            <Token.Comment>// Practice code in 40+ languages</Token.Comment>{"\n"}
            <Token.Prompt>$</Token.Prompt> touch-typer code --lang=typescript{"\n\n"}
            <Token.Keyword>function</Token.Keyword> wpm(chars: <Token.Keyword>number</Token.Keyword>, seconds: <Token.Keyword>number</Token.Keyword>) {"{"}{"\n"}
            {"  "}<Token.Keyword>return</Token.Keyword> (chars / 5) / (seconds / 60);{"\n"}
            {"}"}{"\n\n"}
            <Token.Comment>// you wrote that in 4.2s · 81 wpm · 0 errors</Token.Comment>
          </CodeBlock>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, after `<LayoutsBlock />`:

```tsx
<CodeModeSection />
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/CodeModeSection.tsx src/app/page.tsx
git commit -m "feat(marketing): Code Mode dark monospace contrast section"
```

---

### Task 19: Tier2Grid

**Files:**
- Create: `src/components/marketing/Tier2Grid.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FeatureGlyph } from "@/components/ui/FeatureGlyph";
import { Card } from "@/components/ui/Card";
import {
  faGrid2,
  faFire,
  faBullseye,
  faTrophy,
} from "@fortawesome/pro-duotone-svg-icons";

const items = [
  { icon: faGrid2, title: "Per-key heatmaps", body: "See your weakest keys at a glance. Color-coded by speed and accuracy." },
  { icon: faFire, title: "Streaks", body: "Build the daily habit. Freeze your streak with weekly bonuses when life happens." },
  { icon: faBullseye, title: "Goals & challenges", body: "Set measurable targets. Level up with structured challenges that adapt to your progress." },
  { icon: faTrophy, title: "Leaderboard", body: "Compete globally — or just with friends. Filter by layout, language, and time window." },
];

export function Tier2Grid() {
  return (
    <Section tone="paper" density="default">
      <Container width="wide">
        <div className="max-w-2xl">
          <Eyebrow>More</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Everything else you'd want in a typing tutor.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.title} tone="paper-soft">
              <FeatureGlyph icon={item.icon} size="sm" ariaLabel={item.title} />
              <div className="mt-4 font-semibold">{item.title}</div>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">{item.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, after `<CodeModeSection />`:

```tsx
<Tier2Grid />
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/Tier2Grid.tsx src/app/page.tsx
git commit -m "feat(marketing): tier-2 feature grid (heatmap/streaks/goals/leaderboard)"
```

---

### Task 20: SocialProofStrip

**Files:**
- Create: `src/components/marketing/SocialProofStrip.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

// TODO(user): Replace these placeholder numbers with real metrics before launch.
const stats = [
  { value: "10k+", label: "Users practicing" },
  { value: "3", label: "Platforms (Mac · Win · Linux)" },
  { value: "MIT", label: "Open source license" },
];

export function SocialProofStrip() {
  return (
    <Section tone="paper-soft" density="compact">
      <Container width="default">
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.1em] text-mute">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, after `<Tier2Grid />`:

```tsx
<SocialProofStrip />
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/SocialProofStrip.tsx src/app/page.tsx
git commit -m "feat(marketing): social proof strip with placeholder metrics"
```

---

### Task 21: PricingTeaser

**Files:**
- Create: `src/components/marketing/PricingTeaser.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const freeFeatures = ["Core typing tests", "Stats & streaks", "Multi-layout", "Real-time PvP"];
const premiumFeatures = [
  "Everything in Free",
  "AI Coach + custom drills",
  "AI insights",
  "Streak freezes weekly",
];

export function PricingTeaser() {
  return (
    <Section tone="paper" density="default">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Free to download. Affordable to upgrade.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          <Card tone="paper">
            <Eyebrow>Free</Eyebrow>
            <div className="mt-3 text-4xl font-bold">$0</div>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {freeFeatures.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="#download" variant="secondary" size="md">
                Download
              </Button>
            </div>
          </Card>
          <Card tone="paper" emphasis="featured">
            <Eyebrow tone="accent">Premium · Most popular</Eyebrow>
            <div className="mt-3 text-4xl font-bold">
              $2.99<span className="text-base font-normal text-mute">/month</span>
            </div>
            <div className="text-xs text-mute mt-1">or $2.39/mo billed yearly</div>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {premiumFeatures.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Button href="/buy" variant="primary" size="md">
                Go Premium
              </Button>
              <Button href="/pricing" variant="ghost" size="md">
                Compare →
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, after `<SocialProofStrip />`:

```tsx
<PricingTeaser />
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/PricingTeaser.tsx src/app/page.tsx
git commit -m "feat(marketing): pricing teaser with Free/Premium cards"
```

---

### Task 22: FinalCTA

**Files:**
- Create: `src/components/marketing/FinalCTA.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <Section tone="ink" density="spacious" id="download">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Start typing better today.
          </h2>
          <p className="mt-4 text-base text-paper/70">
            Free download. No account required to start practicing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="https://apps.apple.com/au/app/touch-typer/id1637786724" variant="inverse" size="lg">
              Download for Mac
            </Button>
            <Button href="https://www.microsoft.com/store/apps/9NG3CCFL631D" variant="inverse" size="lg">
              Download for Windows
            </Button>
            <Button href="https://snapcraft.io/touch-typer" variant="inverse" size="lg">
              Download for Linux
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Add to home page**

In `src/app/page.tsx`, after `<PricingTeaser />`:

```tsx
<FinalCTA />
```

- [ ] **Step 3: Type-check + full home-page visual sweep**

```bash
npx tsc --noEmit
pnpm dev
```

Walk through the home page top to bottom. All 11 sections render in order: Hero, FeatureMarquee, PvpBlock, AiCoachBlock, StatsBlock, LayoutsBlock, CodeModeSection, Tier2Grid, SocialProofStrip, PricingTeaser, FinalCTA. Footer rendered by layout.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/FinalCTA.tsx src/app/page.tsx
git commit -m "feat(marketing): final CTA with three platform downloads — home page complete"
```

---

## Phase 5 — Features Page

### Task 23: `/features` page

**Files:**
- Create: `src/app/features/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { PvpBlock } from "@/components/marketing/blocks/PvpBlock";
import { AiCoachBlock } from "@/components/marketing/blocks/AiCoachBlock";
import { StatsBlock } from "@/components/marketing/blocks/StatsBlock";
import { LayoutsBlock } from "@/components/marketing/blocks/LayoutsBlock";
import { CodeModeSection } from "@/components/marketing/CodeModeSection";
import { Tier2Grid } from "@/components/marketing/Tier2Grid";

export const metadata: Metadata = {
  title: "Features — Touch Typer",
  description: "Real-time PvP, AI Coach, deep stats, multi-layout support, Code Mode, and more. Everything you'd want in a typing tutor.",
  alternates: { canonical: "https://touch-typer.kochie.io/features" },
};

const anchors = [
  { id: "pvp", label: "PvP" },
  { id: "ai", label: "AI Coach" },
  { id: "stats", label: "Stats" },
  { id: "layouts", label: "Layouts" },
  { id: "code", label: "Code Mode" },
];

export default function FeaturesPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="wide">
          <Eyebrow>Features</Eyebrow>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl">
            Everything Touch Typer can do.
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-2xl">
            Five hero features that make Touch Typer different — and a handful of small ones that round it out.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="text-sm rounded-full border border-line bg-paper-soft px-4 py-2 hover:bg-paper transition-colors"
              >
                {a.label}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      <PvpBlock />
      <AiCoachBlock />
      <StatsBlock />
      <LayoutsBlock />
      <CodeModeSection />
      <Tier2Grid />

      <Section tone="ink" density="default">
        <Container width="default">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Ready to start?</h2>
            <p className="mt-3 text-paper/70">Download free and try it for yourself.</p>
            <div className="mt-6">
              <Button href="/#download" variant="inverse" size="lg">Get Touch Typer</Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/features`. Confirm anchors scroll correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/page.tsx
git commit -m "feat(features): /features hub page with anchor nav"
```

---

## Phase 6 — Pricing Page

### Task 24: PricingMatrix component

**Files:**
- Create: `src/components/marketing/PricingMatrix.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/pro-solid-svg-icons";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface Row {
  label: string;
  free: boolean | string;
  premium: boolean | string;
}

const rows: Row[] = [
  { label: "Real-time PvP duels", free: true, premium: true },
  { label: "WPM and accuracy over time", free: true, premium: true },
  { label: "Per-key heatmap", free: true, premium: true },
  { label: "Multi-layout support (QWERTY, Dvorak, Colemak, etc.)", free: true, premium: true },
  { label: "Code Mode (40+ languages)", free: true, premium: true },
  { label: "Cross-device sync", free: true, premium: true },
  { label: "Public leaderboard", free: true, premium: true },
  { label: "Streaks", free: "Basic", premium: "Basic + freezes" },
  { label: "Goals & challenges", free: "Basic", premium: "Advanced" },
  { label: "AI Coach", free: false, premium: true },
  { label: "AI-generated custom drills", free: false, premium: true },
  { label: "AI insights ('why your progress stalled')", free: false, premium: true },
  { label: "Streak freezes (1 free per week)", free: false, premium: true },
  { label: "Priority support", free: false, premium: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <FontAwesomeIcon icon={faCheck} className="text-good" aria-label="Included" />;
  }
  if (value === false) {
    return <FontAwesomeIcon icon={faMinus} className="text-mute" aria-label="Not included" />;
  }
  return <span className="text-sm">{value}</span>;
}

export function PricingMatrix() {
  return (
    <Section tone="paper-soft" density="default">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Full comparison</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold">Every feature, side by side.</h2>
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-4 pr-4 text-sm font-semibold text-ink/80">Feature</th>
                <th className="py-4 px-4 text-sm font-semibold text-ink/80 text-center w-32">Free</th>
                <th className="py-4 px-4 text-sm font-semibold text-ink text-center w-32">Premium</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-line/60">
                  <td className="py-4 pr-4 text-sm">{r.label}</td>
                  <td className="py-4 px-4 text-center"><Cell value={r.free} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={r.premium} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/PricingMatrix.tsx
git commit -m "feat(pricing): full feature comparison matrix"
```

---

### Task 25: PricingFAQ component

**Files:**
- Create: `src/components/marketing/PricingFAQ.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

const faqs = [
  {
    q: "Is there a free trial of Premium?",
    a: "There's no time-limited trial, but the Free tier is generous — you get PvP, heatmaps, full stats, multi-layout, and Code Mode forever. Premium adds AI Coach, custom drills, AI insights, and streak freezes.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from the billing portal at any time and you keep Premium access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What's the difference between buying on the Mac App Store and subscribing here?",
    a: "Both unlock the same Premium features. Mac App Store purchases are billed through Apple and managed in your Apple ID settings. Subscribing here goes through Stripe and is managed at /account. Pick whichever feels easier.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Through Stripe: Visa, Mastercard, American Express, Apple Pay, Google Pay, and Link. Through the Mac App Store: whatever's on file with your Apple ID.",
  },
  {
    q: "Is Touch Typer open source?",
    a: "Yes. The desktop app is MIT-licensed. The repository is at github.com/kochie/touch-type — contributions welcome.",
  },
  {
    q: "What's your refund policy?",
    a: "If you subscribed within the last 14 days and Premium isn't working for you, email me and I'll refund — no friction. After 14 days, you can still cancel anytime; you just won't be refunded retroactively.",
  },
];

export function PricingFAQ() {
  return (
    <Section tone="paper" density="default">
      <Container width="narrow">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold">Common questions.</h2>
        </div>

        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <Disclosure key={f.q} as="div" className="py-4">
              {({ open }) => (
                <>
                  <DisclosureButton className="flex w-full items-center justify-between text-left">
                    <span className="font-medium">{f.q}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-mute transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-3 text-sm text-ink/70 leading-relaxed">
                    {f.a}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/PricingFAQ.tsx
git commit -m "feat(pricing): FAQ accordion"
```

---

### Task 26: `/pricing` page

**Files:**
- Create: `src/app/pricing/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PricingMatrix } from "@/components/marketing/PricingMatrix";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";

export const metadata: Metadata = {
  title: "Pricing — Touch Typer",
  description: "Free to download. Premium is $2.99/month or $2.39/month billed yearly. Compare Free and Premium features.",
  alternates: { canonical: "https://touch-typer.kochie.io/pricing" },
};

const freeFeatures = [
  "Core typing tests",
  "Real-time PvP duels",
  "Multi-layout (QWERTY, Dvorak, Colemak…)",
  "Code Mode (40+ languages)",
  "Basic stats & streaks",
];

const premiumFeatures = [
  "Everything in Free",
  "AI Coach + custom drills",
  "AI insights ('why your progress stalled')",
  "Streak freezes (1 free per week)",
  "Advanced goals & challenges",
];

export default function PricingPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Free to download. <br/>Affordable to upgrade.
            </h1>
            <p className="mt-6 text-lg text-ink/70">
              Pick a plan when you're ready. No trial games, no manipulative pricing tactics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <Card tone="paper">
              <Eyebrow>Free</Eyebrow>
              <div className="mt-3 text-5xl font-bold">$0</div>
              <div className="text-sm text-mute mt-1">Forever</div>
              <ul className="mt-6 space-y-3 text-sm text-ink/80">
                {freeFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/#download" variant="secondary" size="md" className="w-full">
                  Download
                </Button>
              </div>
            </Card>
            <Card tone="paper" emphasis="featured">
              <Eyebrow tone="accent">Premium · Most popular</Eyebrow>
              <div className="mt-3 text-5xl font-bold">
                $2.99<span className="text-base font-normal text-mute">/mo</span>
              </div>
              <div className="text-sm text-mute mt-1">or $2.39/mo billed yearly</div>
              <ul className="mt-6 space-y-3 text-sm text-ink/80">
                {premiumFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/buy" variant="primary" size="md" className="w-full">
                  Go Premium
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <PricingMatrix />
      <PricingFAQ />
    </main>
  );
}
```

- [ ] **Step 2: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/pricing`. Confirm: two-card hero, full matrix, FAQ. Premium card shows "Go Premium" linking to `/buy` (the existing broken billing page — that's the Project B handoff).

- [ ] **Step 3: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat(pricing): /pricing page with hero cards, matrix, and FAQ"
```

---

## Phase 7 — Changelog

### Task 27: Changelog reader library

**Files:**
- Create: `src/lib/changelog.ts`
- Create: `src/content/changelog/2026-05-13-pvp-launch.mdx`
- Create: `src/content/changelog/2026-04-22-ai-coach.mdx`
- Create: `src/content/changelog/2026-03-15-streak-freezes.mdx`

- [ ] **Step 1: Create `src/lib/changelog.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface ChangelogEntry {
  slug: string;
  version: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  tags: string[];
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "changelog");

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);
        const slug = file.replace(/\.mdx$/, "");
        return {
          slug,
          version: String(data.version ?? ""),
          date: String(data.date ?? ""),
          title: String(data.title ?? slug),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          body: content,
        } satisfies ChangelogEntry;
      })
  );
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

- [ ] **Step 2: Create the three sample MDX entries**

`src/content/changelog/2026-05-13-pvp-launch.mdx`:

```markdown
---
version: "1.4.0"
date: "2026-05-13"
title: "Real-time PvP duels"
tags: ["PvP", "Multiplayer"]
---

Touch Typer now has **real-time head-to-head typing duels.** Race a friend (or a stranger) over 60 seconds with live WPM, accuracy, and error feedback.

To start a duel, open the desktop app and click the swords icon. Share the invite link — your opponent can join from any platform.

PvP works on Free. No subscription needed.
```

`src/content/changelog/2026-04-22-ai-coach.mdx`:

```markdown
---
version: "1.3.0"
date: "2026-04-22"
title: "AI Coach generates drills from your weakest keys"
tags: ["AI", "Premium"]
---

AI Coach reads your last 30 days of practice and generates targeted drills for the keys you struggle with most. It also explains *why* your progress stalled — and what to focus on next.

AI Coach is a Premium feature. Free users still see their stats; the coaching layer is the value add.
```

`src/content/changelog/2026-03-15-streak-freezes.mdx`:

```markdown
---
version: "1.2.0"
date: "2026-03-15"
title: "Streak freezes save your streak when life happens"
tags: ["Streaks", "Premium"]
---

Premium subscribers now earn **one streak freeze per week.** Miss a day? Your freeze automatically kicks in and your streak survives.

Need more? You can buy additional freezes as a one-time purchase.
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/changelog.ts src/content/changelog
git commit -m "feat(changelog): MDX reader + 3 sample entries"
```

---

### Task 28: `/changelog` page

**Files:**
- Create: `src/app/changelog/page.tsx`
- Modify: `src/styles/main.css` (add prose styles)

- [ ] **Step 1: Create the page**

```tsx
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getChangelogEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — Touch Typer",
  description: "Recent releases and updates for Touch Typer.",
  alternates: {
    canonical: "https://touch-typer.kochie.io/changelog",
    types: { "application/rss+xml": "/changelog/rss.xml" },
  },
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Changelog</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">What's new.</h1>
          <p className="mt-4 text-base text-ink/70">
            Recent releases, ordered newest first.{" "}
            <a href="/changelog/rss.xml" className="text-accent hover:text-accent-deep">
              RSS feed
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="paper" density="compact">
        <Container width="narrow">
          <div className="space-y-16">
            {entries.map((entry) => (
              <article key={entry.slug} id={entry.slug}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs uppercase tracking-[0.1em] text-mute">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-xs rounded-full bg-paper-soft border border-line px-2 py-0.5">
                    v{entry.version}
                  </span>
                  {entry.tags.map((t) => (
                    <span key={t} className="text-xs rounded-full bg-accent/10 text-accent-deep px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{entry.title}</h2>
                <div className="mt-4 text-base text-ink/80 leading-relaxed prose-styles">
                  <MDXRemote source={entry.body} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Add minimal prose styles**

In `src/styles/main.css`, append after the existing `@layer utilities` block:

```css
@layer components {
  .prose-styles p { margin-bottom: 1em; }
  .prose-styles p:last-child { margin-bottom: 0; }
  .prose-styles strong { font-weight: 600; color: var(--color-ink); }
  .prose-styles em { font-style: italic; }
  .prose-styles ul { list-style: disc; padding-left: 1.25em; margin-bottom: 1em; }
  .prose-styles ol { list-style: decimal; padding-left: 1.25em; margin-bottom: 1em; }
  .prose-styles li { margin-bottom: 0.25em; }
  .prose-styles a { color: var(--color-accent); text-decoration: underline; }
  .prose-styles a:hover { color: var(--color-accent-deep); }
  .prose-styles code { font-family: var(--font-mono); font-size: 0.9em; background: var(--color-paper-soft); padding: 0.1em 0.3em; border-radius: 0.25em; }
}
```

- [ ] **Step 3: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/changelog`. Confirm: three entries render in date order (PvP newest first), tags color-coded, version pill, markdown formatting works.

- [ ] **Step 4: Commit**

```bash
git add src/app/changelog/page.tsx src/styles/main.css
git commit -m "feat(changelog): /changelog list page with MDX rendering"
```

---

### Task 29: `/changelog/rss.xml` route

**Files:**
- Create: `src/app/changelog/rss.xml/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { getChangelogEntries } from "@/lib/changelog";

const SITE = "https://touch-typer.kochie.io";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const entries = await getChangelogEntries();
  const items = entries
    .map((e) => `
      <item>
        <title>${escape(e.title)}</title>
        <link>${SITE}/changelog#${e.slug}</link>
        <guid isPermaLink="false">${e.slug}</guid>
        <pubDate>${new Date(e.date + "T00:00:00Z").toUTCString()}</pubDate>
        <description>${escape(e.body.slice(0, 600))}</description>
      </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Touch Typer — Changelog</title>
  <link>${SITE}/changelog</link>
  <description>Recent releases and updates for Touch Typer.</description>
  <language>en</language>
  ${items}
</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 2: Visual + validation check**

```bash
pnpm dev
curl http://localhost:3000/changelog/rss.xml
```

Expected: well-formed RSS XML. Paste output into `https://validator.w3.org/feed/` to confirm.

- [ ] **Step 3: Commit**

```bash
git add src/app/changelog/rss.xml/route.ts
git commit -m "feat(changelog): RSS feed at /changelog/rss.xml"
```

---

## Phase 8 — SEO Infrastructure

### Task 30: Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create the sitemap**

```ts
import { MetadataRoute } from "next";
import { getChangelogEntries } from "@/lib/changelog";

const SITE = "https://touch-typer.kochie.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getChangelogEntries();
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    ...entries.map((e) => ({
      url: `${SITE}/changelog#${e.slug}`,
      lastModified: new Date(e.date + "T00:00:00Z"),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
```

- [ ] **Step 2: Visual check**

```bash
pnpm dev
curl http://localhost:3000/sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): sitemap.xml"
```

---

### Task 31: Robots

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create the robots file**

```ts
import { MetadataRoute } from "next";

const SITE = "https://touch-typer.kochie.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/buy", "/api/", "/auth/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Visual check**

```bash
curl http://localhost:3000/robots.txt
```

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat(seo): robots.txt"
```

---

### Task 32: Dynamic OG image

**Files:**
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Create the OG image generator**

```tsx
import { ImageResponse } from "next/og";

export const alt = "Touch Typer — Practice typing. Get measurably faster.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fafaf9",
          color: "#0f1115",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 32, color: "#6b7280", marginBottom: 32 }}>⌨ Touch Typer</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Practice typing.
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Get measurably <span style={{ color: "#2d85d2" }}>faster.</span>
        </div>
        <div style={{ fontSize: 28, color: "#6b7280", marginTop: 32 }}>
          Free desktop typing tutor · Mac, Windows, Linux
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Visual check**

```bash
pnpm dev
```

Visit `http://localhost:3000/opengraph-image`. Confirm 1200×630 PNG renders with the headline.

- [ ] **Step 3: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat(seo): dynamic OG image via next/og"
```

---

### Task 33: JSON-LD structured data

**Files:**
- Create: `src/components/seo/JsonLd.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/pricing/page.tsx`

The JSON-LD component uses Next.js's `<Script>` component (which accepts string children) instead of the React `<script>` element, avoiding any need for direct innerHTML manipulation.

- [ ] **Step 1: Create `src/components/seo/JsonLd.tsx`**

```tsx
import Script from "next/script";

interface JsonLdProps {
  id: string;
  data: Record<string, unknown>;
}

export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <Script id={id} type="application/ld+json" strategy="beforeInteractive">
      {JSON.stringify(data)}
    </Script>
  );
}
```

- [ ] **Step 2: Add SoftwareApplication schema to the home page**

In `src/app/page.tsx`, import `JsonLd` and add inside `<main>` at the top:

```tsx
import { JsonLd } from "@/components/seo/JsonLd";

// inside <main>, before <Hero />:
<JsonLd
  id="ld-software-app"
  data={{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Touch Typer",
    operatingSystem: "macOS, Windows, Linux",
    applicationCategory: "EducationApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }}
/>
```

- [ ] **Step 3: Add FAQPage schema to pricing**

In `src/app/pricing/page.tsx`, import `JsonLd` and add inside `<main>`:

```tsx
<JsonLd
  id="ld-faqpage"
  data={{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is there a free trial of Premium?", acceptedAnswer: { "@type": "Answer", text: "There's no time-limited trial, but the Free tier is generous." } },
      { "@type": "Question", name: "Can I cancel anytime?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel from the billing portal anytime — you keep Premium until the end of your current billing period." } },
      { "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: "Through Stripe: Visa, Mastercard, Amex, Apple Pay, Google Pay, Link. Through the Mac App Store: whatever Apple ID has on file." } },
      { "@type": "Question", name: "Is Touch Typer open source?", acceptedAnswer: { "@type": "Answer", text: "Yes — MIT-licensed at github.com/kochie/touch-type." } },
    ],
  }}
/>
```

- [ ] **Step 4: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

View page source on `/` and `/pricing` — confirm a script tag of type `application/ld+json` is present.

- [ ] **Step 5: Commit**

```bash
git add src/components/seo/JsonLd.tsx src/app/page.tsx src/app/pricing/page.tsx
git commit -m "feat(seo): JSON-LD structured data via next/script"
```

---

## Phase 9 — Public Leaderboard Refresh

### Task 34: Reskin `/leaderboard`

**Files:**
- Read: `src/components/LeaderboardSection/index.tsx` (existing — assess current shape)
- Modify: `src/components/LeaderboardSection/index.tsx` (replace chrome only, keep query/data flow)
- Modify: `src/app/leaderboard/page.tsx` (wrap in new design system Container/Section)

- [ ] **Step 1: Read the existing leaderboard implementation**

```bash
cat src/components/LeaderboardSection/index.tsx
cat src/app/leaderboard/page.tsx
```

Take note of: the data fetching pattern, any client/server boundaries, current styling. The component may have a different export pattern than expected; adjust import in step 2 accordingly.

- [ ] **Step 2: Apply the new design tokens to the page wrapper**

Update `src/app/leaderboard/page.tsx`:

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import LeaderboardSection from "@/components/LeaderboardSection";

export const metadata = {
  title: "Leaderboard — Touch Typer",
  description: "Top typists, globally. Filter by layout and time window.",
};

export default function LeaderboardPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <Eyebrow>Leaderboard</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Top typists, globally.
          </h1>
          <p className="mt-4 text-base text-ink/70">
            Updated in near real time. Filter by layout and time window.
          </p>
          <div className="mt-12">
            <LeaderboardSection />
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

If `LeaderboardSection` takes props in the existing usage, preserve them. Match the existing call site exactly.

- [ ] **Step 3: Restyle the table chrome**

Open `src/components/LeaderboardSection/index.tsx`. Apply the new tokens to table styling:
- Borders: `border-line`
- Headers: `text-ink/80 uppercase tracking-[0.08em] text-xs`
- Rows: `border-b border-line/60 hover:bg-paper-soft`
- Current-user row: `bg-accent/5 border-l-2 border-accent`

**Do not touch the data query, pagination, or filter logic** — only the className strings.

- [ ] **Step 4: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/leaderboard` while signed in and while signed out. Confirm: same rows render, current-user highlight works, pagination works, styling matches the new system.

- [ ] **Step 5: Commit**

```bash
git add src/components/LeaderboardSection src/app/leaderboard
git commit -m "refactor(leaderboard): reskin with new design system tokens"
```

---

## Phase 10 — Companion Page Reskins (Visual Only)

**Reminder:** The boundary rules from spec section 12 apply. **No behavioral changes** to billing or auth. Only className/JSX-wrapper changes. If a bug becomes obvious, write it down in `docs/superpowers/notes/project-b-billing-bugs.md` and keep moving.

### Task 35: `/account` reskin

**Files:**
- Modify: `src/app/account/page.tsx` (chrome wrap)
- Modify: `src/components/AccountSettings/*.tsx` (token-based classNames; preserve all logic)
- Modify: `src/components/ChangePassword/*.tsx` (token-based classNames)
- Modify: `src/components/SignOutButton/*.tsx` (replace with new Button primitive)

- [ ] **Step 1: Wrap the page**

Edit `src/app/account/page.tsx`. **Keep the existing data fetching exactly as-is.** Wrap the existing component composition in:

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
// ... existing imports preserved

export default async function AccountPage() {
  // existing data fetching unchanged
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold">Your account</h1>
          <div className="mt-8 space-y-6">
            {/* existing AccountSettings + ChangePassword + SignOutButton — same components, same props */}
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Restyle child components**

Walk each child component, replace ad-hoc Tailwind classes (`bg-slate-100`, `text-slate-600`, etc.) with token equivalents (`bg-paper-soft`, `text-ink/80`). Replace any raw `<button>` elements with the new `<Button>` primitive. Leave Formik, Supabase calls, and event handlers untouched.

- [ ] **Step 3: Type-check + smoke test**

```bash
npx tsc --noEmit
pnpm dev
```

Sign in. Visit `/account`. Confirm page renders, subscription state displays (or displays the same broken state it did before — that's Project B). Sign out works.

- [ ] **Step 4: Commit**

```bash
git add src/app/account src/components/AccountSettings src/components/ChangePassword src/components/SignOutButton
git commit -m "refactor(account): reskin /account with design tokens — no logic changes"
```

---

### Task 36: `/buy` reskin

**Files:**
- Modify: `src/app/buy/plans/page.tsx`
- Modify: `src/components/PlanSelection/index.tsx`

- [ ] **Step 1: Wrap the page**

Add `Section` + `Container` chrome with the heading "Choose your plan".

- [ ] **Step 2: Restyle `PlanSelection`**

Replace `bg-slate-100`, `text-slate-600`, etc. with token classes. Replace `<button>` with `<Button>` primitive. **Do not touch:** the radio group logic, the Stripe checkout invocation, the billing-period state. Those stay for Project B.

- [ ] **Step 3: Type-check + smoke check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `/buy` while signed in. Confirm plan cards render. **Do not click "Continue" — billing is broken.**

- [ ] **Step 4: Commit**

```bash
git add src/app/buy src/components/PlanSelection
git commit -m "refactor(buy): reskin /buy with design tokens — Stripe logic unchanged"
```

---

### Task 37: `/checkout` reskin

**Files:**
- Modify: `src/app/checkout/page.tsx` (or whatever the entry file is — verify with `ls src/app/checkout/`)
- Modify: `src/components/Payment/*.tsx`

- [ ] **Step 1: Check the file layout**

```bash
ls src/app/checkout/
ls src/components/Payment/
```

- [ ] **Step 2: Wrap the page**

Apply `Section` + `Container` chrome around the Stripe Elements component. **Do not touch the Stripe Elements iframe wrapper or any Stripe SDK invocations.**

- [ ] **Step 3: Restyle the surrounding form chrome**

Labels, helper text, container styling — apply tokens. The actual Stripe iframe stays untouched.

- [ ] **Step 4: Type-check + smoke check**

```bash
npx tsc --noEmit
pnpm dev
```

Visit `/checkout` (you may need to navigate from `/buy` for it to render meaningfully). Confirm chrome renders. **Do not attempt a real checkout.**

- [ ] **Step 5: Commit**

```bash
git add src/app/checkout src/components/Payment
git commit -m "refactor(checkout): reskin /checkout chrome — Stripe Elements untouched"
```

---

### Task 38: Auth pages reskin (`/signin`, `/signup`, `/forgot-password`)

**Files:**
- Modify: `src/app/signin/page.tsx`
- Modify: `src/app/signup/page.tsx`
- Modify: `src/app/forgot-password/page.tsx`
- Modify: `src/components/SignIn/*.tsx`
- Modify: `src/components/SignUp/*.tsx`
- Modify: `src/components/ForgotPassword/*.tsx`

- [ ] **Step 1: Wrap each page**

Each page wraps the form in:

```tsx
<main>
  <Section tone="paper-soft" density="default">
    <Container width="narrow">
      <div className="text-center mb-8">
        <Eyebrow>Account</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold">{/* Sign in | Create account | Reset password */}</h1>
      </div>
      <Card tone="paper">
        {/* existing form, internals untouched */}
      </Card>
    </Container>
  </Section>
</main>
```

- [ ] **Step 2: Restyle inputs and buttons inside the form components**

Use the `@tailwindcss/forms` plugin styles + tokens. Inputs: `bg-paper border-line focus:border-accent`. Submit button: replace with `<Button>` primitive. **Do not change** the Formik schema, Supabase auth calls, navigation logic, or error handling.

- [ ] **Step 3: Type-check + auth round-trip**

```bash
npx tsc --noEmit
pnpm dev
```

Sign out if signed in. Visit `/signin`. Sign in with a real account. Verify redirect to `/account`. Sign out. Visit `/signup`. Confirm rendering (don't create a duplicate account). Visit `/forgot-password`. Confirm rendering.

- [ ] **Step 4: Commit**

```bash
git add src/app/signin src/app/signup src/app/forgot-password src/components/SignIn src/components/SignUp src/components/ForgotPassword
git commit -m "refactor(auth): reskin signin/signup/forgot-password — Formik + Supabase untouched"
```

---

### Task 39: `/privacy` refresh

**Files:**
- Modify: `src/app/privacy/page.tsx`

- [ ] **Step 1: Wrap the page**

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Privacy — Touch Typer",
  description: "How Touch Typer handles your data.",
};

export default function PrivacyPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-3 text-4xl font-bold">Privacy</h1>
          <div className="mt-8 prose-styles">
            {/* existing privacy policy text / JSX content goes here, untouched */}
          </div>
        </Container>
      </Section>
    </main>
  );
}
```

Preserve all of the existing privacy policy text content — only the wrapping chrome changes.

- [ ] **Step 2: Type-check + visual check**

```bash
npx tsc --noEmit
pnpm dev
```

- [ ] **Step 3: Commit**

```bash
git add src/app/privacy
git commit -m "refactor(privacy): apply design tokens to privacy page"
```

---

## Phase 11 — Cleanup & Verification

### Task 40: Remove old in-page metadata bits

**Files:**
- Modify: any page whose `metadata` still references `process.env.NEXT_PUBLIC_VERCEL_URL` for the OG image (now handled by `opengraph-image.tsx`)

- [ ] **Step 1: Grep for stale references**

```bash
grep -rn "NEXT_PUBLIC_VERCEL_URL\|/og.png\|next-seo" src/
```

Expected: zero matches. If any surface, remove them.

- [ ] **Step 2: Confirm build is clean**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 3: Commit (if any cleanup happened)**

```bash
git add -A
git commit -m "chore: remove stale OG and next-seo references"
```

---

### Task 41: Pre-merge verification checklist

This is a manual sweep. Walk through it and check each item. If anything fails, the corresponding earlier task is incomplete.

- [ ] **Build:**

```bash
pnpm build
npx tsc --noEmit
```

Expected: both pass.

- [ ] **Visual sweep:** With `pnpm dev`, load each route at 1440 / 1024 / 768 / 375 widths in Chrome DevTools:
  - [ ] `/`
  - [ ] `/features`
  - [ ] `/pricing`
  - [ ] `/changelog`
  - [ ] `/leaderboard` (signed-out)
  - [ ] `/leaderboard` (signed-in, confirm user-highlight)
  - [ ] `/account` (signed-in)
  - [ ] `/buy` (signed-in)
  - [ ] `/checkout` (signed-in, navigated from `/buy`)
  - [ ] `/signin`
  - [ ] `/signup`
  - [ ] `/forgot-password`
  - [ ] `/privacy`

- [ ] **Auth round-trip:** Sign in via `/signin` → land on `/account` → sign out via the sign-out button → back to `/` showing signed-out header.

- [ ] **Billing smoke:** `/buy` renders plan cards. **Do not** attempt checkout.

- [ ] **Changelog:** All three sample MDX entries render. RSS feed validates at https://validator.w3.org/feed/.

- [ ] **OG previews:** `http://localhost:3000/opengraph-image` returns a 1200×630 PNG.

- [ ] **Sitemap + robots:** `/sitemap.xml` and `/robots.txt` return well-formed content.

- [ ] **Reduced motion:** macOS System Settings → Accessibility → Display → Reduce motion ON. Reload `/`. Cursor in hero stops blinking. Other animations skip.

- [ ] **Lighthouse:** Run Lighthouse on `/` (in incognito, with extensions disabled). Record scores. Target: ≥ 90 Performance, ≥ 95 Accessibility, ≥ 95 SEO. Not a release gate; if below, log issues for later refinement.

- [ ] **Project B handoff log:** If any billing-related bugs surfaced during reskin (broken plan display, weird redirects, stale state), append them to `docs/superpowers/notes/project-b-billing-bugs.md` (create if it doesn't exist).

- [ ] **Final commit if anything got fixed during the sweep:**

```bash
git add -A
git commit -m "chore: final polish pass before merge"
```

---

### Task 42: Push the branch for preview

- [ ] **Step 1: Push and set upstream**

```bash
git push -u origin feature/website-rebuild-2026-05
```

Vercel will pick this up and create a preview URL automatically.

- [ ] **Step 2: Capture the preview URL**

Check the Vercel dashboard or wait for the GitHub bot comment if Vercel-GitHub integration is wired. Note the URL for testing.

- [ ] **Step 3: Hand off to the user for testing**

End of plan. The branch sits open as long as the user needs to test. When ready, merge manually via PR or fast-forward — Vercel auto-deploys the rebuild to production on merge.

---

## Implementation Notes

- **DRY:** The four big-feature blocks all use the same `BigFeatureBlock` component. The five marquee cards all use the same `Card` + `FeatureGlyph` pair. The pricing teaser and the full pricing page share `Card` + content data.
- **YAGNI:** No tests (per spec). No CMS. No `motion` library *yet* — added in deps but only used for the cursor (CSS-only) right now. If during implementation a section's polish wants a `motion`-driven reveal, add it then.
- **TDD:** Not applicable to this project per spec section 11. Every component task ends with `npx tsc --noEmit` + `pnpm dev` visual check.
- **Frequent commits:** Each task ends with a focused commit. The branch ships ~42 commits total — readable history for an open-source repo.
- **Route group simplification (spec deviation):** The spec proposed a `(marketing)` route group in `src/app/` to colocate marketing pages. This plan puts the new pages directly at `src/app/features/`, `src/app/pricing/`, `src/app/changelog/` without the group prefix. Rationale: route groups in Next.js are purely organizational; with only four marketing pages and no shared layout/error/loading file to put inside the group, the extra folder layer adds friction without benefit. URLs are identical either way. If a future marketing-specific layout becomes useful, the group can be added then.

## Project B Reminders

If during implementation any of these surface, **log them, don't fix them:**
- Stripe webhook reconciliation gaps
- Plan-switching proration weirdness
- `billing-portal` redirect failures
- Cross-environment subscription artifacts
- New-customer first-time checkout failures
- Streak-freeze purchase flow
- Subscription state stale or wrong on `/account`

Log file: `docs/superpowers/notes/project-b-billing-bugs.md`
