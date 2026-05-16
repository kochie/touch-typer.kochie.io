"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FrequencyToggle } from "./FrequencyToggle";
import { getPremiumCta, formatPrice, type PriceLite } from "./cta";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

interface BuyPlansClientProps {
  prices: PriceLite[];
  subscription: SubscriptionResolved | null;
  cancelled: boolean;
}

export function BuyPlansClient({ prices, subscription, cancelled }: BuyPlansClientProps) {
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = useMemo(() => prices.find((p) => p.lookup_key === "premium_monthly"), [prices]);
  const yearlyPrice = useMemo(() => prices.find((p) => p.lookup_key === "premium_yearly"), [prices]);
  const selectedPrice = frequency === "monthly" ? monthlyPrice : yearlyPrice;

  const yearlyDiscount = useMemo(() => {
    if (!monthlyPrice?.unit_amount || !yearlyPrice?.unit_amount) return undefined;
    const yearlyCostIfMonthly = monthlyPrice.unit_amount * 12;
    const savings = yearlyCostIfMonthly - yearlyPrice.unit_amount;
    if (savings <= 0) return undefined;
    const pct = Math.round((savings / yearlyCostIfMonthly) * 100);
    return `save ${pct}%`;
  }, [monthlyPrice, yearlyPrice]);

  const premiumCta = selectedPrice ? getPremiumCta(subscription, selectedPrice) : null;

  return (
    <>
      {cancelled && (
        <div className="mb-8 rounded-lg border border-border bg-bg-elevated p-4 text-sm">
          Checkout cancelled — you weren&apos;t charged.
        </div>
      )}

      <div className="mb-10 flex justify-center">
        <FrequencyToggle value={frequency} onChange={setFrequency} yearlyDiscount={yearlyDiscount} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Card tone="paper">
          <Eyebrow>Free</Eyebrow>
          <div className="mt-3 text-4xl sm:text-5xl font-bold">$0</div>
          <div className="text-sm text-fg-muted mt-1">Forever</div>
          <ul className="mt-6 space-y-3 text-sm text-fg/80">
            <li>· Real-time PvP duels</li>
            <li>· WPM, accuracy, heatmaps</li>
            <li>· Multi-layout (QWERTY, Dvorak, Colemak)</li>
            <li>· Code Mode</li>
            <li>· Basic stats &amp; streaks</li>
          </ul>
          <div className="mt-8">
            <Button href="/#download" variant="secondary" size="md" className="w-full">
              Download
            </Button>
          </div>
        </Card>

        <Card emphasis="gradient">
          <Eyebrow tone="default" className="!text-paper/80">Premium · Most popular</Eyebrow>
          <div className="mt-3 text-4xl sm:text-5xl font-bold">
            {selectedPrice ? formatPrice(selectedPrice).split("/")[0] : "—"}
            <span className="text-base font-normal text-paper/70">
              /{frequency === "monthly" ? "month" : "year"}
            </span>
          </div>
          <div className="text-sm text-paper/70 mt-1">
            {frequency === "yearly" && yearlyDiscount ? `${yearlyDiscount} vs monthly` : "Cancel anytime"}
          </div>
          <ul className="mt-6 space-y-3 text-sm text-paper/90">
            <li>· Everything in Free</li>
            <li>· AI Coach + custom drills</li>
            <li>· AI insights (&ldquo;why your progress stalled&rdquo;)</li>
            <li>· Streak freezes (1 free per week)</li>
            <li>· Advanced goals &amp; challenges</li>
          </ul>
          <div className="mt-8">
            {premiumCta && (
              <Button
                href={premiumCta.href}
                variant={premiumCta.variant === "accent" ? "inverse" : premiumCta.variant}
                size="md"
                className="w-full"
                aria-disabled={premiumCta.disabled}
              >
                {premiumCta.label}
              </Button>
            )}
          </div>
        </Card>
      </div>

      <p className="mt-10 text-center text-xs text-fg-muted max-w-md mx-auto">
        Card required for the 7-day free trial. Cancel any time in your account.
        We&apos;ll email you 3 days before the trial ends.
      </p>
    </>
  );
}
