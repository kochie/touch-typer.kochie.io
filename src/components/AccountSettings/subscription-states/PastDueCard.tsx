import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function PastDueCard({ subscription: _subscription }: { subscription: SubscriptionResolved }) {
  return (
    <Card tone="paper" className="border-bad/30 bg-bad/5" id="recover">
      <div className="text-xs uppercase tracking-[0.1em] text-bad font-semibold">Payment failed</div>
      <div className="mt-1 text-xl font-semibold">We couldn&apos;t charge your card</div>
      <p className="mt-3 text-sm text-fg/70">
        Stripe will keep retrying for the next ~2 weeks. To resolve immediately, update your payment method.
      </p>
      <div className="mt-6">
        <SubscriptionActions showUpdatePayment />
      </div>
    </Card>
  );
}
