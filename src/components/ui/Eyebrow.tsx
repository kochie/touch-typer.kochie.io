import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type EyebrowTone = "default" | "accent" | "muted";

const tones: Record<EyebrowTone, string> = {
  default: "text-fg-muted",
  accent: "text-accent",
  muted: "text-fg-muted/70",
};

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: EyebrowTone;
}

export function Eyebrow({
  children,
  tone = "default",
  className,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={clsx(
        "text-xs font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
