import type { LayoutOverride } from "@/lib/cardLayout";

export type LayoutPreset = "tactician" | "minimalist";

export type ArtMode = "class" | "upload" | "link" | "none";

// The name banner's artwork style — the plain ribbon, the ribbon with a
// dragon's head, the more elaborate battle ribbon, the spellbook-and-quill
// ribbon, or hidden entirely. Player and DM faces each pick their own
// independently.
export type ScrollStyle = "scroll" | "dragon" | "battle" | "spell" | "none";

// How the DM notes box prints: with its "Notes" caption, with the caption
// dropped, or hidden entirely.
export type NotesDisplayMode = "labeled" | "unlabeled" | "none";

// How the ability score row prints: each box with its label above the
// value, the same box with the label dropped (the shrunk "compact" box),
// or the whole row hidden entirely. The proficiency dot always prints
// whenever the row is visible.
export type AbilityScoreDisplayMode = "full" | "compact" | "none";

// How the vitals block prints: each badge with its label (HP/AC/DC/etc.),
// the same badges with the labels dropped and the value printed a little
// larger, or the whole block hidden entirely.
export type VitalsDisplayMode = "full" | "compact" | "none";

export interface CardToggles {
  nameScrollPlayer: ScrollStyle;
  nameScrollDm: ScrollStyle;
  vitals: VitalsDisplayMode;
  abilityScores: AbilityScoreDisplayMode;
  notesDisplayMode: NotesDisplayMode;
}

// The vital-badge silhouettes (see components/frames/vitals) — which one a
// given vital box prints is now a per-box, user-chosen setting rather than
// fixed per stat.
export type VitalFrameShape =
  | "shield"
  | "heart"
  | "book"
  | "chevron"
  | "hexagon"
  | "orb"
  | "circle"
  | "square";

export const VITAL_FRAME_SHAPES: VitalFrameShape[] = [
  "shield",
  "heart",
  "book",
  "chevron",
  "hexagon",
  "orb",
  "circle",
  "square",
];

export const VITAL_FRAME_LABELS: Record<VitalFrameShape, string> = {
  shield: "Shield",
  heart: "Heart",
  book: "Book",
  chevron: "Chevron",
  hexagon: "Hexagon",
  orb: "Orb",
  circle: "Circle",
  square: "Square",
};

// One badge in the vitals row — the set, order, labels, and frame shapes are
// all user-configurable; nothing here is tied to a fixed stat name.
export interface VitalBoxConfig {
  id: string;
  /** The short caption printed on the badge itself, e.g. "HP". */
  label: string;
  value?: number;
  frame: VitalFrameShape;
}

// How a short row's badges are positioned within its own column-count-wide
// "slot grid" — moot (and ignored at render time) once the row is full,
// since every option converges on the same, evenly-gapped result once
// there's no spare room left to arrange around. Left/Right pack the badges
// against one edge of the grid (leaving the empty slots at the other end);
// Center packs them and centers that tight group in the grid; Justify
// spaces them edge-to-edge, first badge flush left and last flush right
// (the classic "space-between" look). Justify is dropped from the choices
// offered for a lone badge — there's no second edge to justify against.
export type VitalRowAlign = "left" | "right" | "center" | "justify";

export const VITAL_ROW_ALIGN_LABELS: Record<VitalRowAlign, string> = {
  left: "Left",
  right: "Right",
  center: "Center",
  justify: "Justified",
};

export const VITAL_ROW_ALIGNS: VitalRowAlign[] = [
  "left",
  "right",
  "center",
  "justify",
];

// One row of the vitals section — `vitalBoxes` stays one flat, ordered
// list; these just describe how it's chopped into rows. `count` is how many
// boxes (in list order) actually sit in this row right now — an explicit,
// independently adjustable number, not derived from `columns` — so one row
// can sit short of its own column count while a later row is completely
// full (e.g. row 1 holds just 1 badge, row 2 holds a full 3, row 3 holds
// 2). `columns` is the ceiling `count` can't exceed before the excess
// spills onto the next row; it's the user's intent independent of the
// card's current width — lib/vitalsLayout.ts clamps it against however many
// actually fit at render time, so widening the card later can hand a row
// back boxes that overflowed off it purely for width reasons. It does NOT
// set this row's own alignment grid width — every row aligns against the
// card's full width (its overall max column count), so a "2 per row" row
// still spans (and grows with) the whole card rather than a fixed, narrow
// slice of it.
export interface VitalRowConfig {
  count: number;
  columns: number;
  align: VitalRowAlign;
}

export interface AbilityStat {
  modifier: string;
  proficiency: boolean;
}

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export type AbilityStats = Record<AbilityKey, AbilityStat>;

// Order: Bludgeoning/Piercing/Slashing first (the physical types), then
// the rest alphabetically — matches how the DM face lays them out.
export const DAMAGE_TYPE_KEYS = [
  "bludgeoning",
  "piercing",
  "slashing",
  "acid",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "poison",
  "psychic",
  "radiant",
  "thunder",
] as const;
export type DamageTypeKey = (typeof DAMAGE_TYPE_KEYS)[number];

export const DAMAGE_TYPE_LABELS: Record<DamageTypeKey, string> = {
  bludgeoning: "Bludgeoning",
  piercing: "Piercing",
  slashing: "Slashing",
  acid: "Acid",
  cold: "Cold",
  fire: "Fire",
  force: "Force",
  lightning: "Lightning",
  necrotic: "Necrotic",
  poison: "Poison",
  psychic: "Psychic",
  radiant: "Radiant",
  thunder: "Thunder",
};

