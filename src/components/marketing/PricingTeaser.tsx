import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const freeFeatures = ["Core typing tests", "Stats & streaks", "Multi-layout", "Real-time PvP"];
const premiumFeatures = [
  "Everything in Free",
  "AI Coach + custom drills",
  "AI insights",
  "Streak freezes weekly",
];

export function PricingTeaser() {
  return (
    <Section tone="paper" density="default">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Free to download. Affordable to upgrade.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          <Card tone="paper">
            <Eyebrow>Free</Eyebrow>
            <div className="mt-3 text-4xl font-bold">$0</div>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {freeFeatures.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="#download" variant="secondary" size="md">
                Download
              </Button>
            </div>
          </Card>
          <Card emphasis="gradient">
            <Eyebrow tone="default" className="!text-paper/80">Premium · Most popular</Eyebrow>
            <div className="mt-3 text-4xl font-bold">
              $2.99<span className="text-base font-normal text-paper/70">/month</span>
            </div>
            <div className="text-xs text-paper/70 mt-1">or $2.39/mo billed yearly</div>
            <ul className="mt-4 space-y-2 text-sm text-paper/90">
              {premiumFeatures.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Button href="/buy/plans" variant="inverse" size="md">
                Go Premium
              </Button>
              <Button href="/pricing" variant="ghost" size="md" className="!text-paper/80 hover:!text-paper hover:!bg-paper/10">
                Compare →
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
