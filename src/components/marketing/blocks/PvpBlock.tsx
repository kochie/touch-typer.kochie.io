import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";
import { PvpWireframe } from "@/components/marketing/wireframes/PvpWireframe";

export function PvpBlock() {
  return (
    <BigFeatureBlock
      anchor="pvp"
      eyebrow="Real-time PvP"
      eyebrowTone="accent"
      title="Race friends. Race strangers. Race the clock."
      body="Live 60-second duels with WPM, accuracy, and error feedback as you type. Invite a friend with a shareable link — they don't even need an account to play."
      linkHref="/features#pvp"
      linkLabel="Learn more"
      mockup={<PvpWireframe />}
      imagePosition="right"
    />
  );
}
