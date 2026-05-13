"use client";

import Link from "next/link";
import Script from "next/script";

type Store = "mac" | "snap" | "ms";

interface StoreBadgeProps {
  store: Store;
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

  // ms — wrap so we can constrain the custom element to the same h-12 as the others
  return (
    <>
      <Script
        type="module"
        src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"
        strategy="afterInteractive"
      />
      <span className="inline-block h-12 [&_ms-store-badge]:h-12 [&_ms-store-badge]:block">
        <ms-store-badge
          productid="9NG3CCFL631D"
          size="small"
          window-mode="full"
          theme="light"
          language="en"
          animation="on"
        />
      </span>
    </>
  );
}
