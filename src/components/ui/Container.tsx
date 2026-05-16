import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

type Width = "narrow" | "default" | "wide";

const widths: Record<Width, string> = {
  narrow: "max-w-2xl",   // 672px — text-heavy pages, changelog entries
  default: "max-w-6xl",  // 1152px — most marketing pages
  wide: "max-w-7xl",     // 1280px — feature blocks with side-by-side media
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  width?: Width;
}

export function Container({
  children,
  width = "default",
  className,
  ...rest
}: ContainerProps) {
  return (
    <div className={clsx("mx-auto px-6 sm:px-8", widths[width], className)} {...rest}>
      {children}
    </div>
  );
}
