import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "paper" | "paper-soft" | "ink" | "ink-soft";
type Density = "compact" | "default" | "spacious";

// paper / paper-soft are now theme-aware (flip with theme).
// ink / ink-soft stay never-swap (always dark in both themes).
const tones: Record<Tone, string> = {
  paper: "bg-bg text-fg",
  "paper-soft": "bg-bg-elevated text-fg",
  ink: "bg-ink text-paper",
  "ink-soft": "bg-ink-soft text-paper",
};

const densities: Record<Density, string> = {
  compact: "py-12 sm:py-16",
  default: "py-20 sm:py-28",
  spacious: "py-28 sm:py-40",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: Tone;
  density?: Density;
}

export function Section({
  children,
  tone = "paper",
  density = "default",
  className,
  id,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(tones[tone], densities[density], className)}
      {...rest}
    >
      {children}
    </section>
  );
}
