import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getChangelogEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — Touch Typer",
  description: "Recent releases and updates for Touch Typer.",
  alternates: {
    canonical: "https://touch-typer.kochie.io/changelog",
    types: { "application/rss+xml": "/changelog/rss.xml" },
  },
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Changelog</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">What's new.</h1>
          <p className="mt-4 text-base text-ink/70">
            Recent releases, ordered newest first.{" "}
            <a href="/changelog/rss.xml" className="text-accent hover:text-accent-deep">
              RSS feed
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="paper" density="compact">
        <Container width="narrow">
          <div className="space-y-16">
            {entries.map((entry) => (
              <article key={entry.slug} id={entry.slug}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs uppercase tracking-[0.1em] text-mute">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-xs rounded-full bg-paper-soft border border-line px-2 py-0.5">
                    v{entry.version}
                  </span>
                  {entry.tags.map((t) => (
                    <span key={t} className="text-xs rounded-full bg-accent/10 text-accent-deep px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{entry.title}</h2>
                <div className="mt-4 text-base text-ink/80 leading-relaxed prose-styles">
                  <MDXRemote source={entry.body} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
