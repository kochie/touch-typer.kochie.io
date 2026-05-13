import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Touch Typer",
  description: "Practice typing. Get measurably faster. Free desktop typing tutor for Mac, Windows, and Linux.",
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
};

export default function Page() {
  return (
    <main className="container mx-auto px-6 py-24">
      <h1 className="text-4xl font-semibold">Touch Typer — rebuild in progress</h1>
    </main>
  );
}
