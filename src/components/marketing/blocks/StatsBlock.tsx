import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";
import { StatsWireframe } from "@/components/marketing/wireframes/StatsWireframe";

export function StatsBlock() {
  return (
    <BigFeatureBlock
      anchor="stats"
      eyebrow="Analytics"
      title="See progress in numbers and pictures."
      body="WPM and accuracy over time. Per-key heatmaps. Streaks, goals, milestones. Everything synced across your devices."
      linkHref="/features#stats"
      linkLabel="Learn more"
      mockup={<StatsWireframe />}
      imagePosition="right"
    />
  );
}
