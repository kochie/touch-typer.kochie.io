import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { StoreBadge } from "@/components/ui/StoreBadge";

export function Hero() {
  return (
    <Section
      tone="paper"
      density="spacious"
      className="relative overflow-hidden bg-gradient-to-br from-accent-soft to-bg"
    >
      {/* Decorative radial blob top-right — slow blue throb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full accent-throb"
        style={{
          background: "radial-gradient(circle, rgba(45,133,210,0.32), transparent 70%)",
        }}
      />
      {/* Second blob, lower-left, offset phase for layered breath */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full accent-throb"
        style={{
          background: "radial-gradient(circle, rgba(45,133,210,0.22), transparent 70%)",
          animationDelay: "-3.5s",
        }}
      />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <span className="inline-block bg-accent text-paper rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
            New — Real-time PvP duels
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Practice typing. Get measurably{" "}
            <span className="text-accent border-b-4 border-accent pb-1">
              faster
              <span
                className="cursor-blink inline-block w-[3px] h-[0.9em] bg-accent align-[-0.1em] ml-1"
                aria-hidden
              />
            </span>
            .
          </h1>

          <p className="mt-6 text-lg text-fg/70 max-w-2xl leading-relaxed">
            Touch Typer is the desktop typing tutor that turns deliberate practice into real progress.
            Free and open source. Mac, Windows, Linux.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="#download" variant="accent" size="lg" className="shadow-accent">
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
