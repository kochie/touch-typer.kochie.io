import { MetadataRoute } from "next";
import { getChangelogEntries } from "@/lib/changelog";

const SITE = "https://touch-typer.kochie.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getChangelogEntries();
  const now = new Date();
  const newestEntry = entries[0]?.date
    ? new Date(entries[0].date + "T00:00:00Z")
    : now;

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/changelog`, lastModified: newestEntry, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];
}
