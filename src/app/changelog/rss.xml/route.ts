import { getChangelogEntries } from "@/lib/changelog";

const SITE = "https://touch-typer.kochie.io";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const entries = await getChangelogEntries();
  const items = entries
    .map((e) => `
      <item>
        <title>${escape(e.title)}</title>
        <link>${SITE}/changelog#${e.slug}</link>
        <guid isPermaLink="false">${e.slug}</guid>
        <pubDate>${new Date(e.date + "T00:00:00Z").toUTCString()}</pubDate>
        <description>${escape(e.body.slice(0, 600))}</description>
      </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Touch Typer — Changelog</title>
  <link>${SITE}/changelog</link>
  <description>Recent releases and updates for Touch Typer.</description>
  <language>en</language>
  ${items}
</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
