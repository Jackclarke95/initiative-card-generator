// Pure layout math for the vitals section's rows — shared by the DM face
// (actually rendering the badges) and the sidebar form (offering the right
// column-count options and slicing vitalBoxes per row for its own list).
// Nothing here touches React or CardData mutation; see lib/cardUpdate.ts for
// the update helpers that keep CardData.vitalRows in sync as boxes are
// added/removed/dragged.

import type { VitalRowAlign, VitalRowConfig } from "@/types/card";

export const DEFAULT_VITAL_ROW_COLUMNS = 3;
export const DEFAULT_VITAL_ROW_ALIGN: VitalRowAlign = "justify";

// Shared height every vitals badge renders at on the DM face — the sidebar
// form needs this too, to work out the same column ceiling DmFace does for
// a given card width.
export const VITAL_ICON_H = 60;

// Layout math never solves for a gap smaller than this, the same floor the
// original fixed-3-column vitals row used.
const MIN_VITAL_GAP = 2;

/** The narrowest a vital badge's box can be at a shared icon height — the
 *  widest available frame shape (currently the chevron) sets the floor
 *  every other shape just centers within. */
export function vitalBadgeMinWidth(iconH: number): number {
  return Math.ceil(
    Math.max(
      iconH * (50 / 57.08), // Shield
      iconH * (57.6 / 55.08), // Heart / Book
      iconH * (56.8 / 49.83), // Hexagon
      iconH * (55 / 48), // Chevron — currently the widest
      iconH, // Orb / Circle / Square — all 1:1 viewBoxes
    ),
  );
}

/** How many vital badges can actually fit, gapped, across a row
 *  `contentWidthPx` wide at a shared icon height `iconH` — the hard ceiling
 *  a row's own configured column count is clamped to, so a wide card can
 *  offer 4 per row while a narrower one only fits 1 or 2. */
export function maxVitalColumns(contentWidthPx: number, iconH: number): number {
  const minW = vitalBadgeMinWidth(iconH);
  return Math.max(
    1,
    Math.floor((contentWidthPx + MIN_VITAL_GAP) / (minW + MIN_VITAL_GAP)),
  );
}

/** Solves the shared per-box width/gap for a vitals section that's
 *  `columns` wide — ported as-is from the original fixed-3-column math,
 *  just generalized to however many columns actually fit, so every row
 *  shares one consistent badge size regardless of how many boxes it holds. */
export function vitalBoxMetrics(
  contentWidthPx: number,
  iconH: number,
  columns: number,
): { vitalW: number; vitalGap: number } {
  const minW = vitalBadgeMinWidth(iconH);
  const gapsCount = Math.max(0, columns - 1);
  const idealGap =
    gapsCount > 0
      ? Math.round((contentWidthPx - minW * columns) / gapsCount / 2)
      : 0;
  const vitalGap = Math.max(MIN_VITAL_GAP, idealGap);
  const vitalW = Math.max(
    1,
    Math.round((contentWidthPx - vitalGap * gapsCount) / columns),
  );
  return { vitalW, vitalGap };
}

/** The pixel width of a row's alignment slot grid — `slots` badges' worth
 *  of the shared badge width, gapped. Every row uses the SAME `slots`
 *  value (the card's own maxVitalColumns, not that row's own, possibly
 *  smaller, configured column count) — so every row spans the full card
 *  width and grows right along with it, whether or not it's actually
 *  holding that many badges; a "2 per row" row just centers/packs/spreads
 *  its 2 badges within that same full-width grid rather than rendering a
 *  narrower, fixed-size island. */
export function vitalRowGridWidth(
  slots: number,
  vitalW: number,
  vitalGap: number,
): number {
  return slots * vitalW + Math.max(0, slots - 1) * vitalGap;
}

