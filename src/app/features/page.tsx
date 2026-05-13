import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { PvpBlock } from "@/components/marketing/blocks/PvpBlock";
import { AiCoachBlock } from "@/components/marketing/blocks/AiCoachBlock";
import { StatsBlock } from "@/components/marketing/blocks/StatsBlock";
import { LayoutsBlock } from "@/components/marketing/blocks/LayoutsBlock";
import { CodeModeSection } from "@/components/marketing/CodeModeSection";
import { Tier2Grid } from "@/components/marketing/Tier2Grid";

export const metadata: Metadata = {
  title: "Features — Touch Typer",
  description: "Real-time PvP, AI Coach, deep stats, multi-layout support, Code Mode, and more. Everything you'd want in a typing tutor.",
  alternates: { canonical: "https://touch-typer.kochie.io/features" },
};

const anchors = [
  { id: "pvp", label: "PvP" },
  { id: "ai", label: "AI Coach" },
  { id: "stats", label: "Stats" },
  { id: "layouts", label: "Layouts" },
  { id: "code", label: "Code Mode" },
];

export default function FeaturesPage() {
  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="wide">
          <Eyebrow>Features</Eyebrow>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl">
            Everything Touch Typer can do.
          </h1>
          <p className="mt-6 text-lg text-fg/70 max-w-2xl">
            Five hero features that make Touch Typer different — and a handful of small ones that round it out.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="text-sm rounded-full border border-border bg-bg-elevated px-4 py-2 hover:bg-bg transition-colors"
              >
                {a.label}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      <PvpBlock />
      <AiCoachBlock />
      <StatsBlock />
      <LayoutsBlock />
      <CodeModeSection />
      <Tier2Grid />

      <Section tone="ink" density="default">
        <Container width="default">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Ready to start?</h2>
            <p className="mt-3 text-paper/70">Download free and try it for yourself.</p>
            <div className="mt-6">
              <Button href="/#download" variant="inverse" size="lg">Get Touch Typer</Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
