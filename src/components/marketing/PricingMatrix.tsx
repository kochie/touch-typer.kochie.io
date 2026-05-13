import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/pro-solid-svg-icons";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface Row {
  label: string;
  free: boolean | string;
  premium: boolean | string;
}

const rows: Row[] = [
  { label: "Real-time PvP duels", free: true, premium: true },
  { label: "WPM and accuracy over time", free: true, premium: true },
  { label: "Per-key heatmap", free: true, premium: true },
  { label: "Multi-layout support (QWERTY, Dvorak, Colemak, etc.)", free: true, premium: true },
  { label: "Code Mode (40+ languages)", free: true, premium: true },
  { label: "Cross-device sync", free: true, premium: true },
  { label: "Public leaderboard", free: true, premium: true },
  { label: "Streaks", free: "Basic", premium: "Basic + freezes" },
  { label: "Goals & challenges", free: "Basic", premium: "Advanced" },
  { label: "AI Coach", free: false, premium: true },
  { label: "AI-generated custom drills", free: false, premium: true },
  { label: "AI insights ('why your progress stalled')", free: false, premium: true },
  { label: "Streak freezes (1 free per week)", free: false, premium: true },
  { label: "Priority support", free: false, premium: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <FontAwesomeIcon icon={faCheck} className="text-good" aria-label="Included" />;
  }
  if (value === false) {
    return <FontAwesomeIcon icon={faMinus} className="text-mute" aria-label="Not included" />;
  }
  return <span className="text-sm">{value}</span>;
}

export function PricingMatrix() {
  return (
    <Section tone="paper-soft" density="default">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Full comparison</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold">Every feature, side by side.</h2>
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-4 pr-4 text-sm font-semibold text-ink/80">Feature</th>
                <th className="py-4 px-4 text-sm font-semibold text-ink/80 text-center w-32">Free</th>
                <th className="py-4 px-4 text-sm font-semibold text-ink text-center w-32">Premium</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-line/60">
                  <td className="py-4 pr-4 text-sm">{r.label}</td>
                  <td className="py-4 px-4 text-center"><Cell value={r.free} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={r.premium} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
