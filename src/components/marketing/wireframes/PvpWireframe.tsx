export function PvpWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Real-time PvP duel showing two players racing on a shared prompt with live CPM and progress bars"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      {/* Top bar */}
      <g>
        <text x="40" y="56" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
          PVP DUEL · BEST OF 3
        </text>
        <text x="40" y="86" fontSize="22" fontWeight="600" fill="var(--color-fg)">
          Round 2 of 3
        </text>

        {/* Round dots */}
        <g transform="translate(220, 70)">
          <circle cx="0" cy="0" r="8" fill="var(--color-good)" />
          <circle cx="22" cy="0" r="8" fill="var(--color-accent)" />
          <circle cx="44" cy="0" r="8" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        </g>

        {/* Timer */}
        <g transform="translate(1040, 42)">
          <rect width="120" height="56" rx="10" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          <text x="60" y="24" fontSize="10" fill="var(--color-fg-muted)" textAnchor="middle" letterSpacing="0.08em">
            TIME LEFT
          </text>
          <text x="60" y="46" fontSize="22" fontWeight="700" fill="var(--color-fg)" textAnchor="middle">
            0:42
          </text>
        </g>
      </g>

      {/* Shared prompt card */}
      <g transform="translate(40, 124)">
        <rect width="1120" height="220" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

        {/* Prompt text - rendered as several tspans with different states */}
        <text x="40" y="80" fontSize="22" fill="var(--color-fg)" fontFamily="ui-monospace, Menlo, monospace">
          <tspan fill="var(--color-fg-muted)">{`The `}</tspan>
          <tspan fill="var(--color-fg-muted)">{`quick `}</tspan>
          <tspan fill="var(--color-fg-muted)">{`brown `}</tspan>
          <tspan fill="var(--color-fg-muted)">{`fox `}</tspan>
          <tspan fill="var(--color-fg-muted)">{`jumps `}</tspan>
          <tspan fill="var(--color-fg-muted)">{`over `}</tspan>
          <tspan fill="var(--color-fg)">{`the `}</tspan>
          <tspan fill="var(--color-fg)" fontWeight="600">{`la`}</tspan>
          <tspan fill="var(--color-fg)" textDecoration="underline">{`z`}</tspan>
          <tspan fill="var(--color-fg)">{`y `}</tspan>
          <tspan fill="var(--color-fg)">{`sleeping `}</tspan>
        </text>
        <text x="40" y="120" fontSize="22" fill="var(--color-fg-muted)" fontFamily="ui-monospace, Menlo, monospace">
          {"dog beneath the silver-grey clouds."}
        </text>

        {/* Position markers below prompt */}
        {/* "You" marker */}
        <g transform="translate(420, 160)">
          <polygon points="0,0 -7,12 7,12" fill="var(--color-accent)" />
          <rect x="-26" y="14" width="52" height="20" rx="4" fill="var(--color-accent)" />
          <text x="0" y="28" fontSize="11" fontWeight="600" fill="#ffffff" textAnchor="middle">
            You
          </text>
        </g>

        {/* "Opponent" marker - slightly ahead */}
        <g transform="translate(488, 160)">
          <polygon points="0,0 -7,12 7,12" fill="var(--color-warm)" />
          <rect x="-44" y="14" width="88" height="20" rx="4" fill="var(--color-warm)" />
          <text x="0" y="28" fontSize="11" fontWeight="600" fill="#ffffff" textAnchor="middle">
            kbd_warrior
          </text>
        </g>
      </g>

      {/* Player 1 - You */}
      <g transform="translate(40, 372)">
        <rect width="1120" height="116" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-accent)" strokeWidth="2" />

        {/* Avatar */}
        <circle cx="48" cy="58" r="26" fill="var(--color-accent)" />
        <text x="48" y="66" fontSize="22" fontWeight="700" fill="#ffffff" textAnchor="middle">
          R
        </text>

        {/* Name + stats */}
        <text x="92" y="42" fontSize="15" fontWeight="600" fill="var(--color-fg)">
          You
        </text>
        <text x="92" y="64" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.04em">
          @kochie · personal best 312 CPM
        </text>

        {/* Progress bar */}
        <rect x="92" y="78" width="780" height="14" rx="7" fill="var(--color-border)" />
        <rect x="92" y="78" width="376" height="14" rx="7" fill="var(--color-accent)" />
        <text x="92" y="106" fontSize="10" fill="var(--color-fg-muted)">
          48% complete
        </text>

        {/* Live stats right side */}
        <g transform="translate(920, 30)">
          <text x="0" y="14" fontSize="10" fill="var(--color-fg-muted)" letterSpacing="0.08em">
            CPM
          </text>
          <text x="0" y="44" fontSize="28" fontWeight="700" fill="var(--color-fg)">
            287
          </text>
        </g>
        <g transform="translate(1040, 30)">
          <text x="0" y="14" fontSize="10" fill="var(--color-fg-muted)" letterSpacing="0.08em">
            ACC
          </text>
          <text x="0" y="44" fontSize="28" fontWeight="700" fill="var(--color-good)">
            98%
          </text>
        </g>
      </g>

      {/* Player 2 - Opponent */}
      <g transform="translate(40, 510)">
        <rect width="1120" height="116" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

        {/* Avatar */}
        <circle cx="48" cy="58" r="26" fill="var(--color-warm)" />
        <text x="48" y="66" fontSize="22" fontWeight="700" fill="#ffffff" textAnchor="middle">
          K
        </text>

        {/* Name + stats */}
        <text x="92" y="42" fontSize="15" fontWeight="600" fill="var(--color-fg)">
          kbd_warrior
        </text>
        <text x="92" y="64" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.04em">
          @austin · streak 24 days
        </text>

        {/* Progress bar */}
        <rect x="92" y="78" width="780" height="14" rx="7" fill="var(--color-border)" />
        <rect x="92" y="78" width="436" height="14" rx="7" fill="var(--color-warm)" />
        <text x="92" y="106" fontSize="10" fill="var(--color-fg-muted)">
          56% complete
        </text>

        {/* Live stats */}
        <g transform="translate(920, 30)">
          <text x="0" y="14" fontSize="10" fill="var(--color-fg-muted)" letterSpacing="0.08em">
            CPM
          </text>
          <text x="0" y="44" fontSize="28" fontWeight="700" fill="var(--color-fg)">
            301
          </text>
        </g>
        <g transform="translate(1040, 30)">
          <text x="0" y="14" fontSize="10" fill="var(--color-fg-muted)" letterSpacing="0.08em">
            ACC
          </text>
          <text x="0" y="44" fontSize="28" fontWeight="700" fill="var(--color-fg)">
            94%
          </text>
        </g>
      </g>

      {/* Bottom hint */}
      <text x="40" y="688" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.08em">
        SHARE INVITE
      </text>
      <text x="40" y="712" fontSize="14" fontFamily="ui-monospace, Menlo, monospace" fill="var(--color-accent)">
        touchtyper://duel/A1B2-C3D4
      </text>
    </svg>
  );
}
