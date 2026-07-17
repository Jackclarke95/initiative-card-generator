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
} from "@/types/card";

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
