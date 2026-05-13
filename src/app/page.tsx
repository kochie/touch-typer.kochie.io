// TODO(user): Capture real screenshots before launch.
// Replace public/screenshots/{pvp,coach,stats,layouts}.png with real product captures.
// Target dimensions: 1200×760 PNG at 2x display density.
import { Metadata, Viewport } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FeatureMarquee } from "@/components/marketing/FeatureMarquee";
import { PvpBlock } from "@/components/marketing/blocks/PvpBlock";
import { AiCoachBlock } from "@/components/marketing/blocks/AiCoachBlock";
import { StatsBlock } from "@/components/marketing/blocks/StatsBlock";
import { LayoutsBlock } from "@/components/marketing/blocks/LayoutsBlock";
import { CodeModeSection } from "@/components/marketing/CodeModeSection";
import { Tier2Grid } from "@/components/marketing/Tier2Grid";

const description =
  "Practice typing. Get measurably faster. Free desktop typing tutor for Mac, Windows, and Linux. Real-time PvP, AI coach, and deep stats.";

export const metadata: Metadata = {
  title: "Touch Typer — Practice typing. Get measurably faster.",
  description,
  alternates: { canonical: "https://touch-typer.kochie.io" },
  openGraph: {
    type: "website",
    title: "Touch Typer",
    description,
    url: "https://touch-typer.kochie.io",
    siteName: "Touch Typer",
  },
  twitter: { card: "summary_large_image", site: "@kochie", creator: "@kochie" },
};

export const viewport: Viewport = { themeColor: "#fafaf9" };

export default function Page() {
  return (
    <main>
      <Hero />
      <FeatureMarquee />
      <PvpBlock />
      <AiCoachBlock />
      <StatsBlock />
      <LayoutsBlock />
      <CodeModeSection />
      <Tier2Grid />
    </main>
  );
}
