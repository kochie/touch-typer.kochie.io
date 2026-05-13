import { Metadata, Viewport } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FeatureMarquee } from "@/components/marketing/FeatureMarquee";

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
    </main>
  );
}
