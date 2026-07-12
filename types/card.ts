export type LayoutPreset = "tactician" | "minimalist";

export interface CardToggles {
  showPassives: boolean;
  showSpellSaveDC: boolean;
  showPortrait: boolean;
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

export const DEFAULT_RESISTANCES: Resistances = Object.fromEntries(
  DAMAGE_TYPE_KEYS.map((key) => [key, "neither"]),
) as Resistances;

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

  // Visuals
  portraitUrl: string;

  // Layout
  preset: LayoutPreset;
  toggles: CardToggles;
}

export const DEFAULT_CARD: CardData = {
  id: "default",
  characterName: "Aelindra",
  characterClass: "Paladin",
  ac: 18,
  maxHp: 52,
  speed: 30,
  passivePerception: 12,
  passiveInsight: 14,
  spellSaveDC: 14,
  stats: {
    str: { modifier: "+5", proficiency: true },
    dex: { modifier: "+2", proficiency: false },
    con: { modifier: "+3", proficiency: true },
    int: { modifier: "-1", proficiency: false },
    wis: { modifier: "+0", proficiency: false },
    cha: { modifier: "+2", proficiency: false },
  },
  resistances: DEFAULT_RESISTANCES,
  portraitUrl: "",
  preset: "tactician",
  toggles: {
    showPassives: true,
    showSpellSaveDC: true,
    showPortrait: false,
  },
};
