import { ReactNode } from "react";
import clsx from "clsx";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={clsx(
        "bg-ink-soft text-paper rounded-xl p-6 overflow-x-auto",
        "font-mono text-sm leading-relaxed",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

/** Inline span helpers for hand-authored syntax highlighting inside CodeBlock. */
export const Token = {
  Keyword: ({ children }: { children: ReactNode }) => (
    <span className="text-accent">{children}</span>
  ),
  Comment: ({ children }: { children: ReactNode }) => (
    <span className="text-mute">{children}</span>
  ),
  String: ({ children }: { children: ReactNode }) => (
    <span className="text-warm">{children}</span>
  ),
  Prompt: ({ children }: { children: ReactNode }) => (
    <span className="text-accent">{children}</span>
  ),
};
