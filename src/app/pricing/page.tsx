import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PricingMatrix } from "@/components/marketing/PricingMatrix";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";

export const metadata: Metadata = {
  title: "Pricing — Touch Typer",
  description: "Free to download. Premium is $2.99/month or $2.39/month billed yearly. Compare Free and Premium features.",
  alternates: { canonical: "https://touch-typer.kochie.io/pricing" },
};

const freeFeatures = [
  "Core typing tests",
  "Real-time PvP duels",
  "Multi-layout (QWERTY, Dvorak, Colemak…)",
  "Code Mode (40+ languages)",
  "Basic stats & streaks",
];

const premiumFeatures = [
  "Everything in Free",
  "AI Coach + custom drills",
  "AI insights ('why your progress stalled')",
  "Streak freezes (1 free per week)",
  "Advanced goals & challenges",
];

export default function PricingPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Free to download. <br/>Affordable to upgrade.
            </h1>
            <p className="mt-6 text-lg text-ink/70">
              Pick a plan when you're ready. No trial games, no manipulative pricing tactics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <Card tone="paper">
              <Eyebrow>Free</Eyebrow>
              <div className="mt-3 text-5xl font-bold">$0</div>
              <div className="text-sm text-mute mt-1">Forever</div>
              <ul className="mt-6 space-y-3 text-sm text-ink/80">
                {freeFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/#download" variant="secondary" size="md" className="w-full">
                  Download
                </Button>
              </div>
            </Card>
            <Card tone="paper" emphasis="featured">
              <Eyebrow tone="accent">Premium · Most popular</Eyebrow>
              <div className="mt-3 text-5xl font-bold">
                $2.99<span className="text-base font-normal text-mute">/mo</span>
              </div>
              <div className="text-sm text-mute mt-1">or $2.39/mo billed yearly</div>
              <ul className="mt-6 space-y-3 text-sm text-ink/80">
                {premiumFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/buy" variant="primary" size="md" className="w-full">
                  Go Premium
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <PricingMatrix />
      <PricingFAQ />
    </main>
  );
}
