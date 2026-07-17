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
  ScrollStyle,
  DamageTypeKey,
  ResistanceState,
  VitalBoxConfig,
} from "@/types/card";
import {
  inToPx,
  PLAYER_BORDER_MARGIN_HEIGHT,
  PX_PER_IN,
  scrollHeightFor,
  type SideLayoutConfig,
} from "@/lib/cardLayout";

type LayoutSide = "player" | "dm";

// Approximates the height a side needs to show just its name banner —
// mirrors the padding/margins DmFace and PlayerFace themselves use for
// that section (see components/CardFaces.tsx: DmFace's outer `padding: 8`,
// PlayerFace's name-section `marginTop: 4` inside its border-inset
// content box). Not pixel-exact by design — it's a starting point for
// "Show name only", and the Height field stays freely editable after.
function nameOnlyHeightIn(
  side: LayoutSide,
  widthIn: number,
  scrollVariant: Exclude<ScrollStyle, "none">,
): number {
  const widthPx = inToPx(widthIn);
  const heightPx =
    side === "dm"
      ? scrollHeightFor(scrollVariant, widthPx - 2 - 16) + 16
      : scrollHeightFor(scrollVariant, widthPx - 40) +
        4 +
        8 +
        2 +
        PLAYER_BORDER_MARGIN_HEIGHT * 2;
  return Math.round((heightPx / PX_PER_IN) * 100) / 100;
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
  /** "" clears the box's value to undefined; otherwise parseInt (NaN → undefined). */
  setVitalBoxNum(id: string, raw: string): void;
  addVitalBox(): void;
  removeVitalBox(id: string): void;
  /** Moves the box with `id` so it sits at `toIndex` in the list. */
  moveVitalBox(id: string, toIndex: number): void;
  /** Sets (or, passed undefined, clears) this card's override for one side's
   *  layout. Clears `layoutOverride` back to undefined entirely once
   *  neither side is overridden. */
  setLayoutOverrideSide(side: LayoutSide, value: SideLayoutConfig | undefined): void;
  /** Hides every other section on `side` and sets its height to fit just
   *  the name banner — `effectiveSide` is that side's currently-resolved
   *  config (party default or existing override); this is a shortcut for
   *  applying the same section-visibility and height settings by hand,
   *  not a distinct mode — the result stays freely editable afterward. */
  applyNameOnlyPreset(side: LayoutSide, effectiveSide: SideLayoutConfig): void;
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

  function setVitalBoxNum(id: string, raw: string) {
    if (raw === "") {
      setVitalBox(id, { value: undefined });
      return;
    }
    const parsed = parseInt(raw, 10);
    setVitalBox(id, { value: Number.isNaN(parsed) ? undefined : parsed });
  }

  function addVitalBox() {
    onChange({
      ...card,
      vitalBoxes: [
        ...card.vitalBoxes,
        { id: crypto.randomUUID(), label: "New", frame: "shield" },
      ],
    });
  }

  function removeVitalBox(id: string) {
    onChange({
      ...card,
      vitalBoxes: card.vitalBoxes.filter((box) => box.id !== id),
    });
  }

  function moveVitalBox(id: string, toIndex: number) {
    const boxes = card.vitalBoxes;
    const fromIndex = boxes.findIndex((box) => box.id === id);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const next = boxes.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(
      Math.max(0, Math.min(toIndex, next.length)),
      0,
      moved,
    );
    onChange({ ...card, vitalBoxes: next });
  }

  function setLayoutOverrideSide(
    side: LayoutSide,
    value: SideLayoutConfig | undefined,
  ) {
    const next = { ...card.layoutOverride, [side]: value };
    if (value === undefined) delete next[side];
    const layoutOverride = next.player || next.dm ? next : undefined;
    onChange({ ...card, layoutOverride });
  }

  function applyNameOnlyPreset(
    side: LayoutSide,
    effectiveSide: SideLayoutConfig,
  ) {
    if (side === "dm") {
      const nameScrollDm =
        card.toggles.nameScrollDm === "none" ? "scroll" : card.toggles.nameScrollDm;
      const heightIn = nameOnlyHeightIn("dm", effectiveSide.widthIn, nameScrollDm);
      onChange({
        ...card,
        layoutOverride: {
          ...card.layoutOverride,
          dm: { ...effectiveSide, visible: true, preset: "custom", heightIn },
        },
        damageDisplayMode: "none",
        toggles: {
          ...card.toggles,
          vitals: "none",
          abilityScores: "none",
          notesDisplayMode: "none",
          nameScrollDm,
        },
      });
    } else {
      const nameScrollPlayer =
        card.toggles.nameScrollPlayer === "none"
          ? "dragon"
          : card.toggles.nameScrollPlayer;
      const heightIn = nameOnlyHeightIn(
        "player",
        effectiveSide.widthIn,
        nameScrollPlayer,
      );
      onChange({
        ...card,
        layoutOverride: {
          ...card.layoutOverride,
          player: { ...effectiveSide, visible: true, preset: "custom", heightIn },
        },
        artMode: "none",
        toggles: { ...card.toggles, nameScrollPlayer },
      });
    }
  }

  return {
    set,
    patch,
    setNum,
    setStat,
    setResistance,
    setToggle,
    setVitalBox,
    setVitalBoxNum,
    addVitalBox,
    removeVitalBox,
    moveVitalBox,
    setLayoutOverrideSide,
    applyNameOnlyPreset,
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
