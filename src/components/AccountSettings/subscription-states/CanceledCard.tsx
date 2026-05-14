import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function CanceledCard({ subscription }: { subscription: SubscriptionResolved }) {
  const endsOn = subscription.effective_end_date
    ? new Date(subscription.effective_end_date).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;
  return (
    <Card tone="paper-soft" id="reactivate">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Premium · ending</div>
      {endsOn && (
        <p className="mt-3 text-sm text-fg/70">
          Subscription cancelled. You&apos;ll keep Premium until {endsOn}, then drop to Free.
        </p>
      )}
      <div className="mt-6">
        <SubscriptionActions showReactivate showManage />
      </div>
    </Card>
  );
}
