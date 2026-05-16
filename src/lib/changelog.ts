import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface ChangelogEntry {
  slug: string;
  version: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  tags: string[];
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "changelog");

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);
        const slug = file.replace(/\.mdx$/, "");
        return {
          slug,
          version: String(data.version ?? ""),
          date: String(data.date ?? ""),
          title: String(data.title ?? slug),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          body: content,
        } satisfies ChangelogEntry;
      })
  );
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
