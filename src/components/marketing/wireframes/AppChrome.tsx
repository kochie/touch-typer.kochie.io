/**
 * Top-nav strip used by every wireframe. Renders as an SVG <g> so callers
 * can embed it inside their own <svg viewBox="0 0 1200 760">.
 */

type Tab = "STATS" | "MAP" | "PRACTICE" | "CODE" | "AI" | "ARENA";

const TABS: { id: Tab; x: number }[] = [
  { id: "STATS", x: 30 },
  { id: "MAP", x: 90 },
  { id: "PRACTICE", x: 150 },
  { id: "CODE", x: 220 },
  { id: "AI", x: 270 },
  { id: "ARENA", x: 325 },
];

function TabIcon({ id }: { id: Tab }) {
  switch (id) {
    case "STATS":
      return (
        <g>
          <rect x="-8" y="-3" width="3.5" height="12" rx="0.6" fill="currentColor" />
          <rect x="-2.5" y="-9" width="3.5" height="18" rx="0.6" fill="currentColor" />
          <rect x="3" y="-6" width="3.5" height="15" rx="0.6" fill="currentColor" />
        </g>
      );
    case "MAP":
      return (
        <polygon
          points="0,-10 8.5,-5 8.5,5 0,10 -8.5,5 -8.5,-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      );
    case "PRACTICE":
      return (
        <g>
          <rect x="-10" y="-6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="-6" y1="-2" x2="-4" y2="-2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="-2" y1="-2" x2="0" y2="-2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2" y1="-2" x2="4" y2="-2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="-2" x2="8" y2="-2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="-4" y1="2.5" x2="4" y2="2.5" stroke="currentColor" strokeWidth="1.5" />
        </g>
      );
    case "CODE":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="-5,-6 -11,0 -5,6" />
          <polyline points="5,-6 11,0 5,6" />
          <line x1="-2" y1="7" x2="2" y2="-7" />
        </g>
      );
    case "AI":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="-7" y="-7" width="14" height="14" rx="2.5" />
          <rect x="-3.5" y="-3.5" width="7" height="7" rx="1" />
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
      );
    case "ARENA":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <line x1="-8" y1="-8" x2="8" y2="8" />
          <line x1="8" y1="-8" x2="-8" y2="8" />
        </g>
      );
  }
}

function NavTab({ id, x, active }: { id: Tab; x: number; active: boolean }) {
  const labelDx = id === "PRACTICE" ? 6 : id === "ARENA" ? 0 : 0;
  return (
    <g transform={`translate(${x + 24}, 14)`}>
      {active && (
        <rect
          x="-20"
          y="-4"
          width="48"
          height="42"
          rx="10"
          fill="var(--color-accent-soft)"
        />
      )}
      <g
        transform="translate(4, 10)"
        style={{ color: active ? "var(--color-accent)" : "var(--color-fg-muted)" }}
      >
        <TabIcon id={id} />
      </g>
      <text
        x={4 + labelDx}
        y="34"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.12em"
        fill={active ? "var(--color-accent)" : "var(--color-fg-muted)"}
        textAnchor="middle"
      >
        {id}
      </text>
    </g>
  );
}

function RightCluster() {
  return (
    <g transform="translate(1020, 26)">
      {/* Streak flame + count */}
      <g transform="translate(0, 0)">
        <path
          d="M 8 0 C 4 4, 2 8, 4 14 C 6 18, 12 18, 14 14 C 16 10, 14 6, 11 4 C 13 7, 12 10, 10 11 C 11 7, 9 4, 8 0 Z"
          fill="var(--color-warm)"
        />
        <text x="22" y="14" fontSize="13" fontWeight="700" fill="var(--color-warm)">
          30
        </text>
      </g>
      {/* Avatar circle */}
      <g transform="translate(58, 0)">
        <circle cx="9" cy="9" r="11" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <circle cx="9" cy="6" r="3" fill="var(--color-fg-muted)" />
        <path d="M 2 16 C 3 12, 15 12, 16 16 Z" fill="var(--color-fg-muted)" />
      </g>
      {/* Sparkle */}
      <g transform="translate(98, 0)" fill="var(--color-fg-muted)">
        <path d="M 9 0 L 11 7 L 18 9 L 11 11 L 9 18 L 7 11 L 0 9 L 7 7 Z" />
      </g>
      {/* Gear */}
      <g transform="translate(132, 0)" fill="none" stroke="var(--color-fg-muted)" strokeWidth="1.5">
        <circle cx="9" cy="9" r="3.5" />
        <circle cx="9" cy="9" r="8" strokeDasharray="2.5 2" />
      </g>
    </g>
  );
}

export function AppChrome({ activeTab }: { activeTab: Tab }) {
  return (
    <g>
      {TABS.map((t) => (
        <NavTab key={t.id} id={t.id} x={t.x} active={t.id === activeTab} />
      ))}
      <RightCluster />
    </g>
  );
}
