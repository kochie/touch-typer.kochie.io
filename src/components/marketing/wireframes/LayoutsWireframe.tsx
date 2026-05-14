type KeyDef = { x: number; w?: number; label: string; sub?: string; tone?: string };

const KEY_W = 64;
const KEY_H = 60;
const KEY_GAP = 8;

// y-offsets per row
const ROW_Y = [380, 452, 524, 596, 668];

// Row 1 — numbers
const ROW_1: KeyDef[] = [
  { x: 0, label: "`" },
  { x: 1, label: "1", tone: "var(--color-warn)" },
  { x: 2, label: "2", tone: "var(--color-warn)" },
  { x: 3, label: "3" },
  { x: 4, label: "4" },
  { x: 5, label: "5" },
  { x: 6, label: "6" },
  { x: 7, label: "7", tone: "var(--color-bad)" },
  { x: 8, label: "8", tone: "var(--color-warm)" },
  { x: 9, label: "9" },
  { x: 10, label: "0" },
  { x: 11, label: "-" },
  { x: 12, label: "=" },
  { x: 13, w: 2, label: "⌫" },
];

// Row 2 — QWERTY
const ROW_2: KeyDef[] = [
  { x: 0, w: 1.5, label: "tab" },
  { x: 1.5, label: "Q", tone: "var(--color-warm)" },
  { x: 2.5, label: "W" },
  { x: 3.5, label: "E", tone: "var(--color-good)" },
  { x: 4.5, label: "R", tone: "var(--color-good)" },
  { x: 5.5, label: "T", tone: "var(--color-good)" },
  { x: 6.5, label: "Y" },
  { x: 7.5, label: "U" },
  { x: 8.5, label: "I", tone: "var(--color-good)" },
  { x: 9.5, label: "O" },
  { x: 10.5, label: "P", tone: "var(--color-bad)" },
  { x: 11.5, label: "[", tone: "var(--color-warm)" },
  { x: 12.5, label: "]" },
  { x: 13.5, w: 1.5, label: "\\" },
];

// Row 3 — Home row
const ROW_3: KeyDef[] = [
  { x: 0, w: 1.75, label: "caps" },
  { x: 1.75, label: "A", tone: "var(--color-good)" },
  { x: 2.75, label: "S", tone: "var(--color-good)" },
  { x: 3.75, label: "D", tone: "var(--color-good)" },
  { x: 4.75, label: "F", tone: "var(--color-good)" },
  { x: 5.75, label: "G" },
  { x: 6.75, label: "H" },
  { x: 7.75, label: "J", tone: "var(--color-good)" },
  { x: 8.75, label: "K", tone: "var(--color-good)" },
  { x: 9.75, label: "L", tone: "var(--color-good)" },
  { x: 10.75, label: ";", tone: "var(--color-bad)" },
  { x: 11.75, label: "'", tone: "var(--color-bad)" },
  { x: 12.75, w: 2.25, label: "return" },
];

// Row 4 — Shift row
const ROW_4: KeyDef[] = [
  { x: 0, w: 2.25, label: "shift" },
  { x: 2.25, label: "Z", tone: "var(--color-warn)" },
  { x: 3.25, label: "X", tone: "var(--color-warm)" },
  { x: 4.25, label: "C" },
  { x: 5.25, label: "V" },
  { x: 6.25, label: "B", tone: "var(--color-warn)" },
  { x: 7.25, label: "N" },
  { x: 8.25, label: "M" },
  { x: 9.25, label: "," },
  { x: 10.25, label: "." },
  { x: 11.25, label: "/", tone: "var(--color-warm)" },
  { x: 12.25, w: 2.75, label: "shift" },
];

// Row 5 — Modifiers + space
const ROW_5: KeyDef[] = [
  { x: 0, w: 1.25, label: "fn" },
  { x: 1.25, w: 1.25, label: "⌃" },
  { x: 2.5, w: 1.25, label: "⌥" },
  { x: 3.75, w: 1.5, label: "⌘" },
  { x: 5.25, w: 5.5, label: "" },
  { x: 10.75, w: 1.5, label: "⌘" },
  { x: 12.25, w: 1.25, label: "⌥" },
  { x: 13.5, w: 1.5, label: "◀▶" },
];

function Key({ k, y }: { k: KeyDef; y: number }) {
  const w = (k.w ?? 1) * KEY_W + ((k.w ?? 1) - 1) * KEY_GAP;
  const x = 40 + k.x * (KEY_W + KEY_GAP);
  const fill = k.tone ? k.tone : "var(--color-bg-elevated)";
  const fillOpacity = k.tone ? 0.22 : 1;
  const stroke = k.tone ?? "var(--color-border)";
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={w}
        height={KEY_H}
        rx="8"
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={k.tone ? 1.5 : 1}
      />
      <text
        x={w / 2}
        y={KEY_H / 2 + 8}
        fontSize={k.label.length > 2 ? "12" : "18"}
        fontWeight="500"
        fill="var(--color-fg)"
        textAnchor="middle"
      >
        {k.label}
      </text>
    </g>
  );
}

