// Immutable card-update helpers, shared by the sidebar form (CardEditor)
// and the inline preview editors (CardFaces via CardEditContext). Every
// method produces a brand-new CardData and hands it to `onChange` — never
// mutates in place. Keeping one implementation here means the form and the
// click-to-edit overlays behave identically (e.g. blank number fields clear
// to `undefined`, ability modifiers stay free-form strings).

import type {
  AbilityKey,
  AbilityStat,
  CardData,
  CardToggles,
  DamageTypeKey,
  ResistanceState,
  VitalBoxConfig,
  VitalRowAlign,
  VitalRowConfig,
} from "@/types/card";
import {
  DEFAULT_VITAL_ROW_ALIGN,
  DEFAULT_VITAL_ROW_COLUMNS,
} from "@/lib/vitalsLayout";

// Which row (index into `rows`) owns flat vitalBoxes position `flatIndex`,
// given each row's own `count` — an existing box's position always falls
// strictly inside exactly one row's span, so this is unambiguous for real
// boxes (unlike a *target* position sitting exactly on a row boundary,
// which is why moves are addressed by (row, local index) rather than a
// bare flat index — see moveVitalBox).
function ownerRowIndex(rows: VitalRowConfig[], flatIndex: number): number {
  let start = 0;
  for (let i = 0; i < rows.length; i++) {
    start += rows[i].count;
    if (flatIndex < start) return i;
  }
  return Math.max(0, rows.length - 1);
}

// Pushes any row whose `count` exceeds its own `columns` ceiling onto the
// next row, cascading as far as needed and creating new default rows once
// it runs off the end — this is the "row got too wide, push the last item
// onto the next row" behavior, reused by every mutator that can grow a
// row's count (adding a box, dragging one in, or shrinking a row's own
// column count below its current occupancy).
function fixupVitalRowOverflow(rows: VitalRowConfig[]): VitalRowConfig[] {
  const next: VitalRowConfig[] = [];
  let carry = 0;
  // A single forward pass over the FIXED original list, threading any
  // excess through as a running `carry` rather than mutating a later
  // index (or pushing new rows) from inside the loop that's iterating —
  // that indirection was the bug: it let the loop's own bound grow in
  // step with `i`, so malformed/NaN counts (e.g. from an in-between,
  // pre-`count`-field session) never satisfied the "no overflow" check
  // and pushed forever. Any row-count still not consumed after every
  // existing row spills into new trailing rows below.
  for (const row of rows) {
    const count = row.count + carry;
    if (count > row.columns) {
      next.push({ ...row, count: row.columns });
      carry = count - row.columns;
    } else {
      next.push({ ...row, count });
      carry = 0;
    }
  }
  while (carry > 0) {
    const count = Math.min(carry, DEFAULT_VITAL_ROW_COLUMNS);
    next.push({ count, columns: DEFAULT_VITAL_ROW_COLUMNS, align: DEFAULT_VITAL_ROW_ALIGN });
    carry -= count;
  }
  return next;
}

// Drops any row left holding zero boxes (a row emptied out by a removal or
// a merge) — always leaves at least one row, even an empty one, so there's
// somewhere for the next box to land.
function trimEmptyVitalRows(rows: VitalRowConfig[]): VitalRowConfig[] {
  const next = rows.filter((row) => row.count > 0);
  return next.length
    ? next
    : [{ count: 0, columns: DEFAULT_VITAL_ROW_COLUMNS, align: DEFAULT_VITAL_ROW_ALIGN }];
}

export interface CardUpdater {
  set<K extends keyof CardData>(key: K, value: CardData[K]): void;
  /** Set several top-level fields at once (e.g. art mode + class together). */
  patch(partial: Partial<CardData>): void;
  /** Numeric field: "" clears to undefined; otherwise parseInt (NaN → undefined). */
  setNum<K extends keyof CardData>(key: K, raw: string): void;
  setStat(key: AbilityKey, patch: Partial<AbilityStat>): void;
  setResistance(key: DamageTypeKey, state: ResistanceState): void;
  setToggle<K extends keyof CardToggles>(key: K, value: CardToggles[K]): void;
  setVitalBox(id: string, patch: Partial<VitalBoxConfig>): void;
  /** Free text, not just a number (e.g. "12/15", "40*") — "" clears the
   *  box's value to undefined; anything else is stored as-is. */
  setVitalBoxValue(id: string, raw: string): void;
  /** Appends a new box to the very end of the list, landing in the last
   *  row (overflowing onto a new row if that row's already full). */
  addVitalBox(): void;
  removeVitalBox(id: string): void;
  /** Moves the box with `id` so it becomes local position `toLocalIndex`
   *  within row `toRowIndex` (both 0-based) — used for both within-row
   *  reordering and dragging a box into a different row. Addressed by row
   *  + local index (not a flat index) because a flat position sitting
   *  exactly on a row boundary is otherwise ambiguous between "end of this
   *  row" and "start of the next". Any resulting overflow cascades onto
   *  subsequent rows exactly like adding a box would. */
  moveVitalBox(id: string, toRowIndex: number, toLocalIndex: number): void;
  /** Moves the box with `id` up or down by exactly one flat position — the
   *  mobile up/down buttons' equivalent of dragging it past its immediate
   *  neighbor. Within the same row this is a plain swap (no row counts
   *  change). Crossing into an adjacent row, it inserts next to whichever
   *  neighbor it displaced rather than swapping wholesale — except moving
   *  up into a row that's already at its own column ceiling, where there's
   *  no forward-cascade mechanism to make room, so it falls back to a
   *  swap; moving down into a full row inserts anyway and lets the
   *  existing overflow cascade push that row's last box onward,
   *  recursively spilling into the row after that if needed. */
  moveVitalBoxAdjacent(id: string, direction: "up" | "down"): void;
  /** Sets one row's configured column count (clamped to at least 1 — the
   *  card-width ceiling is enforced by the caller, which offers only the
   *  options that currently fit). Lowering it below the row's current
   *  count overflows the excess onto the next row. */
  setVitalRowColumns(rowIndex: number, columns: number): void;
  setVitalRowAlign(rowIndex: number, align: VitalRowAlign): void;
  /** Appends a new, empty row, matching the last row's column count. */
  addVitalRow(): void;
  /** Removes a row's own settings — the boxes it held aren't deleted, they
   *  merge into the next row (or the previous one, if it was the last row),
   *  overflowing further if that row can't hold them all. No-op if it's
   *  the only row. */
  removeVitalRow(rowIndex: number): void;
}

