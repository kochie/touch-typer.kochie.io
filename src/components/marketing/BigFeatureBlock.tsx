import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface BigFeatureBlockProps {
  eyebrow: string;
  eyebrowTone?: "default" | "accent";
  title: ReactNode;
  body: ReactNode;
  linkHref: string;
  linkLabel: string;
  /** Light-mode screenshot. Shown when the site is in light mode. */
  imageSrcLight: string;
  /** Dark-mode screenshot. Shown when the site is in dark mode. */
  imageSrcDark: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  tone?: "paper" | "paper-soft";
  anchor?: string;
}

export function BigFeatureBlock({
  eyebrow,
  eyebrowTone = "default",
  title,
  body,
  linkHref,
  linkLabel,
  imageSrcLight,
  imageSrcDark,
  imageAlt,
  imagePosition = "right",
  tone = "paper",
  anchor,
}: BigFeatureBlockProps) {
  return (
    <Section tone={tone} id={anchor}>
      <Container width="wide">
        <div className="grid gap-12 items-center md:grid-cols-2">
          <div className={clsx(imagePosition === "left" && "md:order-2")}>
            <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-4 text-base text-fg/70 leading-relaxed max-w-prose">
              {body}
            </p>
            <Link
              href={linkHref}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep"
            >
              {linkLabel} →
            </Link>
          </div>
          <div className={clsx(imagePosition === "left" && "md:order-1")}>
            <div className="rounded-xl border border-accent bg-bg-elevated p-2 shadow-accent-glow">
              {/* Light-mode image — hidden in dark mode */}
              <Image
                src={imageSrcLight}
                alt={imageAlt}
                className="rounded-lg w-full h-auto block dark:hidden"
                width={1200}
                height={760}
              />
              {/* Dark-mode image — hidden in light mode */}
              <Image
                src={imageSrcDark}
                alt={imageAlt}
                className="rounded-lg w-full h-auto hidden dark:block"
                width={1200}
                height={760}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
