import { AppChrome } from "./AppChrome";

const FEATURES = [
  {
    title: "Speed Coaching",
    body: "Identify your slowest keys and bigrams. Get targeted drills to push past your WPM ceiling.",
    accent: "#d6a514",
    accentSoft: "rgba(214, 165, 20, 0.16)",
    icon: (
      <path
        d="M -3 -8 L 4 -8 L -1 0 L 4 0 L -4 9 L 0 1 L -5 1 Z"
        fill="currentColor"
      />
    ),
  },
  {
    title: "Accuracy Analysis",
    body: "Pinpoint error-prone letter pairs and finger stretches before bad habits take hold.",
    accent: "#dc2626",
    accentSoft: "rgba(220, 38, 38, 0.16)",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="0" cy="0" r="8" />
        <circle cx="0" cy="0" r="4.5" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
      </g>
    ),
  },
  {
    title: "Ergonomic Insights",
    body: "Understand hand balance and movement patterns to keep your typing comfortable long-term.",
    accent: "#d97706",
    accentSoft: "rgba(217, 119, 6, 0.16)",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M -8 -4 L 8 -4 L 8 3 C 8 6, 6 8, 3 8 L -5 8 C -7 8, -8 6, -8 3 Z" />
        <path d="M 8 -2 L 10 -2 C 12 -2, 12 2, 10 2 L 8 2" />
        <path d="M -5 -8 C -5 -6, -3 -6, -3 -8" />
        <path d="M -1 -8 C -1 -6, 1 -6, 1 -8" />
        <path d="M 3 -8 C 3 -6, 5 -6, 5 -8" />
      </g>
    ),
  },
  {
    title: "Practice Plans",
    body: "Personalised exercises generated from your recent sessions — not generic word lists.",
    accent: "#2d85d2",
    accentSoft: "rgba(45, 133, 210, 0.16)",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="-9" y="-5" width="18" height="10" rx="1.5" />
        <line x1="-6" y1="-2" x2="-4" y2="-2" />
        <line x1="-2" y1="-2" x2="0" y2="-2" />
        <line x1="2" y1="-2" x2="4" y2="-2" />
        <line x1="6" y1="-2" x2="8" y2="-2" />
        <line x1="-4" y1="2" x2="4" y2="2" />
      </g>
    ),
  },
  {
    title: "Rhythm Training",
    body: "Even out keystroke timing to build a smooth, consistent cadence across every finger.",
    accent: "#8b5cf6",
    accentSoft: "rgba(139, 92, 246, 0.18)",
    icon: (
      <g fill="currentColor">
        <rect x="-1" y="-9" width="2" height="14" />
        <ellipse cx="-3" cy="6" rx="3.5" ry="2.5" />
      </g>
    ),
  },
];

export function CoachWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AI Assistant screen showing the premium upsell with five feature cards and an upgrade button"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      <AppChrome activeTab="AI" />

      {/* Title row */}
      <g transform="translate(30, 96)">
        <rect width="46" height="46" rx="11" fill="rgba(139, 92, 246, 0.18)" />
        {/* Chip icon */}
        <g transform="translate(23, 23)" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="-7" y="-7" width="14" height="14" rx="2.5" />
          <rect x="-3" y="-3" width="6" height="6" rx="1" fill="currentColor" />
          {[-5, 0, 5].map((y) => (
            <g key={y}>
              <line x1="-9" y1={y} x2="-7" y2={y} />
              <line x1="9" y1={y} x2="7" y2={y} />
            </g>
          ))}
          {[-5, 0, 5].map((x) => (
            <g key={x}>
              <line x1={x} y1="-9" x2={x} y2="-7" />
              <line x1={x} y1="9" x2={x} y2="7" />
            </g>
          ))}
        </g>
        <text x="62" y="22" fontSize="20" fontWeight="700" fill="var(--color-fg)">
          AI Assistant
        </text>
        <text x="62" y="42" fontSize="13" fill="var(--color-fg-muted)">
          Personalized coaching based on your sessions
        </text>
      </g>

      {/* Banner */}
      <g transform="translate(30, 174)">
        <rect
          width="1140"
          height="86"
          rx="14"
          fill="rgba(139, 92, 246, 0.14)"
          stroke="rgba(139, 92, 246, 0.4)"
        />
        <text x="22" y="32" fontSize="15" fontWeight="700" fill="var(--color-fg)">
          Unlock your personal AI typing coach
        </text>
        <text x="22" y="56" fontSize="12" fill="var(--color-fg-muted)">
          Premium members get weekly AI-generated insights tailored to their actual sessions — speed
        </text>
        <text x="22" y="74" fontSize="12" fill="var(--color-fg-muted)">
          coaching, accuracy analysis, practice plans, and more.
        </text>
      </g>

      {/* Feature cards 3+2 grid */}
      {FEATURES.map((f, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 30 + col * 380;
        const y = 286 + row * 110;
        return (
          <g key={f.title} transform={`translate(${x}, ${y})`}>
            <rect width="360" height="92" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
            {/* Icon tile */}
            <rect x="16" y="16" width="44" height="44" rx="10" fill={f.accentSoft} />
            <g transform="translate(38, 38)" style={{ color: f.accent }}>
              {f.icon}
            </g>
            {/* Title + body */}
            <text x="74" y="34" fontSize="14" fontWeight="700" fill="var(--color-fg)">
              {f.title}
            </text>
            <text x="74" y="56" fontSize="11" fill="var(--color-fg-muted)">
              {f.body.length > 56 ? f.body.slice(0, 56) + "…" : f.body}
            </text>
            {f.body.length > 56 && (
              <text x="74" y="72" fontSize="11" fill="var(--color-fg-muted)">
                {f.body.slice(56).slice(0, 56)}
              </text>
            )}
          </g>
        );
      })}

      {/* Upgrade button */}
      <defs>
        <linearGradient id="upgradeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#2d85d2" />
        </linearGradient>
      </defs>
      <g transform="translate(484, 540)">
        <rect width="232" height="54" rx="12" fill="url(#upgradeGrad)" />
        <text x="116" y="34" fontSize="15" fontWeight="700" fill="#ffffff" textAnchor="middle">
          Upgrade to Premium
        </text>
      </g>
    </svg>
  );
}
