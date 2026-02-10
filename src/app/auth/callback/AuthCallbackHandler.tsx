"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const ALLOWED_NEXT = new Set(["/account", "/auth/set-password"]);

function parseHashFragment(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || hash.charAt(0) !== "#") return params;
  const query = hash.slice(1);
  for (const part of query.split("&")) {
    const [key, value] = part.split("=");
    if (key && value) params[key] = decodeURIComponent(value.replace(/\+/g, " "));
  }
  return params;
}

export function AuthCallbackHandler() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const nextParam = searchParams?.get("next") ?? "";
      const redirectTo = ALLOWED_NEXT.has(nextParam) ? nextParam : "/auth/set-password";
      const targetPath = redirectTo === "/account" ? "/account?open_in_app=1" : redirectTo;

      const supabase = createClient();

      try {
        // PKCE: code in query string (server or client can exchange)
        const code = searchParams?.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
          }
          router.replace(targetPath);
          setStatus("done");
          return;
        }

        // Implicit: tokens in URL hash (only visible client-side)
        const hashParams = parseHashFragment(hash);
        const accessToken = hashParams.access_token;
        const refreshToken = hashParams.refresh_token;

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (cancelled) return;
          if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
          }
          router.replace(targetPath);
          setStatus("done");
          return;
        }

        // No code and no tokens in hash – might have landed without auth params
        setStatus("error");
        setMessage("No authentication data found in the link. Try requesting a new reset link.");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Something went wrong");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <p className="text-gray-600">Completing sign in…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-red-600 font-medium">Sign in failed</p>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <a href="/forgot-password" className="mt-4 text-sm text-indigo-600 hover:underline">
          Request a new password reset link
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <p className="text-gray-600">Redirecting…</p>
    </div>
  );
}