export type ResistanceState = "neither" | "resistant" | "immune";

export type Resistances = Record<DamageTypeKey, ResistanceState>;

// How each damage type is rendered on the card: its icon, its 2-letter
// initials, or both stacked together (the original look). "none" is a
// special case handled separately — it hides the whole resistances
// section rather than just tweaking each badge's contents.
export type DamageDisplayMode = "all" | "icon" | "initials" | "none";

export const DEFAULT_RESISTANCES: Resistances = Object.fromEntries(
  DAMAGE_TYPE_KEYS.map((key) => [key, "neither"]),
) as Resistances;

// ── Display-mode option lists ─────────────────────────────────────────
// The choices behind each section's segmented toggle in the form. Shared so
// the inline preview's right-click menus offer exactly the same options.

export const SCROLL_STYLE_LABELS: Record<ScrollStyle, string> = {
  scroll: "Basic",
  dragon: "Dragon",
  battle: "Battle",
  spell: "Spell",
  none: "None",
};
export const SCROLL_STYLE_MODES: ScrollStyle[] = [
  "scroll",
  "dragon",
  "battle",
  "spell",
  "none",
];

export const VITALS_MODE_LABELS: Record<VitalsDisplayMode, string> = {
  full: "Full",
  compact: "No Labels",
  none: "None",
};
export const VITALS_MODES: VitalsDisplayMode[] = ["full", "compact", "none"];

export const ABILITY_SCORE_MODE_LABELS: Record<AbilityScoreDisplayMode, string> =
  {
    full: "Full",
    compact: "Compact",
    none: "None",
  };
export const ABILITY_SCORE_MODES: AbilityScoreDisplayMode[] = [
  "full",
  "compact",
  "none",
];

export const DAMAGE_DISPLAY_LABELS: Record<DamageDisplayMode, string> = {
  all: "All",
  icon: "Icons",
  initials: "Initials",
  none: "None",
};
export const DAMAGE_DISPLAY_MODES: DamageDisplayMode[] = [
  "all",
  "icon",
  "initials",
  "none",
];

export const NOTES_DISPLAY_LABELS: Record<NotesDisplayMode, string> = {
  labeled: "Labeled",
  unlabeled: "Unlabeled",
  none: "None",
};
export const NOTES_DISPLAY_MODES: NotesDisplayMode[] = [
  "labeled",
  "unlabeled",
  "none",
];

export const ART_MODE_LABELS: Record<ArtMode, string> = {
  class: "Class Art",
  upload: "Upload Image",
  link: "Image URL",
  none: "No Art",
};
export const ART_MODES: ArtMode[] = ["class", "upload", "link", "none"];

export interface CardData {
  id: string;

  // Identity
  characterName: string;
  characterClass: string;

  // Vitals — an ordered, user-configurable list of badges (AC/HP/etc. by
  // default, but any label/frame/value combination the user sets up), plus
  // how that flat list is chopped into rows (see VitalRowConfig).
  vitalBoxes: VitalBoxConfig[];
  vitalRows: VitalRowConfig[];

  // Ability scores
  stats: AbilityStats;

  // Damage resistances/immunities
  resistances: Resistances;
  damageDisplayMode: DamageDisplayMode;

  // DM's freeform notes, printed in the box at the bottom of the DM face.
  notes?: string;

  // Visuals — class art draws an SVG logo for characterClass; custom art
  // uses portraitUrl (an uploaded image's data URL, or a pasted image link).
  artMode: ArtMode;
  portraitUrl: string;

  // Layout
  preset: LayoutPreset;
  toggles: CardToggles;
  /** Per-side deviations from the party's shared size/height/visibility
   *  defaults — undefined (or a missing side) means "inherit". */
  layoutOverride?: LayoutOverride;
}

// The default vitals row — Max HP / AC / Spell Save DC / Passive Perception /
// Speed / Passive Insight, in this order — used for every new card. Users are
// free to relabel, reshape, reorder, remove, or add to this from there.
function defaultVitalBoxes(): VitalBoxConfig[] {
  return [
    { id: crypto.randomUUID(), label: "HP", frame: "heart", value: 10 },
    { id: crypto.randomUUID(), label: "AC", frame: "shield", value: 10 },
    { id: crypto.randomUUID(), label: "DC", frame: "book", value: 10 },
    { id: crypto.randomUUID(), label: "PP", frame: "hexagon", value: 10 },
    { id: crypto.randomUUID(), label: "Speed", frame: "chevron", value: 30 },
    { id: crypto.randomUUID(), label: "Insight", frame: "orb", value: 10 },
  ];
}

export function emptyCard(id: string): CardData {
  return {
    id,
    characterName: "",
    characterClass: "",
    stats: {
      str: { modifier: "+0", proficiency: false },
      dex: { modifier: "+0", proficiency: false },
      con: { modifier: "+0", proficiency: false },
      int: { modifier: "+0", proficiency: false },
      wis: { modifier: "+0", proficiency: false },
      cha: { modifier: "+0", proficiency: false },
    },
    vitalBoxes: defaultVitalBoxes(),
    vitalRows: [
      { count: 3, columns: 3, align: "justify" },
      { count: 3, columns: 3, align: "justify" },
    ],
    resistances: DEFAULT_RESISTANCES,
    damageDisplayMode: "all",
    artMode: "class",
    portraitUrl: "",
    preset: "tactician",
    toggles: {
      nameScrollPlayer: "dragon",
      nameScrollDm: "scroll",
      vitals: "full",
      abilityScores: "full",
      notesDisplayMode: "labeled",
    },
  };
}
