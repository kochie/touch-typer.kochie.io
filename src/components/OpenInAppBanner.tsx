"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase-provider";

export function OpenInAppBanner() {
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const openInApp = searchParams.get("open_in_app") === "1";
    if (!openInApp || dismissed) {
      setShow(false);
      return;
    }
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setShow(!!session);
    };
    check();
  }, [searchParams, supabase, dismissed]);

  const handleOpenInApp = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !session?.refresh_token) return;
    const url = `touchtyper://auth-callback?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
    window.location.href = url;
  };

  if (!show) return null;

  return (
    <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-indigo-800">
        You’re signed in on the web. Open the Touch Typer app to use this account there too.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleOpenInApp}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Open in app
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
