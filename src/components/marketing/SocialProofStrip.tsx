import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

// TODO(user): Replace these placeholder numbers with real metrics before launch.
const stats = [
  { value: "10k+", label: "Users practicing" },
  { value: "3", label: "Platforms (Mac · Win · Linux)" },
  { value: "MIT", label: "Open source license" },
];

export function SocialProofStrip() {
  return (
    <Section tone="paper-soft" density="compact">
      <Container width="default">
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.1em] text-mute">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