/** Builds a set of update helpers bound to a specific card + onChange. Each
 *  method closes over `card`, so rebuild the updater whenever the card
 *  changes (edits are immutable and committed one at a time, so reading the
 *  card at creation time is safe). */
export function createCardUpdater(
  card: CardData,
  onChange: (card: CardData) => void,
): CardUpdater {
  function set<K extends keyof CardData>(key: K, value: CardData[K]) {
    onChange({ ...card, [key]: value });
  }

  function patch(partial: Partial<CardData>) {
    onChange({ ...card, ...partial });
  }

  function setNum<K extends keyof CardData>(key: K, raw: string) {
    if (raw === "") {
      set(key, undefined as CardData[K]);
      return;
    }
    const parsed = parseInt(raw, 10);
    set(key, (Number.isNaN(parsed) ? undefined : parsed) as CardData[K]);
  }

  function setStat(key: AbilityKey, patch: Partial<AbilityStat>) {
    onChange({
      ...card,
      stats: { ...card.stats, [key]: { ...card.stats[key], ...patch } },
    });
  }

  function setResistance(key: DamageTypeKey, state: ResistanceState) {
    onChange({
      ...card,
      resistances: { ...card.resistances, [key]: state },
    });
  }

  function setToggle<K extends keyof CardToggles>(
    key: K,
    value: CardToggles[K],
  ) {
    onChange({ ...card, toggles: { ...card.toggles, [key]: value } });
  }

  function setVitalBox(id: string, patch: Partial<VitalBoxConfig>) {
    onChange({
      ...card,
      vitalBoxes: card.vitalBoxes.map((box) =>
        box.id === id ? { ...box, ...patch } : box,
      ),
    });
  }

  function setVitalBoxValue(id: string, raw: string) {
    setVitalBox(id, { value: raw === "" ? undefined : raw });
  }

  function addVitalBox() {
    const vitalBoxes = [
      ...card.vitalBoxes,
      { id: crypto.randomUUID(), label: "New", frame: "shield" as const },
    ];
    const rows = card.vitalRows.length
      ? card.vitalRows.slice()
      : [{ count: 0, columns: DEFAULT_VITAL_ROW_COLUMNS, align: DEFAULT_VITAL_ROW_ALIGN }];
    const lastIndex = rows.length - 1;
    rows[lastIndex] = { ...rows[lastIndex], count: rows[lastIndex].count + 1 };
    onChange({
      ...card,
      vitalBoxes,
      vitalRows: fixupVitalRowOverflow(rows),
    });
  }

  function removeVitalBox(id: string) {
    const fromIndex = card.vitalBoxes.findIndex((box) => box.id === id);
    if (fromIndex === -1) return;
    const vitalBoxes = card.vitalBoxes.filter((box) => box.id !== id);
    const owner = ownerRowIndex(card.vitalRows, fromIndex);
    const rows = card.vitalRows.map((row, i) =>
      i === owner ? { ...row, count: row.count - 1 } : row,
    );
    onChange({
      ...card,
      vitalBoxes,
      vitalRows: trimEmptyVitalRows(rows),
    });
  }

  function moveVitalBox(id: string, toRowIndex: number, toLocalIndex: number) {
    const boxes = card.vitalBoxes;
    const fromIndex = boxes.findIndex((box) => box.id === id);
    if (fromIndex === -1) return;
    const fromRow = ownerRowIndex(card.vitalRows, fromIndex);

    const rowStart = card.vitalRows
      .slice(0, toRowIndex)
      .reduce((sum, row) => sum + row.count, 0);
    const toIndex = rowStart + Math.max(0, toLocalIndex);
    if (fromIndex === toIndex && fromRow === toRowIndex) return;

    const next = boxes.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, moved);

    let rows = card.vitalRows.slice();
    rows[fromRow] = { ...rows[fromRow], count: rows[fromRow].count - 1 };
    rows[toRowIndex] = { ...rows[toRowIndex], count: rows[toRowIndex].count + 1 };
    rows = trimEmptyVitalRows(fixupVitalRowOverflow(rows));

    onChange({ ...card, vitalBoxes: next, vitalRows: rows });
  }

  function moveVitalBoxAdjacent(id: string, direction: "up" | "down") {
    const boxes = card.vitalBoxes;
    const fromFlat = boxes.findIndex((box) => box.id === id);
    if (fromFlat === -1) return;
    const neighborFlat = direction === "up" ? fromFlat - 1 : fromFlat + 1;
    if (neighborFlat < 0 || neighborFlat >= boxes.length) return;

    const fromRow = ownerRowIndex(card.vitalRows, fromFlat);
    const neighborRow = ownerRowIndex(card.vitalRows, neighborFlat);

    // A pure content swap never touches row counts — the two boxes just
    // trade which flat slot (and therefore which row) they occupy.
    function swapInPlace() {
      const next = boxes.slice();
      [next[fromFlat], next[neighborFlat]] = [
        next[neighborFlat],
        next[fromFlat],
      ];
      onChange({ ...card, vitalBoxes: next });
    }

    if (neighborRow === fromRow) {
      swapInPlace();
      return;
    }

    const neighborRowConfig = card.vitalRows[neighborRow];
    const neighborRowFull = neighborRowConfig.count >= neighborRowConfig.columns;
    if (direction === "up" && neighborRowFull) {
      swapInPlace();
      return;
    }

    // Insert next to the neighbor it displaced — before it going up, after
    // it going down. Removing at fromFlat first means splicing back in at
    // the neighbor's own (pre-removal) flat index lands on the correct
    // side in both directions: if fromFlat is later than neighborFlat, the
    // neighbor's position is untouched by the removal, so inserting there
    // pushes it forward (after); if fromFlat is earlier, the neighbor has
    // already shifted back by one, so the same index now lands just past
    // it (also after) — one flat-index compare short of duplicating this
    // per direction.
    const next = boxes.slice();
    const [moved] = next.splice(fromFlat, 1);
    next.splice(neighborFlat, 0, moved);

    let rows = card.vitalRows.slice();
    rows[fromRow] = { ...rows[fromRow], count: rows[fromRow].count - 1 };
    rows[neighborRow] = {
      ...rows[neighborRow],
      count: rows[neighborRow].count + 1,
    };
    rows = trimEmptyVitalRows(fixupVitalRowOverflow(rows));

    onChange({ ...card, vitalBoxes: next, vitalRows: rows });
  }

  function setVitalRowColumns(rowIndex: number, columns: number) {
    const clamped = Math.max(1, Math.round(columns));
    const rows = card.vitalRows.map((row, i) =>
      i === rowIndex ? { ...row, columns: clamped } : row,
    );
    onChange({
      ...card,
      vitalRows: fixupVitalRowOverflow(rows),
    });
  }

  function setVitalRowAlign(rowIndex: number, align: VitalRowAlign) {
    onChange({
      ...card,
      vitalRows: card.vitalRows.map((row, i) =>
        i === rowIndex ? { ...row, align } : row,
      ),
    });
  }

  function addVitalRow() {
    const last = card.vitalRows[card.vitalRows.length - 1];
    onChange({
      ...card,
      vitalRows: [
        ...card.vitalRows,
        {
          count: 0,
          columns: last?.columns ?? DEFAULT_VITAL_ROW_COLUMNS,
          align: last?.align ?? DEFAULT_VITAL_ROW_ALIGN,
        },
      ],
    });
  }

  function removeVitalRow(rowIndex: number) {
    if (card.vitalRows.length <= 1) return;
    const removed = card.vitalRows[rowIndex];
    const rest = card.vitalRows.filter((_, i) => i !== rowIndex);
    const mergeIndex = rowIndex < rest.length ? rowIndex : rest.length - 1;
    rest[mergeIndex] = {
      ...rest[mergeIndex],
      count: rest[mergeIndex].count + removed.count,
    };
    onChange({
      ...card,
      vitalRows: trimEmptyVitalRows(fixupVitalRowOverflow(rest)),
    });
  }

  return {
    set,
    patch,
    setNum,
    setStat,
    setResistance,
    setToggle,
    setVitalBox,
    setVitalBoxValue,
    addVitalBox,
    removeVitalBox,
    moveVitalBox,
    moveVitalBoxAdjacent,
    setVitalRowColumns,
    setVitalRowAlign,
    addVitalRow,
    removeVitalRow,
  };
}

export const RESISTANCE_CYCLE: ResistanceState[] = [
  "neither",
  "resistant",
  "immune",
];

export function nextResistanceState(state: ResistanceState): ResistanceState {
  return RESISTANCE_CYCLE[
    (RESISTANCE_CYCLE.indexOf(state) + 1) % RESISTANCE_CYCLE.length
  ];
}
