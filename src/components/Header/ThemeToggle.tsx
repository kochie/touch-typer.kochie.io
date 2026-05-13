"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faGear } from "@fortawesome/pro-duotone-svg-icons";

// Cycle order: light → dark → system → light → ...
const NEXT: Record<string, "light" | "dark" | "system"> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const ICONS = {
  light: faSun,
  dark: faMoon,
  system: faGear,
} as const;

const LABELS: Record<string, string> = {
  light: "Theme: light. Click to switch to dark.",
  dark: "Theme: dark. Click to switch to system.",
  system: "Theme: system. Click to switch to light.",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the right theme on the client. Render a
  // placeholder until mounted so the SSR markup doesn't claim a wrong icon.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Loading theme toggle"
        aria-busy="true"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span className="block h-4 w-4" />
      </button>
    );
  }

  const current = (theme === "light" || theme === "dark" || theme === "system" ? theme : "system") as
    | "light"
    | "dark"
    | "system";

  return (
    <button
      type="button"
      aria-label={LABELS[current]}
      title={LABELS[current]}
      onClick={() => setTheme(NEXT[current])}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg/80 hover:bg-bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-colors"
    >
      <FontAwesomeIcon icon={ICONS[current]} className="h-4 w-4" />
    </button>
  );
}
