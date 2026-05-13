import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StoreBadge } from "@/components/ui/StoreBadge";

export function Hero() {
  return (
    <Section tone="paper" density="spacious">
      <Container width="wide">
        <div className="max-w-3xl">
          <Eyebrow>New — Real-time PvP duels</Eyebrow>
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Practice typing. Get measurably{" "}
            <span className="text-accent">
              faster<span className="cursor-blink inline-block w-[3px] h-[0.9em] bg-accent align-[-0.1em] ml-1" aria-hidden />
            </span>
            .
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-2xl leading-relaxed">
            Touch Typer is the desktop typing tutor that turns deliberate practice into real progress.
            Free and open source. Mac, Windows, Linux.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="#download" variant="primary" size="lg">
              Download free
            </Button>
            <Button href="/features" variant="secondary" size="lg">
              See features
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <StoreBadge store="mac" />
            <StoreBadge store="ms" />
            <StoreBadge store="snap" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
