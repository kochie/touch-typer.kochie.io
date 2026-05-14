import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function StatsBlock() {
  return (
    <BigFeatureBlock
      anchor="stats"
      eyebrow="Analytics"
      title="See progress in numbers and pictures."
      body="WPM and accuracy over time. Per-key heatmaps. Streaks, goals, milestones. Everything synced across your devices."
      linkHref="/features#stats"
      linkLabel="Learn more"
      imageSrc="/screenshots/stats.png"
      imageAlt="Touch Typer stats — WPM chart over 6 months"
      imagePosition="right"
    />
  );
}
