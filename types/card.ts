export type LayoutPreset = "tactician" | "minimalist";

export interface CardToggles {
  showPassives: boolean;
  showSpellSaveDC: boolean;
  showPortrait: boolean;
}

export interface CardData {
  // Identity
  characterName: string;
  characterClass: string;

  // Vitals
  ac: number;
  maxHp: number;
  speed: number;

  // Passives
  passivePerception: number;
  passiveInsight: number;
  spellSaveDC: number;

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
  portraitUrl: "",
  gutterHeightCm: 1,
  preset: "tactician",
  toggles: {
    showPassives: true,
    showSpellSaveDC: true,
    showPortrait: false,
  },
};
