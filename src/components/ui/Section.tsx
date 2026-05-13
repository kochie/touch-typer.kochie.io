import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "paper" | "paper-soft" | "ink" | "ink-soft";
type Density = "compact" | "default" | "spacious";

const tones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  "paper-soft": "bg-paper-soft text-ink",
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
