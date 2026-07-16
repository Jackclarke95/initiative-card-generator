// Ability Scores — STR/DEX/CON/INT/WIS/CHA. A chamfered double-line box
// (9-slice stretched via stretchPath) with the label pinned above the
// value — Ability Scores never puts it below, unlike Vitals or Notes —
// plus a proficiency dot in a strip reserved along the bottom edge,
// independent of whether the label is shown. Passing no `label` both
// hides it and shrinks the box to the "compact" size, so the caller's
// one boolean decides both effects instead of two separate props.

import { stretchPath } from "@/components/svgNineSlice";
import { Frame, INK } from "@/components/frames/Frame";
import {
  VITAL_BOX_ORIG_H,
  VITAL_BOX_ORIG_W,
  VITAL_BOX_PATH,
} from "@/components/frames/ability-scores/VitalBoxArt";

function AbilityScoreBox({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <path
        d={stretchPath(VITAL_BOX_PATH, {
          origW: VITAL_BOX_ORIG_W,
          origH: VITAL_BOX_ORIG_H,
          width,
          height,
        })}
        fill={INK}
      />
    </svg>
  );
}

interface AbilityScoreProps {
  value?: React.ReactNode;
  /** Omit to hide the label and shrink the box down to just the value +
   *  proficiency dot — the ability scores row's "Compact" display mode. */
  label?: string;
  proficiency: boolean;
  sidePadding?: number;
  maxValueSize?: number;
}

export function AbilityScore({
  value,
  label,
  proficiency,
  sidePadding,
  maxValueSize = 26,
}: AbilityScoreProps) {
  // Fixed size, not proportional — so the box reads as the same overall
  // shape in both the labeled and compact variants.
  const width = 30;
  const height = label ? 36 : 26;

  // Fixed rather than proportional to height, so the dot reads as the same
  // size in the compact (shorter) and labeled (taller) variants.
  const dotR = 2.6;
  // Asymmetric padding around the dot within its reserved strip — a wider
  // gap below than above lifts it off the box's bottom edge a little.
  const dotTopGap = 2;
  const dotBottomGap = 4;
  const dotZoneH = dotR * 2 + dotTopGap + dotBottomGap;
  const dotCy = dotTopGap + dotR;
  const textAreaH = height - dotZoneH;
  // The compact variant (no label, but a proficiency dot reserving space
  // below) wants its value nudged down slightly to visually center in what's
  // left above the dot; the labeled variant wants it nudged up about twice
  // as far the other way.
  const valueMarginTop = label ? -2 : 2;

  return (
    <div style={{ position: "relative", width, height }}>
      <AbilityScoreBox width={width} height={height} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: textAreaH,
        }}
      >
        <Frame
          width={width}
          height={textAreaH}
          art={null}
          value={value}
          label={label ? { text: label, position: "top" } : undefined}
          sidePadding={sidePadding}
          maxValueSize={maxValueSize}
          valueMarginTop={valueMarginTop}
        />
      </div>
      <svg
        width={width}
        height={dotZoneH}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        <circle
          cx={width / 2}
          cy={dotCy}
          r={dotR}
          fill="none"
          stroke={INK}
          strokeWidth={1}
        />
        {proficiency && (
          <circle cx={width / 2} cy={dotCy} r={dotR * 0.5} fill={INK} />
        )}
      </svg>
    </div>
  );
}
