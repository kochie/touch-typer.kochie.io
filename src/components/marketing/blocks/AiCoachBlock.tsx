import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";
import { CoachWireframe } from "@/components/marketing/wireframes/CoachWireframe";

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
      mockup={<CoachWireframe />}
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
