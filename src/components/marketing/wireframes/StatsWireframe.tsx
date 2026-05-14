import { AppChrome } from "./AppChrome";

const CHART_X0 = 70;
const CHART_X1 = 1120;
const CHART_Y0 = 410;
const CHART_BASELINE = 670;
const CHART_Y_AXIS_MAX = 300;

// Bar series — mix of light grey, blue, and a few red error bars.
// Each entry: { h: bar height (px above baseline), err?: error bar height below baseline, blue?: boolean }
const BARS: { h: number; err?: number; blue?: boolean; shade?: number }[] = [
  // grey history bars (mostly modest heights)
  { h: 96, shade: 0.4 }, { h: 142, shade: 0.5 }, { h: 70, shade: 0.35 }, { h: 60, shade: 0.3 },
  { h: 88, shade: 0.4 }, { h: 120, shade: 0.5 }, { h: 105, shade: 0.45 }, { h: 132, shade: 0.5 },
  { h: 100, shade: 0.4 }, { h: 70, shade: 0.35 }, { h: 95, shade: 0.4 }, { h: 60, shade: 0.3 },
  { h: 130, shade: 0.5 }, { h: 78, shade: 0.4 }, { h: 90, shade: 0.45 }, { h: 65, shade: 0.35 },
  { h: 110, shade: 0.5 }, { h: 145, shade: 0.55 }, { h: 90, shade: 0.45 },
  // blue current-level bars rising
  { h: 200, blue: true, err: 16 }, { h: 250, blue: true, err: 8 },
  { h: 240, blue: true, err: 12 }, { h: 265, blue: true, err: 20 },
  { h: 215, blue: true, err: 10 }, { h: 200, blue: true },
  { h: 175, blue: true }, { h: 150, blue: true }, { h: 165, blue: true },
  { h: 195, blue: true, err: 6 }, { h: 218, blue: true },
  { h: 240, blue: true, err: 14 }, { h: 260, blue: true, err: 22 },
  { h: 250, blue: true, err: 8 }, { h: 230, blue: true },
  { h: 210, blue: true }, { h: 190, blue: true }, { h: 180, blue: true, err: 4 },
  { h: 165, blue: true }, { h: 145, blue: true },
];

const Y_TICKS = [0, 50, 100, 150, 200, 250, 300];

