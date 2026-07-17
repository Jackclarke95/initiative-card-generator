// Shield/Heart/Book/Chevron/Hexagon/Orb/Circle/Square — each just forwards
// its own shape data to VitalsFrame, plus whatever layout knobs the caller
// passes through unchanged. None of them hardcodes tuning for its own
// shape — e.g. the Heart's narrower base doesn't get special-cased padding
// here; if a particular value/label overflows a particular shape, the
// caller renders that instance with its own `labelInset`/`sidePadding`/
// `maxValueSize` override, same as it could for any other shape.

import { VitalsFrame } from "@/components/frames/vitals/VitalsFrame";
import {
  SHIELD_PATH,
  SHIELD_RIVETS,
  SHIELD_VIEW_BOX,
} from "@/components/frames/vitals/ShieldArt";
import {
  HEART_PATH,
  HEART_VIEW_BOX,
} from "@/components/frames/vitals/HeartArt";
import { BOOK_PATH, BOOK_VIEW_BOX } from "@/components/frames/vitals/BookArt";
import {
  CHEVRON_PATH,
  CHEVRON_VIEW_BOX,
} from "@/components/frames/vitals/ChevronArt";
import {
  HEXAGON_PATH,
  HEXAGON_VIEW_BOX,
} from "@/components/frames/vitals/HexagonArt";
import { ORB_PATH, ORB_VIEW_BOX } from "@/components/frames/vitals/OrbArt";
import {
  CIRCLE_PATH,
  CIRCLE_VIEW_BOX,
} from "@/components/frames/vitals/CircleArt";
import {
  SQUARE_PATH,
  SQUARE_VIEW_BOX,
} from "@/components/frames/vitals/SquareArt";

interface VitalProps {
  width: number;
  height: number;
  value?: React.ReactNode;
  label?: string;
  /** Gap between the label and the frame's bottom edge — overrides
   *  VitalsFrame's generic default for this one instance. */
  labelInset?: number;
  sidePadding?: number;
  maxValueSize?: number;
  /** Border stroke widths and rivet size — all constant rendered pixels
   *  regardless of how big or small this instance's silhouette ends up.
   *  Override per instance same as any other layout knob here. */
  outerW?: number;
  bandW?: number;
  gapW?: number;
  rivetR?: number;
}

/** AC — e.g. "18" over "AC". */
export function Shield({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={SHIELD_PATH}
      viewBox={SHIELD_VIEW_BOX}
      rivets={SHIELD_RIVETS}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Max HP — e.g. "52" over "HP". */
export function Heart({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={HEART_PATH}
      viewBox={HEART_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Spell Save DC — e.g. "14" over "DC". */
export function Book({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={BOOK_PATH}
      viewBox={BOOK_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Speed — e.g. "30" over "Speed". */
export function Chevron({
  width,
  height,
  value,
  label,
  ...layout
}: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={CHEVRON_PATH}
      viewBox={CHEVRON_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Passive Perception — e.g. "15" over "PP". */
export function Hexagon({
  width,
  height,
  value,
  label,
  ...layout
}: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={HEXAGON_PATH}
      viewBox={HEXAGON_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Passive Insight — e.g. "13" over "Insight". */
export function Orb({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={ORB_PATH}
      viewBox={ORB_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Plain circle — no fixed stat, for whatever a caller wants a neutral
 *  badge for. */
export function Circle({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={CIRCLE_PATH}
      viewBox={CIRCLE_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}

/** Plain square — no fixed stat, for whatever a caller wants a neutral
 *  badge for. */
export function Square({ width, height, value, label, ...layout }: VitalProps) {
  return (
    <VitalsFrame
      width={width}
      height={height}
      path={SQUARE_PATH}
      viewBox={SQUARE_VIEW_BOX}
      value={value}
      label={label}
      {...layout}
    />
  );
}
