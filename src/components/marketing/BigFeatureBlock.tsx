import { ReactNode } from "react";
import Image, { StaticImageData } from "next/image";
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
  imageSrc: string | StaticImageData;
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
  imageSrc,
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
            <p className="mt-4 text-base text-ink/70 leading-relaxed max-w-prose">
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
            <div className="rounded-xl border border-line bg-paper-soft p-2 shadow-sm">
              <Image
                src={imageSrc}
                alt={imageAlt}
                className="rounded-lg w-full h-auto"
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
