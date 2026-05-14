import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PendingCard() {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Checkout in progress</div>
      <p className="mt-3 text-sm text-fg/70">
        We started a checkout session for you but didn&apos;t see it complete.
      </p>
      <div className="mt-6">
        <Button href="/checkout" variant="secondary" size="md">Resume checkout</Button>
      </div>
    </Card>
  );
}
