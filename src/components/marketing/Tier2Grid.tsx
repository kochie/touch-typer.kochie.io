import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FeatureGlyph } from "@/components/ui/FeatureGlyph";
import { Card } from "@/components/ui/Card";
import {
  faGrid2,
  faFire,
  faBullseye,
  faTrophy,
} from "@fortawesome/pro-duotone-svg-icons";

const items = [
  { icon: faGrid2, title: "Per-key heatmaps", body: "See your weakest keys at a glance. Color-coded by speed and accuracy." },
  { icon: faFire, title: "Streaks", body: "Build the daily habit. Freeze your streak with weekly bonuses when life happens." },
  { icon: faBullseye, title: "Goals & challenges", body: "Set measurable targets. Level up with structured challenges that adapt to your progress." },
  { icon: faTrophy, title: "Leaderboard", body: "Compete globally — or just with friends. Filter by layout, language, and time window." },
];

export function Tier2Grid() {
  return (
    <Section tone="paper" density="default">
      <Container width="wide">
        <div className="max-w-2xl">
          <Eyebrow>More</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Everything else you&apos;d want in a typing tutor.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.title} tone="paper-soft">
              <FeatureGlyph icon={item.icon} size="sm" ariaLabel={item.title} />
              <div className="mt-4 font-semibold">{item.title}</div>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">{item.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
