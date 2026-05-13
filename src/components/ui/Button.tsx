import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft focus-visible:ring-fg",
  secondary: "bg-bg text-fg border border-border hover:bg-bg-elevated focus-visible:ring-fg",
  ghost: "bg-transparent text-fg hover:bg-bg-elevated focus-visible:ring-fg",
  accent: "bg-accent text-paper hover:bg-accent-deep focus-visible:ring-accent",
  inverse: "bg-paper text-ink hover:bg-paper-soft focus-visible:ring-paper",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkButtonProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      className,
      children,
      ...rest
    } = props as CommonProps & { className?: string; href?: string };

    const cls = clsx(base, variants[variant], sizes[size], className);

    if ("href" in rest && rest.href) {
      const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          {...anchorRest}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);
