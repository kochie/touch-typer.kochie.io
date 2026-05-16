import { compile, run } from "@mdx-js/mdx";
import { readFile } from "fs/promises";
import path from "path";
import * as runtime from "react/jsx-runtime";
import { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Terms & Conditions — Touch Typer",
  description: "The terms that govern your use of Touch Typer.",
};

const components = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-2xl font-bold mt-8 mb-4 text-fg">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-xl font-semibold mt-6 mb-3 text-fg">{children}</h2>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a href={href} className="text-accent hover:text-accent-deep underline">
      {children}
    </a>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-4 text-fg/80 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-4 list-disc list-inside text-fg/80 space-y-1">{children}</ul>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export default async function Page() {
  const markdown = await readFile(
    path.join(process.cwd(), "src/app/terms/terms_and_conditions.md"),
    "utf-8"
  );
  const code = String(
    await compile(markdown, { outputFormat: "function-body" })
  );

  const { default: MDXContent } = await run(code, {
    ...runtime as any,
    baseUrl: import.meta.url,
  });

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-3 text-4xl font-bold text-fg">Terms &amp; Conditions</h1>
          <div className="mt-8 prose-styles">
            <MDXContent components={components} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
