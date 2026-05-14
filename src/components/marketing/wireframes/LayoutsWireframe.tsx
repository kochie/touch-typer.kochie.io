import { AppChrome } from "./AppChrome";

type Key = {
  label: string;
  /** width in 1u units */
  w?: number;
  /** small label drawn above the main label (mac modifier glyphs) */
  glyph?: string;
  /** size override for the main label (modifier keys use smaller) */
  small?: boolean;
};

const UNIT = 62;
const GAP = 5;
const KEY_H = 50;
const LEFT = 118;

// Rows
const ROW_1: Key[] = [
  { label: "`" }, { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" },
  { label: "5" }, { label: "6" }, { label: "7" }, { label: "8" }, { label: "9" },
  { label: "0" }, { label: "-" }, { label: "=" }, { label: "delete", w: 1.5, small: true },
];

const ROW_2: Key[] = [
  { label: "tab", w: 1.5, small: true },
  { label: "Q" }, { label: "W" }, { label: "E" }, { label: "R" }, { label: "T" },
  { label: "Y" }, { label: "U" }, { label: "I" }, { label: "O" }, { label: "P" },
  { label: "[" }, { label: "]" }, { label: "\\" },
];

const ROW_3: Key[] = [
  { label: "caps lock", w: 1.75, small: true },
  { label: "A" }, { label: "S" }, { label: "D" }, { label: "F" }, { label: "G" },
  { label: "H" }, { label: "J" }, { label: "K" }, { label: "L" },
  { label: ";" }, { label: "'" },
  { label: "return", w: 1.75, small: true },
];

const ROW_4: Key[] = [
  { label: "shift", w: 2.25, small: true },
  { label: "Z" }, { label: "X" }, { label: "C" }, { label: "V" }, { label: "B" },
  { label: "N" }, { label: "M" }, { label: "," }, { label: "." }, { label: "/" },
  { label: "shift", w: 2.25, small: true },
];

const ROW_5: Key[] = [
  { label: "fn", small: true },
  { label: "control", glyph: "⌃", small: true },
  { label: "option", glyph: "⌥", small: true },
  { label: "command", glyph: "⌘", w: 1.25, small: true },
  { label: "", w: 5.5 },
  { label: "command", glyph: "⌘", w: 1.25, small: true },
  { label: "option", glyph: "⌥", small: true },
];

function KeyCap({ k, x, y }: { k: Key; x: number; y: number }) {
  const w = (k.w ?? 1) * UNIT + ((k.w ?? 1) - 1) * GAP;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={w}
        height={KEY_H}
        rx="7"
        fill="var(--color-bg-elevated)"
        stroke="var(--color-border)"
      />
      {k.glyph && (
        <text
          x={w / 2}
          y={KEY_H / 2 - 2}
          fontSize="11"
          fill="var(--color-fg-muted)"
          textAnchor="middle"
        >
          {k.glyph}
        </text>
      )}
      {k.label && (
        <text
          x={k.small ? 10 : w / 2}
          y={k.glyph ? KEY_H - 10 : KEY_H / 2 + (k.small ? 4 : 7)}
          fontSize={k.small ? 11 : 17}
          fontWeight={k.small ? 500 : 500}
          fill="var(--color-fg)"
          textAnchor={k.small ? "start" : "middle"}
        >
          {k.label}
        </text>
      )}
    </g>
  );
}

function renderRow(row: Key[], y: number) {
  let cursor = LEFT;
  return row.map((k, i) => {
    const w = (k.w ?? 1) * UNIT + ((k.w ?? 1) - 1) * GAP;
    const x = cursor;
    cursor += w + GAP;
    return <KeyCap key={`${y}-${i}`} k={k} x={x} y={y} />;
  });
}

// Arrow key cluster — to the right of row 5's main keys
function ArrowCluster({ x, y }: { x: number; y: number }) {
  const half = (KEY_H - GAP) / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Up - half height top */}
      <rect width={UNIT} height={half} rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
      <text x={UNIT / 2} y={half - 4} fontSize="11" fill="var(--color-fg)" textAnchor="middle">▲</text>
      {/* Down - half height bottom */}
      <rect y={half + GAP} width={UNIT} height={half} rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
      <text x={UNIT / 2} y={half + GAP + half - 4} fontSize="11" fill="var(--color-fg)" textAnchor="middle">▼</text>
      {/* Left - full height */}
      <g transform={`translate(${-(UNIT + GAP)}, ${half + GAP})`}>
        <rect width={UNIT} height={half} rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <text x={UNIT / 2} y={half - 4} fontSize="11" fill="var(--color-fg)" textAnchor="middle">◀</text>
      </g>
      {/* Right - full height */}
      <g transform={`translate(${UNIT + GAP}, ${half + GAP})`}>
        <rect width={UNIT} height={half} rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        <text x={UNIT / 2} y={half - 4} fontSize="11" fill="var(--color-fg)" textAnchor="middle">▶</text>
      </g>
    </g>
  );
}

