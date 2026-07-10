// SVG frame primitives for the black & white line-art card aesthetic.
// Each renders an absolutely-positioned double-stroked outline sized in px
// (the card is a fixed 2.5in × 3.5in print artifact, so px math is exact).

interface FrameProps {
  w: number;
  h: number;
}

const STROKE = "#111";

function Svg({ w, h, children }: FrameProps & { children: React.ReactNode }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </svg>
  );
}

/** Elongated octagon (45° chamfered corners). o = inset from the edge. */
function octPath(w: number, h: number, c: number, o: number) {
  return [
    `M ${c + o},${o}`,
    `L ${w - c - o},${o}`,
    `L ${w - o},${c + o}`,
    `L ${w - o},${h - c - o}`,
    `L ${w - c - o},${h - o}`,
    `L ${c + o},${h - o}`,
    `L ${o},${h - c - o}`,
    `L ${o},${c + o}`,
    "Z",
  ].join(" ");
}

export function OctagonFrame({ w, h }: FrameProps) {
  const c = Math.min(11, h * 0.34);
  return (
    <Svg w={w} h={h}>
      <path d={octPath(w, h, c, 0.75)} stroke={STROKE} strokeWidth={1.3} />
      <path d={octPath(w, h, c, 3.2)} stroke={STROKE} strokeWidth={0.8} />
    </Svg>
  );
}

/** Rounded square with a concentric inner line — the stat boxes. */
export function RoundedFrame({ w, h }: FrameProps) {
  return (
    <Svg w={w} h={h}>
      <rect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={13} stroke={STROKE} strokeWidth={1.3} />
      <rect x={3.2} y={3.2} width={w - 6.4} height={h - 6.4} rx={10.5} stroke={STROKE} strokeWidth={0.8} />
    </Svg>
  );
}

/** Heater shield — used for Armor Class. */
function shieldPath(w: number, h: number, o: number) {
  const cx = w / 2;
  return [
    `M ${cx},${o + 1}`,
    `C ${w * 0.6},${o + 5} ${w * 0.78},${o + 6} ${w - o},${o + 4}`,
    `C ${w - o},${h * 0.42} ${w * 0.8},${h * 0.72} ${cx},${h - o}`,
    `C ${w * 0.2},${h * 0.72} ${o},${h * 0.42} ${o},${o + 4}`,
    `C ${w * 0.22},${o + 6} ${w * 0.4},${o + 5} ${cx},${o + 1}`,
    "Z",
  ].join(" ");
}

export function ShieldFrame({ w, h }: FrameProps) {
  return (
    <Svg w={w} h={h}>
      <path d={shieldPath(w, h, 1)} stroke={STROKE} strokeWidth={1.3} />
      <path
        d={shieldPath(w, h, 1)}
        stroke={STROKE}
        strokeWidth={0.9}
        transform={`translate(${w / 2} ${h / 2}) scale(0.87) translate(${-w / 2} ${-h / 2})`}
      />
    </Svg>
  );
}

/** Rectangle with concave (scalloped) corners — the Speed badge. */
function scallopPath(w: number, h: number, c: number, o: number) {
  return [
    `M ${c + o},${o}`,
    `L ${w - c - o},${o}`,
    `A ${c} ${c} 0 0 0 ${w - o},${c + o}`,
    `L ${w - o},${h - c - o}`,
    `A ${c} ${c} 0 0 0 ${w - c - o},${h - o}`,
    `L ${c + o},${h - o}`,
    `A ${c} ${c} 0 0 0 ${o},${h - c - o}`,
    `L ${o},${c + o}`,
    `A ${c} ${c} 0 0 0 ${c + o},${o}`,
    "Z",
  ].join(" ");
}

export function ScallopFrame({ w, h }: FrameProps) {
  const c = Math.min(9, h * 0.25);
  return (
    <Svg w={w} h={h}>
      <path d={scallopPath(w, h, c, 0.75)} stroke={STROKE} strokeWidth={1.3} />
      <path d={scallopPath(w, h, c - 1.2, 3)} stroke={STROKE} strokeWidth={0.8} />
    </Svg>
  );
}

/** Ornamental full-face frame for the player side: double border,
 *  plaque notches top/bottom centre, and diagonal corner accents. */
export function PlayerFrame({ w, h }: FrameProps) {
  const m = 7; // frame margin from the face edge
  const notchW = w * 0.5;
  const nx = (w - notchW) / 2;
  return (
    <Svg w={w} h={h}>
      <rect x={m} y={m} width={w - m * 2} height={h - m * 2} rx={10} stroke={STROKE} strokeWidth={1.3} />
      <rect x={m + 3.5} y={m + 3.5} width={w - (m + 3.5) * 2} height={h - (m + 3.5) * 2} rx={7} stroke={STROKE} strokeWidth={0.8} />
      {/* top and bottom plaque notches */}
      <path d={`M ${nx},${m} L ${nx + 9},${m + 12} L ${nx + notchW - 9},${m + 12} L ${nx + notchW},${m}`} stroke={STROKE} strokeWidth={0.9} />
      <path d={`M ${nx},${h - m} L ${nx + 9},${h - m - 12} L ${nx + notchW - 9},${h - m - 12} L ${nx + notchW},${h - m}`} stroke={STROKE} strokeWidth={0.9} />
      {/* diagonal corner accents */}
      <path d={`M ${m - 4},${m + 12} L ${m + 12},${m - 4}`} stroke={STROKE} strokeWidth={0.9} />
      <path d={`M ${w - m - 12},${m - 4} L ${w - m + 4},${m + 12}`} stroke={STROKE} strokeWidth={0.9} />
      <path d={`M ${m - 4},${h - m - 12} L ${m + 12},${h - m + 4}`} stroke={STROKE} strokeWidth={0.9} />
      <path d={`M ${w - m - 12},${h - m + 4} L ${w - m + 4},${h - m - 12}`} stroke={STROKE} strokeWidth={0.9} />
    </Svg>
  );
}
