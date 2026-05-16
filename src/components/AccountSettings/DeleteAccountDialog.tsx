"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Notification } from "../Notification";
import { useSupabase, useSupabaseClient } from "@/lib/supabase-provider";

interface DeleteAccountDialogProps {
  userEmail: string;
}

export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
  const supabase = useSupabaseClient();
  const { signOut } = useSupabase();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = typed.trim().toLowerCase() === userEmail.trim().toLowerCase();

  useEffect(() => {
    if (open) {
      setTyped("");
      // Defer focus until the dialog has mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  async function handleDelete() {
    if (!matches || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user", { method: "POST" });
      if (error) throw error;

      toast(Notification, {
        type: "success",
        data: {
          title: "Account deleted",
          message: "Your account and all data have been removed.",
          type: "success",
        },
      });

      await signOut();
      router.push("/");
    } catch (err: any) {
      toast(Notification, {
        type: "error",
        data: {
          title: "Could not delete account",
          message: err?.message ?? "Please try again or contact support.",
          type: "error",
        },
      });
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setOpen(true)} type="button">
        Delete account
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-bg p-6 shadow-xl border border-border">
            <DialogTitle className="text-lg font-semibold text-fg">
              Delete your account?
            </DialogTitle>
            <div className="mt-2 space-y-3 text-sm text-fg/70">
              <p>
                This permanently removes your account, results, goals, leaderboard scores, settings, and active subscription. This action <strong className="text-fg">cannot be undone</strong>.
              </p>
              <p>
                To confirm, type your email <span className="font-mono text-fg">{userEmail}</span> below.
              </p>
            </div>

            <input
              ref={inputRef}
              type="email"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches && !submitting) {
                  e.preventDefault();
                  handleDelete();
                }
              }}
              placeholder={userEmail}
              disabled={submitting}
              className="mt-4 block w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg shadow-sm placeholder:text-fg/30 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              aria-label="Type your email to confirm deletion"
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!matches || submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
