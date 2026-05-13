import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type CardTone = "paper" | "paper-soft" | "ink";
type Emphasis = "default" | "featured" | "gradient";

// paper / paper-soft are theme-aware; ink stays never-swap.
const tones: Record<CardTone, string> = {
  paper: "bg-bg border-border",
  "paper-soft": "bg-bg-elevated border-border",
  ink: "bg-ink border-ink-soft text-paper",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: CardTone;
  emphasis?: Emphasis;
}

export function Card({
  children,
  tone = "paper",
  emphasis = "default",
  className,
  ...rest
}: CardProps) {
  // emphasis="gradient" overrides tone styling with an accent gradient — used by Premium pricing card.
  const gradientClasses =
    emphasis === "gradient"
      ? "bg-gradient-to-br from-accent to-accent-deep border-transparent text-paper shadow-accent"
      : tones[tone];

  return (
    <div
      className={clsx(
        "rounded-xl border p-6",
        gradientClasses,
        emphasis === "featured" && "border-fg shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
