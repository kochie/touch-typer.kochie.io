import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PricingMatrix } from "@/components/marketing/PricingMatrix";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Pricing — Touch Typer",
  description: "Free to download. Premium is $2.99 USD/month or $2.39 USD/month billed yearly. Compare Free and Premium features. All prices in USD.",
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
      <JsonLd
        id="ld-faqpage"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Is there a free trial of Premium?", acceptedAnswer: { "@type": "Answer", text: "There's no time-limited trial, but the Free tier is generous." } },
            { "@type": "Question", name: "Can I cancel anytime?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel from the billing portal anytime — you keep Premium until the end of your current billing period." } },
            { "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: "Through Stripe: Visa, Mastercard, Amex, Apple Pay, Google Pay, Link. Through the Mac App Store: whatever Apple ID has on file." } },
            { "@type": "Question", name: "Is Touch Typer open source?", acceptedAnswer: { "@type": "Answer", text: "Yes — MIT-licensed at github.com/kochie/touch-type." } },
          ],
        }}
      />
      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Free to download. Affordable to upgrade.
            </h1>
            <p className="mt-6 text-lg text-fg/70">
              Pick a plan when you're ready. No trial games, no manipulative pricing tactics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <Card tone="paper">
              <Eyebrow>Free</Eyebrow>
              <div className="mt-3 text-4xl sm:text-5xl font-bold">$0</div>
              <div className="text-sm text-fg-muted mt-1">Forever</div>
              <ul className="mt-6 space-y-3 text-sm text-fg/80">
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
            <Card emphasis="gradient">
              <Eyebrow tone="default" className="!text-paper/80">Premium · Most popular</Eyebrow>
              <div className="mt-3 text-4xl sm:text-5xl font-bold">
                $2.99<span className="text-base font-normal text-paper/70"> USD/mo</span>
              </div>
              <div className="text-sm text-paper/70 mt-1">or $2.39 USD/mo billed yearly</div>
              <ul className="mt-6 space-y-3 text-sm text-paper/90">
                {premiumFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/buy/plans" variant="inverse" size="md" className="w-full">
                  Go Premium
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Streak freezes</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              One-off consumables
            </h2>
            <p className="mt-4 text-base text-fg/70">
              Save a streak you'd otherwise lose. Premium subscribers receive one free freeze per week; extras can be purchased in packs.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            <Card tone="paper">
              <div className="text-sm font-medium text-fg/70">1 freeze</div>
              <div className="mt-2 text-3xl font-bold">$1<span className="text-sm font-normal text-fg/60"> USD</span></div>
            </Card>
            <Card tone="paper">
              <div className="text-sm font-medium text-fg/70">3 freezes</div>
              <div className="mt-2 text-3xl font-bold">$2<span className="text-sm font-normal text-fg/60"> USD</span></div>
              <div className="text-xs text-fg/50 mt-1">Save 33%</div>
            </Card>
            <Card tone="paper">
              <div className="text-sm font-medium text-fg/70">10 freezes</div>
              <div className="mt-2 text-3xl font-bold">$6<span className="text-sm font-normal text-fg/60"> USD</span></div>
              <div className="text-xs text-fg/50 mt-1">Save 40%</div>
            </Card>
          </div>

          <p className="mt-6 text-xs text-fg/50 text-center">
            Available to Premium subscribers from inside the app.
          </p>
        </Container>
      </Section>

      <PricingMatrix />
      <PricingFAQ />
      <Section tone="paper" density="compact">
        <Container width="default">
          <p className="text-xs text-fg/50 text-center">All prices in USD unless otherwise specified. Tax may apply.</p>
        </Container>
      </Section>
    </main>
  );
}
