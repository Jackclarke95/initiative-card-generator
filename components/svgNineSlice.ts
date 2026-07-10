// 9-slice stretching for SVG path data.
//
// Frames like the Roll20 sheet assets are corner ornaments joined by plain
// straight lines. To resize one without distorting the corners we parse its
// path, convert everything to absolute commands, then shift each coordinate
// based on where it falls in the original artwork:
//   outer 40%  -> keep (corner details stay pixel-identical)
//   inner 40%  -> shift by the full growth delta
//   middle 20% -> shift by half the delta (keeps centred details centred)
// Straight runs crossing the zones simply lengthen; arcs and curves are
// expected to live entirely inside one zone (true for these assets).

interface StretchOptions {
  origW: number;
  origH: number;
  width: number;
  height: number;
  /** Uniform pre-scale applied before stretching (shrinks corner details). */
  scale?: number;
}

type Cmd = { cmd: "M" | "L" | "C" | "Q" | "A" | "Z"; args: number[] };

const ARGC: Record<string, number> = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
};

function tokenize(d: string): (string | number)[] {
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
  const out: (string | number)[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) out.push(m[1] ? m[1] : parseFloat(m[2]));
  return out;
}

/** Convert a path to absolute M/L/C/Q/A/Z commands (H/V→L, S→C, T→Q). */
function normalize(d: string): Cmd[] {
  const toks = tokenize(d);
  const cmds: Cmd[] = [];
  let i = 0;
  let cx = 0,
    cy = 0,
    sx = 0,
    sy = 0;
  let prevCmd: string | null = null;
  let prevCtl: [number, number] | null = null;
  let prevQCtl: [number, number] | null = null;
  let cmd: string | null = null;

  while (i < toks.length) {
    if (typeof toks[i] === "string") cmd = toks[i++] as string;
    else if (cmd === null)
      throw new Error("path data must start with a command");
    else if (cmd === "M")
      cmd = "L"; // implicit repeats of M continue as L
    else if (cmd === "m") cmd = "l";

    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "Z") {
      cmds.push({ cmd: "Z", args: [] });
      cx = sx;
      cy = sy;
      prevCmd = "Z";
      prevCtl = null;
      prevQCtl = null;
      continue;
    }
    const n = ARGC[C];
    const a = toks.slice(i, i + n) as number[];
    if (a.length < n || a.some((v) => typeof v !== "number")) {
      throw new Error(`bad arguments for '${cmd}' at token ${i}`);
    }
    i += n;

    switch (C) {
      case "M":
      case "L": {
        const x = rel ? cx + a[0] : a[0];
        const y = rel ? cy + a[1] : a[1];
        cmds.push({ cmd: C, args: [x, y] });
        if (C === "M") {
          sx = x;
          sy = y;
        }
        cx = x;
        cy = y;
        prevCmd = C;
        prevCtl = null;
        prevQCtl = null;
        break;
      }
      case "H": {
        const x = rel ? cx + a[0] : a[0];
        cmds.push({ cmd: "L", args: [x, cy] });
        cx = x;
        prevCmd = "L";
        prevCtl = null;
        prevQCtl = null;
        break;
      }
      case "V": {
        const y = rel ? cy + a[0] : a[0];
        cmds.push({ cmd: "L", args: [cx, y] });
        cy = y;
        prevCmd = "L";
        prevCtl = null;
        prevQCtl = null;
        break;
      }
      case "C": {
        const p = rel
          ? [cx + a[0], cy + a[1], cx + a[2], cy + a[3], cx + a[4], cy + a[5]]
          : a.slice();
        cmds.push({ cmd: "C", args: p });
        prevCtl = [p[2], p[3]];
        cx = p[4];
        cy = p[5];
        prevCmd = "C";
        prevQCtl = null;
        break;
      }
      case "S": {
        const c1: [number, number] =
          prevCtl && prevCmd === "C"
            ? [2 * cx - prevCtl[0], 2 * cy - prevCtl[1]]
            : [cx, cy];
        const p = rel
          ? [cx + a[0], cy + a[1], cx + a[2], cy + a[3]]
          : a.slice();
        cmds.push({ cmd: "C", args: [c1[0], c1[1], p[0], p[1], p[2], p[3]] });
        prevCtl = [p[0], p[1]];
        cx = p[2];
        cy = p[3];
        prevCmd = "C";
        prevQCtl = null;
        break;
      }
      case "Q": {
        const p = rel
          ? [cx + a[0], cy + a[1], cx + a[2], cy + a[3]]
          : a.slice();
        cmds.push({ cmd: "Q", args: p });
        prevQCtl = [p[0], p[1]];
        cx = p[2];
        cy = p[3];
        prevCmd = "Q";
        prevCtl = null;
        break;
      }
      case "T": {
        const qc: [number, number] =
          prevQCtl && prevCmd === "Q"
            ? [2 * cx - prevQCtl[0], 2 * cy - prevQCtl[1]]
            : [cx, cy];
        const x = rel ? cx + a[0] : a[0];
        const y = rel ? cy + a[1] : a[1];
        cmds.push({ cmd: "Q", args: [qc[0], qc[1], x, y] });
        prevQCtl = qc;
        cx = x;
        cy = y;
        prevCmd = "Q";
        prevCtl = null;
        break;
      }
      case "A": {
        const x = rel ? cx + a[5] : a[5];
        const y = rel ? cy + a[6] : a[6];
        cmds.push({ cmd: "A", args: [a[0], a[1], a[2], a[3], a[4], x, y] });
        cx = x;
        cy = y;
        prevCmd = "A";
        prevCtl = null;
        prevQCtl = null;
        break;
      }
    }
  }
  return cmds;
}

export function stretchPath(
  d: string,
  { origW, origH, width, height, scale = 1 }: StretchOptions,
): string {
  const sw = origW * scale;
  const sh = origH * scale;
  const dx = width - sw;
  const dy = height - sh;
  const shift = (v: number, size: number, delta: number) =>
    v < size * 0.4 ? v : v > size * 0.6 ? v + delta : v + delta / 2;
  const px = (x: number) => shift(x * scale, sw, dx);
  const py = (y: number) => shift(y * scale, sh, dy);
  const r = (v: number) => Math.round(v * 100) / 100;

  return normalize(d)
    .map(({ cmd, args }) => {
      if (cmd === "Z") return "Z";
      if (cmd === "A") {
        const [rx, ry, rot, laf, sf, x, y] = args;
        return `A${r(rx * scale)} ${r(ry * scale)} ${rot} ${laf} ${sf} ${r(px(x))} ${r(py(y))}`;
      }
      const p: number[] = [];
      for (let j = 0; j < args.length; j += 2)
        p.push(r(px(args[j])), r(py(args[j + 1])));
      return `${cmd}${p.join(" ")}`;
    })
    .join(" ");
}
