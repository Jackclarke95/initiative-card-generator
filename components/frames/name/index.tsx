// BasicScroll/DragonScroll/PartyScroll/SpellScroll — the four name-banner
// styles, each supplying its own artwork + curve/box/text-offset to
// NameFrame. SCROLL_STYLES is a Record<ScrollStyle, ...> lookup (mirroring
// DamageTypeBadge's DAMAGE_TYPE_REACT_ICONS pattern) rather than a switch —
// callers pick a variant by looking it up, not by branching on it.

import { INK } from "@/components/frames/Frame";
import { NameFrame } from "@/components/frames/name/NameFrame";
import {
  BODY,
  BODY_THIN,
  NAME_CURVE,
  ROLL_GREY,
  ROLL_THIN,
  ROLL_WHITE,
  SCROLL_BOX,
} from "@/components/frames/name/BasicScrollArt";
import {
  DRAGON_EYE,
  DRAGON_PATHS,
  DRAGON_SCROLL_BOX,
} from "@/components/frames/name/DragonScrollArt";
import {
  PARTY_SCROLL,
  PARTY_SCROLL_BOX,
  PARTY_SCROLL_INK,
} from "@/components/frames/name/PartyScrollArt";
import {
  SPELL_SCROLL_BOX,
  SPELL_SCROLL_OPS,
} from "@/components/frames/name/SpellScrollArt";
import type { ScrollStyle } from "@/types/card";
import type { ScrollBox } from "@/components/frames/name/NameFrame";

interface ScrollProps {
  width: number;
  height: number;
  value?: React.ReactNode;
  hideValue?: boolean;
}

const line = { stroke: INK, vectorEffect: "non-scaling-stroke" as const };

/** The plain ribbon, no dragon or extra artwork above it. */
export function BasicScroll({ width, height, value, hideValue }: ScrollProps) {
  const box = SCROLL_BOX;
  const art = (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <path d={ROLL_WHITE} fill="#fff" />
      <path d={ROLL_WHITE} {...line} strokeWidth={1.38} />
      <path d={ROLL_THIN} {...line} strokeWidth={0.75} />
      <path d={ROLL_GREY} fill="#bfc0c3" />
      <path d={ROLL_GREY} {...line} strokeWidth={1.38} />
      <path d={BODY} fill="#fff" />
      <path d={BODY} {...line} strokeWidth={1.38} />
      <path d={BODY_THIN} {...line} strokeWidth={0.75} />
    </svg>
  );
  return (
    <NameFrame
      width={width}
      height={height}
      art={art}
      box={box}
      curve={NAME_CURVE}
      value={value}
      hideValue={hideValue}
    />
  );
}

/** The dragon-headed ribbon. */
export function DragonScroll({ width, height, value, hideValue }: ScrollProps) {
  const box = DRAGON_SCROLL_BOX;
  const art = (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <path d={DRAGON_PATHS[0]} fill={INK} />
      {/* Depth order: body at the back, grey backing sheet over it, white
          flap in front — keeps the flap's top edge complete with the grey
          wedge peeking out exactly like it does along the bottom. */}
      <path d={ROLL_WHITE} fill="#fff" />
      <path d={ROLL_WHITE} {...line} strokeWidth={1.38} />
      <path d={ROLL_THIN} {...line} strokeWidth={0.75} />
      <path d={ROLL_GREY} fill="#bfc0c3" />
      <path d={ROLL_GREY} {...line} strokeWidth={1.38} />
      <path d={BODY} fill="#fff" />
      <path d={BODY} {...line} strokeWidth={1.38} />
      <path d={BODY_THIN} {...line} strokeWidth={0.75} />
      {DRAGON_PATHS.slice(1).map((d, i) => (
        <path key={i} d={d} fill={INK} />
      ))}
      <path d={DRAGON_EYE} fill="#fff" />
    </svg>
  );
  return (
    <NameFrame
      width={width}
      height={height}
      art={art}
      box={box}
      curve={NAME_CURVE}
      value={value}
      hideValue={hideValue}
    />
  );
}

/** The more elaborate party ribbon. */
export function PartyScroll({ width, height, value, hideValue }: ScrollProps) {
  const box = PARTY_SCROLL_BOX;
  const art = (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      {PARTY_SCROLL_INK.map((d, i) => (
        <path key={i} d={d} fill={INK} />
      ))}
      <path d={PARTY_SCROLL.rollWhite} fill="#fff" />
      <path d={PARTY_SCROLL.rollWhite} {...line} strokeWidth={1.38} />
      <path d={PARTY_SCROLL.rollThin} {...line} strokeWidth={0.75} />
      <path d={PARTY_SCROLL.rollGrey} fill="#bfc0c3" />
      <path d={PARTY_SCROLL.rollGrey} {...line} strokeWidth={1.38} />
      <path d={PARTY_SCROLL.body} fill="#fff" />
      <path d={PARTY_SCROLL.bodyThin} {...line} strokeWidth={0.75} />
      <path d={PARTY_SCROLL.body} {...line} strokeWidth={1.38} />
    </svg>
  );
  // The party ribbon sits ~1 unit higher than the basic/dragon ribbon at
  // the same curve coordinates.
  return (
    <NameFrame
      width={width}
      height={height}
      art={art}
      box={box}
      curve={NAME_CURVE}
      textOffset={{ x: 0, y: -1 }}
      value={value}
      hideValue={hideValue}
    />
  );
}

/** The spellbook-and-quill ribbon. */
export function SpellScroll({ width, height, value, hideValue }: ScrollProps) {
  const box = SPELL_SCROLL_BOX;
  const art = (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      {SPELL_SCROLL_OPS.map((op, i) =>
        op.stroke ? (
          <path key={i} d={op.d} {...line} strokeWidth={op.stroke} />
        ) : (
          <path key={i} d={op.d} fill={op.fill} />
        ),
      )}
    </svg>
  );
  return (
    <NameFrame
      width={width}
      height={height}
      art={art}
      box={box}
      curve={NAME_CURVE}
      textOffset={{ x: 0, y: 0.5 }}
      value={value}
      hideValue={hideValue}
    />
  );
}

/** Lookup from a card's chosen scroll style to its component + crop box —
 *  callers (e.g. sizing the banner from its own aspect ratio) pick a
 *  variant by indexing this, not by branching on the style. */
export const SCROLL_STYLES: Record<
  Exclude<ScrollStyle, "none">,
  { Component: (props: ScrollProps) => React.JSX.Element; box: ScrollBox }
> = {
  scroll: { Component: BasicScroll, box: SCROLL_BOX },
  dragon: { Component: DragonScroll, box: DRAGON_SCROLL_BOX },
  party: { Component: PartyScroll, box: PARTY_SCROLL_BOX },
  spell: { Component: SpellScroll, box: SPELL_SCROLL_BOX },
};
