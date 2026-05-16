"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSupabase } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";

interface ActionsProps {
  showCancel?: boolean;
  showReactivate?: boolean;
  showManage?: boolean;
  showUpdatePayment?: boolean;
}

export function SubscriptionActions({
  showCancel,
  showReactivate,
  showManage,
  showUpdatePayment,
}: ActionsProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Cancel at period end? You'll keep Premium until then, and can reactivate any time before.")) return;
    setBusy("cancel");
    try {
      const { error } = await supabase.functions.invoke("toggle-auto-renew", { body: { autoRenew: false } });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't cancel", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  async function reactivate() {
    setBusy("reactivate");
    try {
      const { error } = await supabase.functions.invoke("toggle-auto-renew", { body: { autoRenew: true } });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't reactivate", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const { data, error } = await supabase.functions.invoke("billing-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast(Notification, {
        type: "error",
        data: { title: "Couldn't open billing", message: String(err), type: "error" },
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {showUpdatePayment && (
        <Button onClick={openPortal} disabled={busy === "portal"} variant="accent" size="md" className="shadow-accent">
          {busy === "portal" ? "Opening…" : "Update payment"}
        </Button>
      )}
      {showCancel && (
        <Button onClick={cancel} disabled={busy === "cancel"} variant="secondary" size="md">
          {busy === "cancel" ? "Cancelling…" : "Cancel at period end"}
        </Button>
      )}
      {showReactivate && (
        <Button onClick={reactivate} disabled={busy === "reactivate"} variant="accent" size="md" className="shadow-accent">
          {busy === "reactivate" ? "Reactivating…" : "Reactivate"}
        </Button>
      )}
      {showManage && (
        <Button onClick={openPortal} disabled={busy === "portal"} variant="ghost" size="md">
          {busy === "portal" ? "Opening…" : "Manage payment methods"}
        </Button>
      )}
    </div>
  );
}
