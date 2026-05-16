"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "subscription", label: "Subscription" },
  { id: "danger", label: "Danger zone" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SectionNav() {
  const [active, setActive] = useState<SectionId>("profile");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id as SectionId);
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Account sections" className="hidden lg:block">
      <ul className="sticky top-24 flex flex-col gap-1">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={clsx(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === section.id
                  ? "bg-accent/10 text-accent"
                  : "text-fg/60 hover:bg-bg-elevated hover:text-fg"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
