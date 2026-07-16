// Shield/Heart/SaveBox/Chevron/Hexagon/Orb — each just forwards its own
// shape data to VitalsFrame, plus whatever layout knobs the caller passes
// through unchanged. None of them hardcodes tuning for its own shape —
// e.g. the Heart's narrower base doesn't get special-cased padding here;
// if a particular value/label overflows a particular shape, the caller
// renders that instance with its own `labelInset`/`sidePadding`/
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
import {
  SAVE_BOX_PATH,
  SAVE_BOX_VIEW_BOX,
} from "@/components/frames/vitals/SaveBoxArt";
import {
  CHEVRON_PATH,
  CHEVRON_VIEW_BOX,
} from "@/components/frames/vitals/ChevronArt";
import {
  HEXAGON_PATH,
  HEXAGON_RIVETS,
  HEXAGON_VIEW_BOX,
} from "@/components/frames/vitals/HexagonArt";
import { ORB_PATH, ORB_VIEW_BOX } from "@/components/frames/vitals/OrbArt";

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
export function SaveBox({
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
      path={SAVE_BOX_PATH}
      viewBox={SAVE_BOX_VIEW_BOX}
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
      rivets={HEXAGON_RIVETS}
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
