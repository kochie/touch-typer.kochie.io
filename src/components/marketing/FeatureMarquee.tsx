import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { FeatureGlyph } from "@/components/ui/FeatureGlyph";
import {
  faSwords,
  faSparkles,
  faChartLine,
  faKeyboard,
  faCode,
} from "@fortawesome/pro-duotone-svg-icons";

const items = [
  { icon: faSwords, name: "Real-time PvP", blurb: "Race anyone, anywhere", href: "/features#pvp" },
  { icon: faSparkles, name: "AI Coach", blurb: "Adaptive practice", href: "/features#ai" },
  { icon: faChartLine, name: "Deep stats", blurb: "Track your progress", href: "/features#stats" },
  { icon: faKeyboard, name: "Any layout", blurb: "QWERTY, Dvorak, Colemak…", href: "/features#layouts" },
  { icon: faCode, name: "Code Mode", blurb: "40+ languages", href: "/features#code" },
];

export function FeatureMarquee() {
  return (
    <Section tone="paper-soft" density="compact">
      <Container width="wide">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <a key={item.name} href={item.href} className="block">
              <Card tone="paper" className="h-full transition-colors hover:border-accent/40">
                <FeatureGlyph icon={item.icon} size="sm" ariaLabel={item.name} />
                <div className="mt-3 font-semibold text-sm">{item.name}</div>
                <div className="mt-1 text-xs text-fg-muted">{item.blurb}</div>
              </Card>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
