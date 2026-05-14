export function CoachWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AI Coach panel with a list of insights and an active insight showing a keyboard heatmap and recommended drill"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      {/* Header */}
      <text x="40" y="58" fontSize="22" fontWeight="600" fill="var(--color-fg)">
        AI Coach
      </text>
      <text x="40" y="82" fontSize="13" fill="var(--color-fg-muted)">
        Personalised drills from your last 47 sessions
      </text>

      {/* Insights rail */}
      <g transform="translate(40, 116)">
        <text x="0" y="14" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
          INSIGHTS
        </text>

        {/* Card 1 - active */}
        <g transform="translate(0, 32)">
          <rect width="320" height="92" rx="10" fill="var(--color-accent)" fillOpacity="0.12" stroke="var(--color-accent)" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" fill="var(--color-accent)" />
          <text x="44" y="30" fontSize="14" fontWeight="600" fill="var(--color-fg)">
            Top-row punctuation
          </text>
          <text x="44" y="50" fontSize="11" fill="var(--color-fg-muted)">
            May 14 · 12 sessions analysed
          </text>
          <text x="44" y="76" fontSize="12" fill="var(--color-fg)">
            Hold-time spikes on{" "}
            <tspan fontWeight="600" fill="var(--color-accent)">;</tspan>
            {" "}and{" "}
            <tspan fontWeight="600" fill="var(--color-accent)">{`'`}</tspan>
          </text>
        </g>

        {/* Card 2 */}
        <g transform="translate(0, 144)">
          <rect width="320" height="78" rx="10" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          <circle cx="24" cy="24" r="6" fill="var(--color-warm)" />
          <text x="44" y="30" fontSize="14" fontWeight="600" fill="var(--color-fg)">
            Right-pinky drift
          </text>
          <text x="44" y="50" fontSize="11" fill="var(--color-fg-muted)">
            May 12 · accuracy −2.4%
          </text>
        </g>

        {/* Card 3 */}
        <g transform="translate(0, 240)">
          <rect width="320" height="78" rx="10" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          <circle cx="24" cy="24" r="6" fill="var(--color-good)" />
          <text x="44" y="30" fontSize="14" fontWeight="600" fill="var(--color-fg)">
            Code mode plateau broken
          </text>
          <text x="44" y="50" fontSize="11" fill="var(--color-fg-muted)">
            May 10 · +18 CPM
          </text>
        </g>

        {/* Card 4 */}
        <g transform="translate(0, 336)">
          <rect width="320" height="78" rx="10" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          <circle cx="24" cy="24" r="6" fill="var(--color-fg-muted)" />
          <text x="44" y="30" fontSize="14" fontWeight="600" fill="var(--color-fg)">
            Number row practice
          </text>
          <text x="44" y="50" fontSize="11" fill="var(--color-fg-muted)">
            May 7 · keep it up
          </text>
        </g>
      </g>

      {/* Main insight pane */}
      <g transform="translate(400, 116)">
        <rect width="760" height="608" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

        {/* Pane header */}
        <text x="32" y="48" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
          GENERATED MAY 14 · 12 SESSIONS
        </text>
        <text x="32" y="84" fontSize="24" fontWeight="700" fill="var(--color-fg)">
          Top-row punctuation is dragging
        </text>
        <text x="32" y="112" fontSize="24" fontWeight="700" fill="var(--color-fg)">
          you down 18 CPM.
        </text>

        {/* Body */}
        <text x="32" y="158" fontSize="13" fill="var(--color-fg)">
          <tspan x="32" dy="0">Across your last 12 sessions, your hold-time on </tspan>
          <tspan fontWeight="700" fill="var(--color-accent)">;</tspan>
          <tspan>, </tspan>
          <tspan fontWeight="700" fill="var(--color-accent)">{`'`}</tspan>
          <tspan>, and </tspan>
          <tspan fontWeight="700" fill="var(--color-accent)">/</tspan>
          <tspan> averages</tspan>
          <tspan x="32" dy="22">184ms — 28ms slower than your baseline. Other keys are</tspan>
          <tspan x="32" dy="22">on target. A focused drill should close the gap in a week.</tspan>
        </text>

        {/* Heatmap of focus keys */}
        <g transform="translate(32, 260)">
          <text x="0" y="14" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
            FOCUS KEYS
          </text>
          {[
            { x: 0, key: "P", ms: "172ms", tone: "var(--color-bad)" },
            { x: 80, key: "[", ms: "168ms", tone: "var(--color-bad)" },
            { x: 160, key: "]", ms: "158ms", tone: "var(--color-warm)" },
            { x: 240, key: ";", ms: "188ms", tone: "var(--color-bad)" },
            { x: 320, key: "'", ms: "184ms", tone: "var(--color-bad)" },
            { x: 400, key: ",", ms: "146ms", tone: "var(--color-warn)" },
            { x: 480, key: ".", ms: "144ms", tone: "var(--color-warn)" },
            { x: 560, key: "/", ms: "168ms", tone: "var(--color-warm)" },
          ].map((k) => (
            <g key={k.key} transform={`translate(${k.x}, 28)`}>
              <rect width="64" height="64" rx="10" fill={k.tone} fillOpacity="0.18" stroke={k.tone} strokeWidth="1.5" />
              <text x="32" y="38" fontSize="22" fontWeight="700" fill="var(--color-fg)" textAnchor="middle">
                {k.key}
              </text>
              <text x="32" y="84" fontSize="10" fill="var(--color-fg-muted)" textAnchor="middle">
                {k.ms}
              </text>
            </g>
          ))}
        </g>

        {/* Drill chip + action */}
        <g transform="translate(32, 444)">
          <rect width="700" height="92" rx="10" fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeOpacity="0.4" />
          <text x="20" y="30" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
            RECOMMENDED DRILL
          </text>
          <text x="20" y="58" fontSize="16" fontWeight="600" fill="var(--color-fg)">
            Top-row punctuation · 90 seconds
          </text>
          <text x="20" y="78" fontSize="12" fill="var(--color-fg-muted)">
            Targets {`{ ; ' , . / [ ] }`} at 1.2× your current pace
          </text>
          <g transform="translate(540, 22)">
            <rect width="140" height="48" rx="8" fill="var(--color-accent)" />
            <text x="70" y="30" fontSize="14" fontWeight="600" fill="#ffffff" textAnchor="middle">
              Start drill →
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
