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