/** The CSS `justify-content` a row's fixed-width flex container renders
 *  with. Combined with a slot grid sized to the card's full maxVitalColumns
 *  (see vitalRowGridWidth — NOT just this row's own `count` or column cap),
 *  plain flexbox reproduces all four alignments exactly: Left/Right are
 *  flex-start/flex-end, packing the actual `count` badges (at the standard
 *  gap) against one edge of the grid. Center is space-evenly, not a plain
 *  CSS "center" — a plain center just packs the badges into a tight block
 *  and centers that block, which for 2 badges bunches them together in the
 *  middle rather than the "roughly a third and two-thirds along" spread the
 *  original spec called for; space-evenly (equal space before, between, and
 *  after) gives that spread while still landing a lone badge dead center.
 *  Justify is space-between, stretching the gap to fill the grid
 *  edge-to-edge. Once `count` reaches maxVitalColumns there's no spare room
 *  left to distribute — the grid's own width is derived from the exact same
 *  per-badge width/gap as a full row, so the leftover space is exactly
 *  zero, not just close to it — so all four collapse to the identical,
 *  evenly-gapped result; not a special case, just what these formulas
 *  already yield once there's nothing left to arrange around. */
export function vitalRowJustifyContent(
  align: VitalRowAlign,
): "flex-start" | "flex-end" | "space-evenly" | "space-between" {
  switch (align) {
    case "right":
      return "flex-end";
    case "center":
      return "space-evenly";
    case "justify":
      return "space-between";
    default:
      return "flex-start";
  }
}

/** Which alignment choices make sense for a row currently holding `count`
 *  badges — Justify needs at least two badges (there's no second edge to
 *  justify a lone one against). */
export function availableVitalRowAligns(count: number): VitalRowAlign[] {
  return count <= 1 ? ["left", "right", "center"] : ["left", "right", "center", "justify"];
}

export interface VitalRowSpan {
  /** Index into the flat vitalBoxes array this stored row's boxes start at. */
  start: number;
  count: number;
}

/** The flat-array span each stored row currently owns, width-agnostic (no
 *  clamping to what fits on screen) — what the sidebar form needs to slice
 *  card.vitalBoxes per row and to find which row/local-index an existing
 *  box's flat position falls in, since the form lists every row's boxes
 *  regardless of how DmFace would currently render them. */
export function vitalRowSpans(rows: VitalRowConfig[]): VitalRowSpan[] {
  let start = 0;
  return rows.map((row) => {
    const span = { start, count: row.count };
    start += row.count;
    return span;
  });
}

export interface VitalRowLayout {
  /** Index into the flat vitalBoxes array this rendered chunk starts at. */
  start: number;
  /** How many boxes land in this rendered chunk — at most `capacity`; a
   *  stored row whose own `count` exceeds the current width's ceiling
   *  renders as more than one chunk (see below). */
  count: number;
  /** How many boxes this chunk can hold before the rest spill into another
   *  chunk/row — min(row.columns, maxColumns). This is NOT the alignment
   *  grid width (see vitalRowGridWidth, which always uses the card's full
   *  maxColumns instead); it only governs overflow-splitting. */
  capacity: number;
  align: VitalRowAlign;
  /** Index into the original `rows` array this chunk came from — several
   *  chunks can share the same rowIndex when a stored row's `count`
   *  overflows the current width's column ceiling. */
  rowIndex: number;
  /** How many of that stored row's boxes were already placed into earlier
   *  chunks — add this to a chunk-local position to recover the row's own
   *  local index, e.g. for addressing lib/cardUpdate.ts's moveVitalBox. */
  rowOffset: number;
}

/** Turns the stored, explicit-count `rows` into what actually renders right
 *  now: each row's `count` clamped by however many columns actually fit at
 *  the current width (`maxColumns`), splitting a row that's wider than that
 *  into extra chunks purely for this one render — this is the width half of
 *  "push the last badge onto the next row" (the other half, a row
 *  outgrowing its own configured `columns`, is handled once, up front, by
 *  lib/cardUpdate.ts, so `rows` here should already satisfy count<=columns
 *  for every row). Purely derived — never mutates or persists what it's
 *  given. */
export function computeVitalRowLayout(
  rows: VitalRowConfig[],
  maxColumns: number = Infinity,
): VitalRowLayout[] {
  const layout: VitalRowLayout[] = [];
  let start = 0;
  rows.forEach((row, rowIndex) => {
    const capacity = Math.max(1, Math.min(row.columns, maxColumns));
    let placed = 0;
    while (placed < row.count) {
      const count = Math.min(row.count - placed, capacity);
      layout.push({ start, count, capacity, align: row.align, rowIndex, rowOffset: placed });
      start += count;
      placed += count;
    }
  });
  return layout;
}
