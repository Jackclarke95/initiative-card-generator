export type DamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type LayoutPreset = "tactician" | "minimalist";

export interface CardToggles {
  showPassives: boolean;
  showStats: boolean;
  showDefenses: boolean;
  showSpellSaveDC: boolean;
  showPortrait: boolean;
  showClassLogo: boolean;
}

export interface CardData {
  // Identity
  characterName: string;
  playerName: string;
  race: string;
  characterClass: string;
  subclass: string;
  level: number;

  // Vitals
  initiative: number;
  ac: number;
  maxHp: number;
  speed: number;

  // Passives
  passivePerception: number;
  passiveInsight: number;
  passiveInvestigation: number;
  spellSaveDC: number;

  // Ability scores (we derive modifiers)
  abilityScores: AbilityScores;

  // Defenses
  resistances: DamageType[];
  immunities: DamageType[];

  // Visuals
  portraitUrl: string;

  // Layout
  gutterHeightCm: number;
  preset: LayoutPreset;
  toggles: CardToggles;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const DEFAULT_CARD: CardData = {
  characterName: "Aelindra",
  playerName: "Jack",
  race: "Half-Elf",
  characterClass: "Paladin",
  subclass: "Oath of Devotion",
  level: 5,
  initiative: 2,
  ac: 18,
  maxHp: 52,
  speed: 30,
  passivePerception: 12,
  passiveInsight: 14,
  passiveInvestigation: 11,
  spellSaveDC: 14,
  abilityScores: {
    str: 18,
    dex: 10,
    con: 16,
    int: 8,
    wis: 12,
    cha: 16,
  },
  resistances: [],
  immunities: ["poison"],
  portraitUrl: "",
  gutterHeightCm: 1,
  preset: "tactician",
  toggles: {
    showPassives: true,
    showStats: true,
    showDefenses: true,
    showSpellSaveDC: true,
    showPortrait: true,
    showClassLogo: false,
  },
};
