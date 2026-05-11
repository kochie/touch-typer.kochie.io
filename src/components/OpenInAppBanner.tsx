"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/supabase-provider";

export function OpenInAppBanner() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const openInApp = searchParams.get("open_in_app") === "1";
    setShow(openInApp && !dismissed && !!user);
  }, [searchParams, dismissed, user]);

  const handleOpenInApp = async () => {
    if (!user) return;

    const response = await fetch('/api/auth/app-code', { method: 'POST' });
    if (!response.ok) return;
    const { code } = await response.json();

    window.location.href = `touchtyper://auth-callback?code=${encodeURIComponent(code)}`;
  };

  if (!show) return null;

  return (
    <div className="rounded-lg bg-accent/10 border border-accent/30 p-4 mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-accent-deep">
        You&apos;re signed in on the web. Open the Touch Typer app to use this account there too.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleOpenInApp}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-paper shadow-sm hover:bg-accent-deep transition-colors"
        >
          Open in app
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-accent hover:text-accent-deep text-sm"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
