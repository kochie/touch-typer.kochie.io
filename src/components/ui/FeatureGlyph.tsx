import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

interface FeatureGlyphProps {
  icon: IconDefinition;
  size?: Size;
  className?: string;
  ariaLabel?: string;
}

export function FeatureGlyph({
  icon,
  size = "md",
  className,
  ariaLabel,
}: FeatureGlyphProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg bg-ink text-paper",
        sizes[size],
        className,
      )}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
