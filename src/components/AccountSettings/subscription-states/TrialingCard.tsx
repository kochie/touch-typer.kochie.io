import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function TrialingCard({ subscription }: { subscription: SubscriptionResolved }) {
  const daysLeft = subscription.effective_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.effective_end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return (
    <Card tone="paper-soft">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.1em] text-accent">Trial</div>
          <div className="mt-1 text-xl font-semibold">Premium</div>
        </div>
        {daysLeft != null && (
          <div className="text-right">
            <div className="text-2xl font-semibold text-accent">{daysLeft}</div>
            <div className="text-xs text-fg-muted">days remaining</div>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-fg/70">
        Your trial ends on {subscription.effective_end_date && new Date(subscription.effective_end_date).toLocaleDateString("en-US", { dateStyle: "long" })}.
        Your card will be charged then unless you cancel.
      </p>
      <div className="mt-6">
        <SubscriptionActions showCancel showManage />
      </div>
    </Card>
  );
}