export function LayoutsWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Practice screen showing typos/CPM/accuracy stats and a Mac-style on-screen keyboard"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      <AppChrome activeTab="PRACTICE" />

      {/* Breadcrumb */}
      <g transform="translate(600, 124)">
        <text x="0" y="0" fontSize="13" fill="var(--color-fg)" textAnchor="middle">
          <tspan fill="var(--color-fg-muted)">Level 1</tspan>
          <tspan fill="var(--color-fg-muted)">{`  ·  `}</tspan>
          <tspan fill="var(--color-accent)" fontWeight="600">US QWERTY</tspan>
          <tspan fill="var(--color-fg-muted)">{`  ·  `}</tspan>
          <tspan fill="var(--color-fg-muted)">English</tspan>
        </text>
      </g>

      {/* Stats strip — 3 inline groups */}
      <g transform="translate(0, 180)" style={{ color: "var(--color-accent)" }}>
        {/* Typos */}
        <g transform="translate(380, 0)">
          {/* portcullis/gate icon */}
          <g fill="currentColor">
            <rect x="0" y="2" width="28" height="22" rx="2" />
            <rect x="-2" y="22" width="32" height="3" />
            <g fill="var(--color-bg)">
              <rect x="3" y="6" width="2" height="18" />
              <rect x="9" y="6" width="2" height="18" />
              <rect x="15" y="6" width="2" height="18" />
              <rect x="21" y="6" width="2" height="18" />
              <rect x="3" y="6" width="22" height="2" />
              <rect x="3" y="12" width="22" height="2" />
            </g>
          </g>
          <text x="42" y="22" fontSize="26" fontWeight="700" fill="var(--color-fg)">
            0
          </text>
          <text x="74" y="22" fontSize="10" fontWeight="600" fill="var(--color-fg-muted)" letterSpacing="0.12em">
            TYPOS
          </text>
        </g>
        {/* CHAR/MIN */}
        <g transform="translate(560, 0)">
          {/* running figure */}
          <g fill="currentColor">
            <circle cx="13" cy="4" r="3" />
            <path d="M 7 22 L 12 16 L 16 18 L 14 24 L 18 27 L 20 22 L 23 24 L 21 30 L 14 30 L 15 25 L 11 22 Z" />
          </g>
          <text x="42" y="22" fontSize="26" fontWeight="700" fill="var(--color-fg)">
            0
          </text>
          <text x="74" y="22" fontSize="10" fontWeight="600" fill="var(--color-fg-muted)" letterSpacing="0.12em">
            CHAR/MIN
          </text>
        </g>
        {/* Accuracy */}
        <g transform="translate(770, 0)">
          {/* percent icon */}
          <g fill="currentColor">
            <circle cx="6" cy="6" r="4" />
            <circle cx="22" cy="22" r="4" />
            <rect x="-1" y="22" width="32" height="2.5" transform="rotate(-45 14 14)" />
          </g>
          <text x="42" y="22" fontSize="26" fontWeight="700" fill="var(--color-fg)">
            0
          </text>
          <text x="74" y="22" fontSize="10" fontWeight="600" fill="var(--color-fg-muted)" letterSpacing="0.12em">
            ACCURACY
          </text>
        </g>
      </g>

      {/* Cursor */}
      <rect x="599" y="280" width="2" height="32" fill="var(--color-warm)">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* Keyboard rows */}
      {renderRow(ROW_1, 380)}
      {renderRow(ROW_2, 380 + (KEY_H + GAP))}
      {renderRow(ROW_3, 380 + 2 * (KEY_H + GAP))}
      {renderRow(ROW_4, 380 + 3 * (KEY_H + GAP))}
      {renderRow(ROW_5, 380 + 4 * (KEY_H + GAP))}

      {/* Arrow cluster — sits where row 5 right-side keys end */}
      <ArrowCluster
        x={(() => {
          // place after row-5's last key
          let cursor = LEFT;
          for (const k of ROW_5) cursor += (k.w ?? 1) * UNIT + ((k.w ?? 1) - 1) * GAP + GAP;
          return cursor + UNIT + GAP;
        })()}
        y={380 + 4 * (KEY_H + GAP)}
      />
    </svg>
  );
}
