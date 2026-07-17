// Per-side physical layout: size preset, explicit width/height, and
// visibility. Lives at the party level as the shared default for every
// card; an individual card can override one or both sides independently
// (see CardData.layoutOverride).

import { SCROLL_STYLES } from "@/components/frames/name";
import type { CardData, ScrollStyle } from "@/types/card";
import type { Party } from "@/types/party";

export type CardSizePresetKey =
  | "poker"
  | "bridge"
  | "tarot"
  | "jumbo"
  | "custom";

export const CARD_SIZE_PRESETS: Record<
  Exclude<CardSizePresetKey, "custom">,
  { widthIn: number; heightIn: number; label: string }
> = {
  poker: { widthIn: 2.5, heightIn: 3.5, label: "Poker (2.5 × 3.5 in)" },
  bridge: { widthIn: 2.25, heightIn: 3.5, label: "Bridge (2.25 × 3.5 in)" },
  tarot: { widthIn: 2.75, heightIn: 4.75, label: "Tarot (2.75 × 4.75 in)" },
  jumbo: { widthIn: 3.5, heightIn: 5.75, label: "Jumbo (3.5 × 5.75 in)" },
};

export const CARD_SIZE_PRESET_KEYS: CardSizePresetKey[] = [
  "poker",
  "bridge",
  "tarot",
  "jumbo",
  "custom",
];

export const CARD_SIZE_PRESET_LABELS: Record<CardSizePresetKey, string> = {
  poker: CARD_SIZE_PRESETS.poker.label,
  bridge: CARD_SIZE_PRESETS.bridge.label,
  tarot: CARD_SIZE_PRESETS.tarot.label,
  jumbo: CARD_SIZE_PRESETS.jumbo.label,
  custom: "Custom",
};

export interface SideLayoutConfig {
  visible: boolean;
  /** "custom" once width/height no longer match a known preset's numbers. */
  preset: CardSizePresetKey;
  widthIn: number;
  heightIn: number;
}

// The narrowest a side's own DM-face vitals row can compress its three
// boxes into before they'd need to shrink well below a legible size —
// the form clamps to this rather than letting a narrower width overflow
// the card's border (see DmFace's vitalGap/vitalW math).
export const MIN_SIDE_WIDTH_IN = 2.25;

export interface LayoutConfig {
  player: SideLayoutConfig;
  dm: SideLayoutConfig;
  /** Blank strip between the two faces so the sheet folds around the
   *  DM screen's thickness. Only meaningful (and only shown) when both
   *  sides are visible. */
  gutterCm: number;
}

/** A card's per-side deviation from its party's shared LayoutConfig. Each
 *  side is all-or-nothing: either the card fully inherits that side from the
 *  party default, or it fully replaces it — no field-by-field merging. */
export interface LayoutOverride {
  player?: SideLayoutConfig;
  dm?: SideLayoutConfig;
}

export function sideLayoutFromPreset(
  preset: Exclude<CardSizePresetKey, "custom">,
  overrides?: Partial<SideLayoutConfig>,
): SideLayoutConfig {
  const { widthIn, heightIn } = CARD_SIZE_PRESETS[preset];
  return {
    visible: true,
    preset,
    widthIn,
    heightIn,
    ...overrides,
  };
}

export function defaultLayoutConfig(): LayoutConfig {
  return {
    player: sideLayoutFromPreset("poker"),
    dm: sideLayoutFromPreset("poker"),
    gutterCm: 1,
  };
}

/** Merges a card's per-side overrides onto its party's shared defaults. */
export function resolveLayout(party: Party, card: CardData): LayoutConfig {
  return {
    player: card.layoutOverride?.player ?? party.layout.player,
    dm: card.layoutOverride?.dm ?? party.layout.dm,
    gutterCm: party.layout.gutterCm,
  };
}

export const PX_PER_IN = 96;
export const CM_PER_IN = 2.54;

export function inToPx(inches: number): number {
  return Math.round(inches * PX_PER_IN);
}

// The physical footprint of a resolved layout's whole card unit — both
// visible faces stacked, plus the gutter between them when both are
// shown. Used for the PDF export's oversize warning; deliberately just
// the configured numbers (no DOM measurement), so it can be computed
// synchronously as the user edits paper size/margins, before ever
// exporting anything.
export function unitFootprintIn(layout: LayoutConfig): {
  widthIn: number;
  heightIn: number;
} {
  const { player, dm, gutterCm } = layout;
  const bothVisible = player.visible && dm.visible;
  const heightIn =
    (player.visible ? player.heightIn : 0) +
    (dm.visible ? dm.heightIn : 0) +
    (bothVisible ? gutterCm / CM_PER_IN : 0);
  const widthIn = Math.max(
    player.visible ? player.widthIn : 0,
    dm.visible ? dm.widthIn : 0,
  );
  return { widthIn, heightIn };
}

// Each scroll variant crops its own source box at its own aspect ratio
// (see SCROLL_STYLES) — a banner rendered at width `w` needs its own
// height to match, or the SVG (preserveAspectRatio="none") stretches to
// whatever box it's given instead of scaling uniformly. Shared by
// CardFaces.tsx (actually rendering the banner) and cardUpdate.ts's "Show
// name only" preset (sizing a side to fit it).
export function scrollHeightFor(
  variant: Exclude<ScrollStyle, "none">,
  w: number,
): number {
  const box = SCROLL_STYLES[variant].box;
  return Math.round((box.h / box.w) * w);
}

// Inset of the player-side border from the card edge — even on all sides.
export const PLAYER_BORDER_MARGIN_WIDTH = 4;
export const PLAYER_BORDER_MARGIN_HEIGHT = 6;

function sideLayoutRenderEqual(a: SideLayoutConfig, b: SideLayoutConfig): boolean {
  // `preset` is excluded on purpose — it only drives which <option> the
  // select shows, and never affects what actually renders.
  return (
    a.visible === b.visible &&
    a.widthIn === b.widthIn &&
    a.heightIn === b.heightIn
  );
}

/** Value-based (not reference) equality for whatever actually affects a
 *  face's rendered output — lets memoized card components bail out even
 *  when the caller rebuilds a fresh LayoutConfig object every render. */
export function layoutRenderEqual(a: LayoutConfig, b: LayoutConfig): boolean {
  return (
    a.gutterCm === b.gutterCm &&
    sideLayoutRenderEqual(a.player, b.player) &&
    sideLayoutRenderEqual(a.dm, b.dm)
  );
}
