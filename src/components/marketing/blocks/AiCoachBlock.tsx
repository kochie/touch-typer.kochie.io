import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function AiCoachBlock() {
  return (
    <BigFeatureBlock
      anchor="ai"
      eyebrow="AI Coach · Premium"
      eyebrowTone="accent"
      title="Your weakest keys, on a schedule."
      body="AI Coach reads your last 30 days of practice, generates targeted drills for the keys you struggle with, and tells you why your progress stalled."
      linkHref="/features#ai"
      linkLabel="Learn more"
      imageSrcLight="/screenshots/coach-light.png"
      imageSrcDark="/screenshots/coach-dark.png"
      imageAlt="Touch Typer AI Coach — drill recommendation panel"
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