export function LayoutsWireframe() {
  return (
    <svg
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Main practice screen showing typing prompt, live stats, and a keyboard with heatmap coloring on the slowest keys"
      className="w-full h-full block"
      style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui)" }}
    >
      <rect width="1200" height="760" fill="var(--color-bg)" />

      {/* Top header strip */}
      <text x="40" y="56" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
        ENGLISH 1K · QWERTY US
      </text>
      <text x="40" y="84" fontSize="22" fontWeight="600" fill="var(--color-fg)">
        Practice
      </text>

      {/* Live stats strip - top right */}
      <g transform="translate(700, 42)">
        <rect width="460" height="56" rx="10" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
        {[
          { x: 60, label: "CPM", value: "287", color: "var(--color-fg)" },
          { x: 180, label: "ACC", value: "96%", color: "var(--color-good)" },
          { x: 290, label: "ERR", value: "3", color: "var(--color-warm)" },
          { x: 400, label: "TIME", value: "0:42", color: "var(--color-fg)" },
        ].map((s) => (
          <g key={s.label}>
            <text x={s.x} y={22} fontSize="10" fill="var(--color-fg-muted)" letterSpacing="0.08em" textAnchor="middle">
              {s.label}
            </text>
            <text x={s.x} y={44} fontSize="18" fontWeight="700" fill={s.color} textAnchor="middle">
              {s.value}
            </text>
          </g>
        ))}
      </g>

      {/* Prompt area */}
      <g transform="translate(40, 124)">
        <rect width="1120" height="224" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

        {/* Already-typed words (muted) */}
        <text x="40" y="80" fontSize="26" fill="var(--color-fg-muted)" fontFamily="ui-monospace, Menlo, monospace">
          {"the quick brown fox jumps over the "}
        </text>
        {/* Current word being typed (with cursor) */}
        <text x="40" y="124" fontSize="26" fontFamily="ui-monospace, Menlo, monospace">
          <tspan fill="var(--color-fg)" fontWeight="600">{`la`}</tspan>
          <tspan fill="var(--color-bad)" fontWeight="600" textDecoration="underline">{`z`}</tspan>
          <tspan fill="var(--color-fg-muted)">{`y sleeping dog beneath`}</tspan>
        </text>
        {/* Cursor */}
        <rect x="84" y="104" width="2" height="28" fill="var(--color-accent)">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </rect>
        {/* Upcoming words (faint) */}
        <text x="40" y="168" fontSize="26" fill="var(--color-fg-muted)" fillOpacity="0.4" fontFamily="ui-monospace, Menlo, monospace">
          {"the silver-grey clouds gather quietly"}
        </text>

        {/* Hint */}
        <text x="40" y="204" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.08em">
          1 ERROR · KEEP GOING
        </text>
      </g>

      {/* Heat legend */}
      <g transform="translate(40, 364)">
        <text x="0" y="0" fontSize="11" fill="var(--color-fg-muted)" letterSpacing="0.1em">
          KEY HEAT
        </text>
        <g transform="translate(80, -10)">
          <rect width="14" height="14" rx="3" fill="var(--color-good)" fillOpacity="0.22" stroke="var(--color-good)" />
          <text x="22" y="11" fontSize="11" fill="var(--color-fg)">fast</text>
          <rect x="68" y="0" width="14" height="14" rx="3" fill="var(--color-warn)" fillOpacity="0.22" stroke="var(--color-warn)" />
          <text x="90" y="11" fontSize="11" fill="var(--color-fg)">avg</text>
          <rect x="132" y="0" width="14" height="14" rx="3" fill="var(--color-warm)" fillOpacity="0.22" stroke="var(--color-warm)" />
          <text x="154" y="11" fontSize="11" fill="var(--color-fg)">slow</text>
          <rect x="200" y="0" width="14" height="14" rx="3" fill="var(--color-bad)" fillOpacity="0.22" stroke="var(--color-bad)" />
          <text x="222" y="11" fontSize="11" fill="var(--color-fg)">problem</text>
        </g>
      </g>

      {/* Keyboard */}
      {ROW_1.map((k, i) => (
        <Key key={`r1-${i}`} k={k} y={ROW_Y[0]} />
      ))}
      {ROW_2.map((k, i) => (
        <Key key={`r2-${i}`} k={k} y={ROW_Y[1]} />
      ))}
      {ROW_3.map((k, i) => (
        <Key key={`r3-${i}`} k={k} y={ROW_Y[2]} />
      ))}
      {ROW_4.map((k, i) => (
        <Key key={`r4-${i}`} k={k} y={ROW_Y[3]} />
      ))}
      {ROW_5.map((k, i) => (
        <Key key={`r5-${i}`} k={k} y={ROW_Y[4]} />
      ))}
    </svg>
  );
}
