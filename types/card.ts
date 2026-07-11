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

export interface CardData {
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

  // Visuals
  portraitUrl: string;

  // Layout
  gutterHeightCm: number;
  preset: LayoutPreset;
  toggles: CardToggles;
}

export const DEFAULT_CARD: CardData = {
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
  portraitUrl: "",
  gutterHeightCm: 1,
  preset: "tactician",
  toggles: {
    showPassives: true,
    showSpellSaveDC: true,
    showPortrait: false,
  },
};
