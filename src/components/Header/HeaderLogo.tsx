"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function HeaderLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Light: blue keyboards + ink accents (logo-ink).
  // Dark:  blue keyboards + white accents (logo-color, the original dark-bg variant).
  // The flat all-white /logo-white.svg is reserved for surfaces that need maximum
  // contrast (e.g. Footer) where preserving the brand-blue would clash.
  const src = mounted && resolvedTheme === "dark" ? "/logo-color.svg" : "/logo-ink.svg";

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
