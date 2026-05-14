import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FreeCard() {
  return (
    <Card tone="paper-soft">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.1em] text-fg-muted">Plan</div>
          <div className="mt-1 text-xl font-semibold">Free</div>
        </div>
        <Button href="/buy/plans" variant="accent" size="md" className="shadow-accent">
          Upgrade to Premium
        </Button>
      </div>
      <p className="mt-3 text-sm text-fg/70">
        AI Coach, custom drills, AI insights, and weekly streak freezes unlock with Premium.
      </p>
    </Card>
  );
}
