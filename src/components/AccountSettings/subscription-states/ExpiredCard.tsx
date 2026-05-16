import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ExpiredCard() {
  return (
    <Card tone="paper-soft">
      <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
      <div className="mt-1 text-xl font-semibold">Free</div>
      <p className="mt-3 text-sm text-fg/70">
        Your Premium subscription has ended. Resubscribe any time.
      </p>
      <div className="mt-6">
        <Button href="/buy/plans" variant="accent" size="md" className="shadow-accent">
          Resubscribe
        </Button>
      </div>
    </Card>
  );
}
