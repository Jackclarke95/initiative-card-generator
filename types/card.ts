export type LayoutPreset = "tactician" | "minimalist";

export type ArtMode = "class" | "upload" | "link" | "none";

// The name banner's artwork style — the plain ribbon, the ribbon with a
// dragon's head, the more elaborate party ribbon, the spellbook-and-quill
// ribbon, or hidden entirely. Player and DM faces each pick their own
// independently.
export type ScrollStyle = "scroll" | "dragon" | "party" | "spell" | "none";

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
  party: "Party",
  spell: "Spell",
  none: "None",
};
export const SCROLL_STYLE_MODES: ScrollStyle[] = [
  "scroll",
  "dragon",
  "party",
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

  // Vitals — left blank (undefined) to print an empty card.
  ac?: number;
  maxHp?: number;
  speed?: number;

  // Passives
  passivePerception?: number;
  passiveInsight?: number;
  spellSaveDC?: number;

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
}

export function emptyCard(id: string): CardData {
  return {
    id,
    characterName: "",
    characterClass: "",
    stats: {
      str: { modifier: "", proficiency: false },
      dex: { modifier: "", proficiency: false },
      con: { modifier: "", proficiency: false },
      int: { modifier: "", proficiency: false },
      wis: { modifier: "", proficiency: false },
      cha: { modifier: "", proficiency: false },
    },
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
