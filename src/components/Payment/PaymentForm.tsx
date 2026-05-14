"use client";

import { useState } from "react";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import { Button } from "@/components/ui/Button";

export function PaymentForm() {
  const result = useCheckout();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (result.type === "loading") {
    return <div className="text-sm text-fg-muted">Loading payment…</div>;
  }

  if (result.type === "error") {
    return (
      <div className="rounded-md border border-bad/30 bg-bad/10 p-3 text-sm text-bad">
        {result.error.message}
      </div>
    );
  }

  const { checkout } = result;
  const lineItem = checkout.lineItems?.[0];
  const total = checkout.total;
  const trial = checkout.recurring?.trial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const confirmResult = await checkout.confirm({ redirect: "if_required" });
    if (confirmResult.type === "error") {
      setError(confirmResult.error.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }
    // On success, Stripe redirects via return_url (or redirect: if_required stays).
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border bg-bg-elevated p-4">
        <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Order summary</div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-fg">{lineItem?.name ?? "Touch Typer Premium"}</span>
          <span className="text-fg/80">{total.total.amount}</span>
        </div>
        {trial != null && trial.trialPeriodDays > 0 && (
          <div className="mt-2 text-sm text-fg-muted">
            Free for {trial.trialPeriodDays} days, then {total.total.amount}
          </div>
        )}
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div className="rounded-md border border-bad/30 bg-bad/10 p-3 text-sm text-bad">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full shadow-accent"
        disabled={submitting}
      >
        {submitting
          ? "Starting trial…"
          : trial != null && trial.trialPeriodDays > 0
            ? "Start free 7-day trial"
            : "Subscribe"}
      </Button>

      <p className="text-xs text-fg-muted text-center">
        By subscribing you agree to Touch Typer&apos;s terms. Cancel any time.
      </p>
    </form>
  );
}
