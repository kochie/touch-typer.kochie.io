import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export function MasManagedCard({ subscription }: { subscription: SubscriptionResolved }) {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Managed in Mac App Store</div>
      <div className="mt-1 text-xl font-semibold">Premium</div>
      {subscription.display_billing_period && (
        <p className="mt-3 text-sm text-fg/70">
          Billed {subscription.display_billing_period} via Apple. Manage your subscription in the App Store.
        </p>
      )}
      <div className="mt-6">
        <Button
          href="macappstore://apps.apple.com/app/id1637786724"
          variant="accent"
          size="md"
          className="shadow-accent"
        >
          Open in App Store
        </Button>
      </div>
    </Card>
  );
}
