import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";
type Tone = "ink" | "accent";

const sizes: Record<Size, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  accent: "bg-accent text-paper",
};

interface FeatureGlyphProps {
  icon: IconDefinition;
  size?: Size;
  tone?: Tone;
  className?: string;
  ariaLabel?: string;
}

export function FeatureGlyph({
  icon,
  size = "md",
  tone = "ink",
  className,
  ariaLabel,
}: FeatureGlyphProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
