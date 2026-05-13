import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <Section tone="ink" density="spacious" id="download">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Start typing better today.
          </h2>
          <p className="mt-4 text-base text-paper/70">
            Free download. No account required to start practicing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="https://apps.apple.com/au/app/touch-typer/id1637786724" variant="inverse" size="lg">
              Download for Mac
            </Button>
            <Button href="https://www.microsoft.com/store/apps/9NG3CCFL631D" variant="inverse" size="lg">
              Download for Windows
            </Button>
            <Button href="https://snapcraft.io/touch-typer" variant="inverse" size="lg">
              Download for Linux
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
