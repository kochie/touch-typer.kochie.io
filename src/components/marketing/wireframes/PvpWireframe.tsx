import { AppChrome } from "./AppChrome";

export function PvpWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Arena screen waiting for a PvP opponent with a shareable invite link and Play Now button"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      <AppChrome activeTab="ARENA" />

      {/* Flag / pennant glyph above title */}
      <g transform="translate(600, 156)" fill="var(--color-warn)">
        <path d="M -8 0 L 8 6 L -8 12 Z" />
        <line x1="-8" y1="0" x2="-8" y2="20" stroke="var(--color-warn)" strokeWidth="2" />
      </g>

      {/* Title block — centered */}
      <text x="600" y="216" fontSize="34" fontWeight="700" fill="var(--color-fg)" textAnchor="middle">
        Your race awaits
      </text>
      <text x="600" y="252" fontSize="14" fill="var(--color-fg-muted)" textAnchor="middle">
        Pick your moment — you can race now or come back later.
      </text>
      <text x="600" y="274" fontSize="14" fill="var(--color-fg-muted)" textAnchor="middle">
        The other side won&apos;t see your score until they finish theirs.
      </text>

      {/* Invite link card */}
      <g transform="translate(380, 316)">
        <rect width="440" height="118" rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <text x="220" y="32" fontSize="13" fontWeight="600" fill="var(--color-fg-muted)" textAnchor="middle">
          Invite Link
        </text>
        {/* URL field */}
        <g transform="translate(22, 50)">
          <rect width="360" height="40" rx="8" fill="var(--color-bg)" stroke="var(--color-border)" />
          <text
            x="16"
            y="26"
            fontSize="13"
            fontFamily="ui-monospace, Menlo, monospace"
            fontWeight="600"
            fill="var(--color-fg)"
          >
            touchtyper://pvp/invite/SCRNSHT5HJIV
          </text>
        </g>
        {/* Copy icon button */}
        <g transform="translate(396, 50)">
          <rect width="40" height="40" rx="8" fill="var(--color-bg)" stroke="var(--color-border)" />
          <g transform="translate(12, 12)" fill="none" stroke="var(--color-fg-muted)" strokeWidth="1.6" strokeLinecap="round">
            <path d="M 4 8 a 4 4 0 0 1 4 -4 L 12 4 a 4 4 0 0 1 4 4 L 12 12" />
            <path d="M 12 8 a 4 4 0 0 0 -4 4 L 4 12 a 4 4 0 0 0 -4 -4 L 4 4" transform="translate(0, -4)" />
          </g>
        </g>
        <text x="220" y="108" fontSize="11" fill="var(--color-fg-muted)" textAnchor="middle">
          Share this with one person — first to use it claims the second slot.
        </text>
      </g>

      {/* Play Now button */}
      <g transform="translate(380, 466)">
        <rect width="440" height="54" rx="12" fill="var(--color-accent)" />
        {/* Play icon */}
        <polygon
          transform="translate(192, 21)"
          points="0,0 14,8 0,16"
          fill="#ffffff"
        />
        <text x="232" y="34" fontSize="16" fontWeight="700" fill="#ffffff">
          Play Now
        </text>
      </g>

      {/* Cancel button */}
      <g transform="translate(380, 532)">
        <rect width="440" height="54" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        {/* Trash icon */}
        <g transform="translate(196, 19)" fill="none" stroke="var(--color-fg-muted)" strokeWidth="1.6" strokeLinecap="round">
          <path d="M 1 4 L 17 4" />
          <path d="M 4 4 L 5 16 a 2 2 0 0 0 2 2 L 11 18 a 2 2 0 0 0 2 -2 L 14 4" />
          <path d="M 6 4 L 6 1 L 12 1 L 12 4" />
        </g>
        <text x="226" y="34" fontSize="15" fontWeight="600" fill="var(--color-fg)">
          Cancel Game
        </text>
      </g>

      {/* Bottom hint */}
      <text x="600" y="654" fontSize="12" fill="var(--color-fg-muted)" textAnchor="middle">
        No account needed — your opponent can play straight from the link.
      </text>
    </svg>
  );
}