export function StatsWireframe() {
  const barCount = BARS.length;
  const barSpan = (CHART_X1 - CHART_X0) / barCount;
  const barW = Math.max(6, barSpan * 0.55);

  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stats screen with level cards and per-session CPM bar chart"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      <AppChrome activeTab="STATS" />

      {/* Title row */}
      <g transform="translate(30, 96)">
        {/* Icon tile */}
        <rect width="46" height="46" rx="11" fill="var(--color-accent-soft)" />
        <g transform="translate(15, 14)" style={{ color: "var(--color-accent)" }}>
          <rect x="0" y="6" width="4" height="11" rx="0.8" fill="currentColor" />
          <rect x="6" y="0" width="4" height="17" rx="0.8" fill="currentColor" />
          <rect x="12" y="3" width="4" height="14" rx="0.8" fill="currentColor" />
        </g>
        {/* Title + subtitle */}
        <text x="62" y="22" fontSize="20" fontWeight="700" fill="var(--color-fg)">
          Stats
        </text>
        <text x="62" y="42" fontSize="13" fill="var(--color-fg-muted)">
          Your typing performance over time
        </text>
      </g>

      {/* Period pill selector — top right */}
      <g transform="translate(940, 96)">
        {/* Inactive: 7 days */}
        <rect x="0" y="6" width="68" height="34" rx="17" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <text x="34" y="28" fontSize="12" fill="var(--color-fg)" textAnchor="middle">
          7 days
        </text>
        {/* Active: 30 days */}
        <rect x="76" y="6" width="76" height="34" rx="17" fill="var(--color-accent-soft)" />
        <text x="114" y="28" fontSize="12" fontWeight="600" fill="var(--color-accent)" textAnchor="middle">
          30 days
        </text>
        {/* Inactive: All time */}
        <rect x="160" y="6" width="70" height="34" rx="17" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <text x="195" y="28" fontSize="12" fill="var(--color-fg)" textAnchor="middle">
          All time
        </text>
      </g>

      {/* Keyboard layout selector (compact) */}
      <g transform="translate(440, 168)">
        <text x="0" y="0" fontSize="13" fontWeight="600" fill="var(--color-fg)">
          Keyboard Layout
        </text>
        <text x="0" y="20" fontSize="11" fill="var(--color-fg-muted)">
          Show statistics for a specific keyboard layout
        </text>
        <g transform="translate(0, 32)">
          <rect width="340" height="36" rx="8" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          {/* Flag */}
          <rect x="14" y="10" width="22" height="16" rx="2" fill="#3c5599" />
          <rect x="14" y="10" width="22" height="3" fill="#bf2b3a" />
          <rect x="14" y="16" width="22" height="3" fill="#ffffff" />
          <rect x="14" y="22" width="22" height="3" fill="#bf2b3a" />
          <text x="46" y="23" fontSize="13" fontWeight="500" fill="var(--color-fg)">
            US QWERTY
          </text>
          {/* Caret */}
          <path d="M 320 14 L 325 19 L 330 14 M 320 22 L 325 17 L 330 22" stroke="var(--color-fg-muted)" strokeWidth="1.4" fill="none" />
        </g>
      </g>

      {/* Level cards row */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 30 + i * 195;
        const active = i === 0;
        return (
          <g key={i} transform={`translate(${x}, 256)`}>
            <rect
              width="180"
              height="100"
              rx="14"
              fill={active ? "#f5c518" : "var(--color-fg-muted)"}
              fillOpacity={active ? 1 : 0.32}
            />
            <text x="18" y="34" fontSize="15" fontWeight="700" fill={active ? "#1a1300" : "var(--color-fg)"}>
              Level {i + 1}
            </text>
            {active && (
              <>
                <text x="162" y="34" fontSize="11" fontWeight="600" fill="#3a2900" textAnchor="end">
                  01:00
                </text>
                {/* CPM pill */}
                <g transform="translate(18, 50)">
                  <rect width="64" height="22" rx="6" fill="#ffffff" fillOpacity="0.55" />
                  <text x="32" y="15" fontSize="11" fontWeight="600" fill="#1a1300" textAnchor="middle">
                    291cpm
                  </text>
                </g>
                {/* Errors pill */}
                <g transform="translate(88, 50)">
                  <rect width="62" height="22" rx="6" fill="#ffe6e6" />
                  <text x="31" y="15" fontSize="11" fontWeight="600" fill="#a31616" textAnchor="middle">
                    0 errors
                  </text>
                </g>
                {/* Stars */}
                <g transform="translate(60, 80)" fill="#3a2900">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <path
                      key={s}
                      transform={`translate(${s * 14}, 0)`}
                      d="M 5 0 L 6.2 3.5 L 10 3.5 L 7 5.8 L 8.2 9.3 L 5 7.1 L 1.8 9.3 L 3 5.8 L 0 3.5 L 3.8 3.5 Z"
                    />
                  ))}
                </g>
              </>
            )}
          </g>
        );
      })}

      {/* Chart background grid */}
      {Y_TICKS.map((v) => {
        const y = CHART_BASELINE - (v / CHART_Y_AXIS_MAX) * (CHART_BASELINE - CHART_Y0);
        return (
          <g key={v}>
            <line
              x1={CHART_X0}
              x2={CHART_X1}
              y1={y}
              y2={y}
              stroke="var(--color-fg-muted)"
              strokeOpacity="0.25"
              strokeDasharray="2 5"
            />
            <text x={CHART_X1 + 8} y={y + 4} fontSize="10" fill="var(--color-fg-muted)">
              {v}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {BARS.map((b, i) => {
        const x = CHART_X0 + i * barSpan + (barSpan - barW) / 2;
        const fill = b.blue ? "var(--color-accent)" : "var(--color-fg-muted)";
        const alpha = b.blue ? 0.92 : (b.shade ?? 0.4);
        return (
          <g key={i}>
            <rect
              x={x}
              y={CHART_BASELINE - b.h}
              width={barW}
              height={b.h}
              rx="2"
              fill={fill}
              fillOpacity={alpha}
            />
            {b.err && (
              <rect
                x={x}
                y={CHART_BASELINE + 2}
                width={barW}
                height={b.err}
                rx="2"
                fill="var(--color-bad)"
                fillOpacity="0.85"
              />
            )}
          </g>
        );
      })}

      {/* X baseline */}
      <line x1={CHART_X0} x2={CHART_X1} y1={CHART_BASELINE} y2={CHART_BASELINE} stroke="var(--color-border)" />
    </svg>
  );
}
