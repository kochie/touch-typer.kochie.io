export function StatsWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stats dashboard showing average CPM, accuracy, sessions, a CPM-over-time chart, problem keys heatmap, and recent sessions"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      {/* Background */}
      <rect width="1200" height="760" fill="var(--color-bg)" />

      {/* Title row */}
      <text x="40" y="60" fontSize="22" fontWeight="600" fill="var(--color-fg)">
        Stats
      </text>
      <text
        x="40"
        y="84"
        fontSize="13"
        fill="var(--color-fg-muted)"
        letterSpacing="0.04em"
      >
        Last 30 days
      </text>

      {/* Period tabs */}
      <g transform="translate(900, 42)">
        <rect
          x="0"
          y="0"
          rx="8"
          width="260"
          height="36"
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
        />
        <rect
          x="92"
          y="4"
          rx="6"
          width="80"
          height="28"
          fill="var(--color-accent)"
        />
        <text x="40" y="23" fontSize="13" fill="var(--color-fg-muted)" textAnchor="middle">
          Week
        </text>
        <text x="132" y="23" fontSize="13" fill="#ffffff" fontWeight="600" textAnchor="middle">
          Month
        </text>
        <text x="222" y="23" fontSize="13" fill="var(--color-fg-muted)" textAnchor="middle">
          Year
        </text>
      </g>

      {/* KPI cards row */}
      {[
        { x: 40, label: "Avg CPM", value: "287", delta: "↑ 12%", deltaColor: "var(--color-good)" },
        { x: 410, label: "Accuracy", value: "96.4%", delta: "↑ 1.2 pts", deltaColor: "var(--color-good)" },
        { x: 780, label: "Sessions", value: "47", delta: "this month", deltaColor: "var(--color-fg-muted)" },
      ].map((kpi) => (
        <g key={kpi.x} transform={`translate(${kpi.x}, 112)`}>
          <rect
            width="350"
            height="120"
            rx="12"
            fill="var(--color-bg-elevated)"
            stroke="var(--color-border)"
          />
          <text x="20" y="34" fontSize="12" fill="var(--color-fg-muted)" letterSpacing="0.08em">
            {kpi.label.toUpperCase()}
          </text>
          <text x="20" y="82" fontSize="42" fontWeight="700" fill="var(--color-fg)">
            {kpi.value}
          </text>
          <text x="20" y="104" fontSize="13" fill={kpi.deltaColor} fontWeight="500">
            {kpi.delta}
          </text>
        </g>
      ))}

      {/* CPM-over-time chart card */}
      <g transform="translate(40, 258)">
        <rect
          width="760"
          height="320"
          rx="12"
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
        />
        <text x="20" y="34" fontSize="14" fontWeight="600" fill="var(--color-fg)">
          CPM over time
        </text>
        <text x="20" y="54" fontSize="11" fill="var(--color-fg-muted)">
          May 14 – May 30
        </text>

        {/* Y-axis ticks */}
        {[
          { y: 100, label: "320" },
          { y: 160, label: "280" },
          { y: 220, label: "240" },
          { y: 280, label: "200" },
        ].map((t) => (
          <g key={t.y}>
            <line
              x1="60"
              x2="740"
              y1={t.y}
              y2={t.y}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <text x="50" y={t.y + 4} fontSize="10" fill="var(--color-fg-muted)" textAnchor="end">
              {t.label}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {["W1", "W2", "W3", "W4"].map((label, i) => (
          <text
            key={label}
            x={60 + i * 226}
            y="304"
            fontSize="10"
            fill="var(--color-fg-muted)"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Area fill under the line */}
        <path
          d="M 60 240 L 120 232 L 180 218 L 240 226 L 300 200 L 360 186 L 420 192 L 480 168 L 540 150 L 600 142 L 660 124 L 720 116 L 720 280 L 60 280 Z"
          fill="var(--color-accent)"
          fillOpacity="0.12"
        />

        {/* Line */}
        <path
          d="M 60 240 L 120 232 L 180 218 L 240 226 L 300 200 L 360 186 L 420 192 L 480 168 L 540 150 L 600 142 L 660 124 L 720 116"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {[
          [60, 240], [120, 232], [180, 218], [240, 226], [300, 200], [360, 186],
          [420, 192], [480, 168], [540, 150], [600, 142], [660, 124], [720, 116],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--color-bg-elevated)" stroke="var(--color-accent)" strokeWidth="2" />
        ))}

        {/* Latest-point callout */}
        <g transform="translate(660, 70)">
          <rect width="120" height="40" rx="6" fill="var(--color-accent)" />
          <text x="60" y="18" fontSize="10" fill="#ffffff" fillOpacity="0.85" textAnchor="middle">
            May 30
          </text>
          <text x="60" y="33" fontSize="14" fontWeight="700" fill="#ffffff" textAnchor="middle">
            316 CPM
          </text>
        </g>
      </g>

      {/* Problem keys card */}
      <g transform="translate(820, 258)">
        <rect
          width="340"
          height="320"
          rx="12"
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
        />
        <text x="20" y="34" fontSize="14" fontWeight="600" fill="var(--color-fg)">
          Problem keys
        </text>
        <text x="20" y="54" fontSize="11" fill="var(--color-fg-muted)">
          Slowest 8 keys by hold-time
        </text>

        {/* Key heat grid */}
        {[
          { x: 20, y: 76, key: ";", ms: "184ms", tone: "var(--color-bad)" },
          { x: 100, y: 76, key: "P", ms: "172ms", tone: "var(--color-bad)" },
          { x: 180, y: 76, key: "Q", ms: "168ms", tone: "var(--color-warm)" },
          { x: 260, y: 76, key: "Z", ms: "158ms", tone: "var(--color-warm)" },
          { x: 20, y: 168, key: "'", ms: "152ms", tone: "var(--color-warm)" },
          { x: 100, y: 168, key: "/", ms: "144ms", tone: "var(--color-warn)" },
          { x: 180, y: 168, key: "X", ms: "138ms", tone: "var(--color-warn)" },
          { x: 260, y: 168, key: "B", ms: "131ms", tone: "var(--color-warn)" },
        ].map((k) => (
          <g key={k.key + k.x} transform={`translate(${k.x}, ${k.y})`}>
            <rect width="60" height="60" rx="8" fill={k.tone} fillOpacity="0.22" stroke={k.tone} strokeWidth="1.5" />
            <text x="30" y="38" fontSize="22" fontWeight="700" fill="var(--color-fg)" textAnchor="middle">
              {k.key}
            </text>
            <text x="30" y="80" fontSize="10" fill="var(--color-fg-muted)" textAnchor="middle">
              {k.ms}
            </text>
          </g>
        ))}

        <text x="20" y="284" fontSize="11" fill="var(--color-fg-muted)">
          Recommended drill
        </text>
        <text x="20" y="304" fontSize="13" fontWeight="500" fill="var(--color-accent)">
          “Top-row punctuation” →
        </text>
      </g>

      {/* Recent sessions strip */}
      <g transform="translate(40, 604)">
        <text x="0" y="14" fontSize="13" fontWeight="600" fill="var(--color-fg)">
          Recent sessions
        </text>

        {[
          { y: 36, date: "May 30", title: "common words · en-AU", cpm: "316", acc: "97%" },
          { y: 72, date: "May 29", title: "english 1k", cpm: "298", acc: "96%" },
          { y: 108, date: "May 28", title: "code js · syntax", cpm: "264", acc: "94%" },
        ].map((row) => (
          <g key={row.y}>
            <line x1="0" x2="1120" y1={row.y - 14} y2={row.y - 14} stroke="var(--color-border)" />
            <text x="0" y={row.y + 4} fontSize="12" fill="var(--color-fg-muted)">
              {row.date}
            </text>
            <text x="120" y={row.y + 4} fontSize="13" fill="var(--color-fg)">
              {row.title}
            </text>
            <text x="900" y={row.y + 4} fontSize="13" fontWeight="600" fill="var(--color-fg)" textAnchor="end">
              {row.cpm} CPM
            </text>
            <text x="1000" y={row.y + 4} fontSize="13" fill="var(--color-fg-muted)" textAnchor="end">
              {row.acc}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
