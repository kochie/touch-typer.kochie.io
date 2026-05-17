"use client";

import { useEffect } from "react";

// Defensive root-level handler for Supabase auth links that land at `/`
// instead of `/auth/callback`. This happens when:
//   1. The `redirect_to` we send to Supabase isn't on the project's allow-list,
//      so Supabase falls back to Site URL (= the root) with tokens in the hash.
//   2. Older password-reset / signup-confirmation emails were sent before
//      the allow-list was correct.
//   3. OAuth providers that always return to Site URL by spec.
//
// When we detect `#access_token=...` or `#error=...` in the hash on `/`,
// we forward to `/auth/callback` preserving the entire hash so the existing
// AuthCallbackHandler can call setSession + route to /auth/set-password.
//
// Renders nothing.
export function RootAuthHashCatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    // Match any of the param names Supabase emits on recovery / magic-link
    // / OAuth-implicit flows. Errors get forwarded too so the callback
    // handler renders the explanatory message rather than silently dropping.
    if (
      !/\b(access_token|refresh_token|provider_token|error|error_description|type=recovery|type=signup|type=magiclink|type=invite)\b/.test(
        hash,
      )
    ) {
      return;
    }
    // Use replace so the user's back-button doesn't bounce them back to
    // /#access_token and re-trigger the redirect.
    window.location.replace(`/auth/callback${hash}`);
  }, []);

  return null;
}
