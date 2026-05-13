import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type CardTone = "paper" | "paper-soft" | "ink";
type Emphasis = "default" | "featured";

const tones: Record<CardTone, string> = {
  paper: "bg-paper border-line",
  "paper-soft": "bg-paper-soft border-line",
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
  return (
    <div
      className={clsx(
        "rounded-xl border p-6",
        tones[tone],
        emphasis === "featured" && "border-ink shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
