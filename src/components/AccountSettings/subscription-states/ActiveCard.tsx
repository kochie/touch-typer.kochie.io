import { Card } from "@/components/ui/Card";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function ActiveCard({ subscription }: { subscription: SubscriptionResolved }) {
  const renews = subscription.next_billing_date
    ? new Date(subscription.next_billing_date).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Premium · {subscription.display_billing_period}</div>
      {renews && <p className="mt-3 text-sm text-fg/70">Renews on {renews}.</p>}
      <div className="mt-6">
        <SubscriptionActions showCancel showManage />
      </div>
    </Card>
  );
}
