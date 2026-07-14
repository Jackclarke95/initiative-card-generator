// Card frames built from the official Roll20 D&D 5e sheet assets
// (github.com/Roll20/roll20-character-sheets, DD5thEditionLegacy/images/licensedsheet).
// Line frames are 9-slice stretched via stretchPath so corners keep their
// size and only the straight runs grow; decorative art (AC shield, scroll)
// scales via its viewBox instead.
//
// NOTE: these are Wizards of the Coast licensed-sheet assets — fine for a
// personal print tool, not for public distribution.

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { stretchPath } from "@/components/svgNineSlice";
import { FrameText, INK, LABEL_GREY, PALE_GREY } from "@/components/FrameText";
import { IconFrame } from "@/components/IconFrame";
import { PARTY_SCROLL, PARTY_SCROLL_INK } from "@/components/PartyScrollArt";
import { SPELL_SCROLL_OPS } from "@/components/SpellScrollArt";
import type {
  DamageDisplayMode,
  DamageTypeKey,
  ResistanceState,
  ScrollStyle,
} from "@/types/card";
import {
  GiAcid,
  GiBroadsword,
  GiDeathSkull,
  GiEnlightenment,
  GiFlame,
  GiPocketBow,
  GiPowerLightning,
  GiPsychicWaves,
  GiRollingEnergy,
  GiSnake,
  GiSnowflake1,
  GiSonicBoom,
  GiThorHammer,
} from "react-icons/gi";

interface FrameProps {
  width: number;
  height: number;
}

function Svg({
  width,
  height,
  children,
}: FrameProps & { children: React.ReactNode }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </svg>
  );
}

// ── 5eBorder.svg (185 × 199.07) — the classic sheet page border ───────

const BORDER_5E =
  "M176.87,197.82h-2.25a21.19,21.19,0,0,0,4.12-3.23,21.59,21.59,0,0,0,2.51-3.1v2.59c-1.1.41-3.9,1.65-4.38,3.74M3.75,194.08v-2.59a21.59,21.59,0,0,0,2.51,3.1,21.19,21.19,0,0,0,4.12,3.23H8.13c-.48-2.09-3.28-3.33-4.38-3.74M1,178.6a2.71,2.71,0,0,0,1.21-.94,4.78,4.78,0,0,0,.29-.44v9.64A24.07,24.07,0,0,1,1,178.6M8.13,1.25h2.51C7.37,3,5,6.4,3.75,8.63V5c1.1-.41,3.9-1.65,4.38-3.74M181.25,5V8.63C180,6.4,177.63,3,174.36,1.25h2.51c.48,2.09,3.28,3.33,4.38,3.74m0,179.7a88.36,88.36,0,0,1-.85-11.46V9.2c.4.69.68,1.25.85,1.6Zm-177.5,3.5a97.39,97.39,0,0,0,1.34-15V8.35C6.75,5.68,9.69,2,13.58,1.25H171.42c3.88.72,6.83,4.44,8.48,7.11V173.23a97.52,97.52,0,0,0,1.35,15v1.37a19.92,19.92,0,0,1-3.19,4.29,19.08,19.08,0,0,1-5.6,4H12.54a19.84,19.84,0,0,1-8.79-8.27Zm0-177.4c.16-.34.45-.9.84-1.6v164a88.22,88.22,0,0,1-.84,11.46Zm179,166.87a2.75,2.75,0,0,0,1.2.94,24,24,0,0,1-1.49,8.25v-9.63a4.78,4.78,0,0,0,.29.44m2.21.54,0-.47-.47,0s-1.56-.16-2-4V4.09L182.06,4c-1.12-.35-4-1.63-4-3.32V0H7V.63c0,1.69-2.89,3-4,3.32l-.44.14v169.6c-.45,3.85-2,4-2,4H0v.5a24.29,24.29,0,0,0,2.5,11.15V195l.44.14c1.12.35,4,1.62,4,3.32v.63h171.1v-.63c0-1.7,2.89-3,4-3.32l.44-.14v-5.63A24.42,24.42,0,0,0,185,178.2";

export function PlayerFrame({ width, height }: FrameProps) {
  return (
    <Svg width={width} height={height}>
      <path
        d={stretchPath(BORDER_5E, { origW: 185, origH: 200, width, height })}
        fill={INK}
      />
    </Svg>
  );
}

// ── vital-box.svg (52.24 × 49.28) — chamfered double-line stat box ────

const VITAL_BOX =
  "M46.66,47.9H44A11.38,11.38,0,0,0,49,43.65h0v-.07a15.85,15.85,0,0,0,1.79-3.76V43.7ZM1.38,43.7V39.82a15.85,15.85,0,0,0,1.79,3.76v.07h.05A11.38,11.38,0,0,0,8.29,47.9H5.58ZM5.58,1.38H8.29A11.31,11.31,0,0,0,3.22,5.63H3.17V5.7A15.85,15.85,0,0,0,1.38,9.46V5.58ZM49.07,6.84c.16.3.34.58.49.9a17.39,17.39,0,0,1,1.3,3.94V37.55a17.37,17.37,0,0,1-1.79,4.87ZM1.38,11.73A17.37,17.37,0,0,1,3.17,6.86V42.44c-.16-.3-.34-.58-.49-.9a17.55,17.55,0,0,1-1.3-3.94ZM42,47.9H10.2a10.53,10.53,0,0,1-6.28-4.28V5.68a10.68,10.68,0,0,1,6.31-4.3H42a10.59,10.59,0,0,1,6.28,4.27v38A10.68,10.68,0,0,1,42,47.9M50.86,5.58V9.46A15.85,15.85,0,0,0,49.07,5.7V5.63h0A11.31,11.31,0,0,0,44,1.38h2.71ZM47.23,0H5L0,5V44.27l5,5H47.23l5-5V5Z";

export function VitalBoxFrame({ width, height }: FrameProps) {
  return (
    <Svg width={width} height={height}>
      <path
        d={stretchPath(VITAL_BOX, {
          origW: 52.24,
          origH: 49.28,
          width,
          height,
        })}
        fill={INK}
      />
    </Svg>
  );
}

/** VitalBoxFrame with a value + label — e.g. "10" over "Max HP", or the
 *  reverse when `labelPosition` is "top". `proficiency`, when supplied,
 *  reserves a strip pinned to the box's bottom edge for a dot — hollow
 *  when false, filled when true — regardless of labelPosition; the
 *  label/value pair then lays out in whatever height is left above it,
 *  so the value centers in that remaining space when there's no label. */
export function VitalBox({
  width,
  height,
  value,
  label,
  labelPosition = "bottom",
  proficiency,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  labelPosition?: "top" | "bottom";
  proficiency?: boolean;
}) {
  // Fixed rather than proportional to height, so the dot reads as the same
  // size in the compact (shorter) and labeled (taller) StatBox variants.
  const dotR = 2.6;
  // Asymmetric padding around the dot within its reserved strip — a wider
  // gap below than above lifts it off the box's bottom edge a little.
  const dotTopGap = 2;
  const dotBottomGap = 4;
  const dotZoneH =
    proficiency !== undefined ? dotR * 2 + dotTopGap + dotBottomGap : 0;
  const dotCy = dotTopGap + dotR;
  const textAreaH = height - dotZoneH;
  // The compact variant (no label, but a proficiency dot reserving space
  // below) wants its value nudged down slightly to visually center in what's
  // left above the dot; the labeled variant wants it nudged up about twice
  // as far the other way. With neither label nor dot, the value already has
  // the full box to itself, so no nudge is needed.
  const valueMarginTop = label ? -2 : proficiency !== undefined ? 2 : 0;
  return (
    <div style={{ position: "relative", width, height }}>
      <VitalBoxFrame width={width} height={height} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: textAreaH,
        }}
      >
        <FrameText
          width={width}
          height={textAreaH}
          value={value}
          label={label}
          labelPosition={labelPosition}
          maxValueSize={26}
          valueMarginTop={valueMarginTop}
        />
      </div>
      {proficiency !== undefined && (
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
      )}
    </div>
  );
}

export const StatBox = ({
  label,
  value,
  proficiency,
  showLabel = true,
}: {
  label: string;
  value?: React.ReactNode;
  proficiency: boolean;
  /** Drops the label and shrinks the box down to just the value + proficiency
   *  dot — the ability scores row's "Compact" display mode. */
  showLabel?: boolean;
}) => (
  <VitalBox
    label={showLabel ? label : undefined}
    value={value}
    width={30}
    height={showLabel ? 36 : 26}
    proficiency={proficiency}
    labelPosition="top"
  />
); // alias for InitiativeCard.tsx usage

export const DAMAGE_TYPE_REACT_ICONS: Record<DamageTypeKey, IconType> = {
  bludgeoning: GiThorHammer,
  piercing: GiPocketBow,
  slashing: GiBroadsword,
  acid: GiAcid,
  cold: GiSnowflake1,
  fire: GiFlame,
  force: GiRollingEnergy,
  lightning: GiPowerLightning,
  necrotic: GiDeathSkull,
  poison: GiSnake,
  psychic: GiPsychicWaves,
  radiant: GiEnlightenment,
  thunder: GiSonicBoom,
};

// ── Damage type badge — icon, 2-letter code, resistance/immunity mark ──
// Every damage type gets a same-size ring so the row never jitters; only
// its color and fill escalate: grey hollow ring (neither), black
// ring+dot (resistant), fully filled circle (immune) — chosen over a
// half-filled "gauge" variant because a centered dot and a full fill are
// both easy pen/pencil marks on a printed blank card, where someone may
// hand-fill this in rather than it always being generated digitally.
export function DamageTypeBadge({
  label,
  damageType,
  state,
  displayMode = "all",
}: {
  label: string;
  damageType: DamageTypeKey;
  state: ResistanceState;
  displayMode?: DamageDisplayMode;
}) {
  const color = state === "neither" ? PALE_GREY : INK;
  const r = 2.6;
  const cx = r + 1;
  const cy = r + 1;
  const size = r * 2 + 2;
  const ReactIcon = DAMAGE_TYPE_REACT_ICONS[damageType];

  return (
    <div
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        width: 14,
        flexShrink: 0,
      }}
    >
      {(displayMode === "all" || displayMode === "icon") && (
        <ReactIcon size={12} style={{ color: INK, flexShrink: 0 }} />
      )}
      {(displayMode === "all" || displayMode === "initials") && (
        <span
          style={{
            fontSize: 7,
            fontWeight: 600,
            lineHeight: 1,
            color: INK,
            textAlign: "center",
          }}
        >
          {label.slice(0, 2)}
        </span>
      )}
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {state === "immune" ? (
          // Matches the ring's outer edge (r + half its stroke width),
          // so the filled dot reads as the same overall size as the ring
          // rather than looking smaller than it.
          <circle cx={cx} cy={cy} r={r + 0.5} fill={color} />
        ) : (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />
            {state === "resistant" && (
              <circle cx={cx} cy={cy} r={r * 0.5} fill={color} />
            )}
          </>
        )}
      </svg>
    </div>
  );
}

// ── CharBox.svg (319.34 × 79.51) — bracketed name box ─────────────────

const CHARBOX = {
  rect: "M2.72,9.44 H316.61 V70.08 H2.72 Z",
  swash:
    "M24.62,70.08a103.81,103.81,0,0,1,17.21-1.92H277.51a103.81,103.81,0,0,1,17.21,1.92m0-60.64a104.88,104.88,0,0,1-17.21,1.92H41.83A104.88,104.88,0,0,1,24.62,9.44",
  bracketL:
    "M.63,3.13V76.39a11.66,11.66,0,0,1,2.09-3.57V6.69A11.5,11.5,0,0,1,.63,3.13Z",
  flourishL:
    "M2.72,62.19s1.07,10.33,8.4,10.33h22s7.17-2.44,20.5-2.44M2.72,17.32S3.79,7,11.12,7h22s7.17,2.45,20.5,2.45",
  bracketR:
    "M318.72,3.13V76.39a11.78,11.78,0,0,0-2.1-3.57V6.69A11.61,11.61,0,0,0,318.72,3.13Z",
  flourishR:
    "M316.62,62.19s-1.07,10.33-8.4,10.33h-22s-7.17-2.44-20.5-2.44m50.9-52.76S315.55,7,308.22,7h-22s-7.17,2.45-20.5,2.45",
};

export function CharBoxFrame({
  width,
  height,
  simple,
}: FrameProps & { simple?: boolean }) {
  const o = { origW: 319.34, origH: 79.51, width, height, scale: 0.45 };
  return (
    <Svg width={width} height={height}>
      {/* White background fill matches the source SVG (cls-1 rect) */}
      <path
        d={stretchPath(CHARBOX.rect, o)}
        fill="#fff"
        stroke={INK}
        strokeWidth={1.25}
      />
      <path d={stretchPath(CHARBOX.swash, o)} stroke={INK} strokeWidth={0.75} />
      {!simple && (
        <>
          {/* Brackets: white fill first (background), then stroke outline */}
          <path
            d={stretchPath(CHARBOX.bracketL, o)}
            fill="#fff"
            stroke={INK}
            strokeWidth={1.25}
          />
          <path
            d={stretchPath(CHARBOX.flourishL, o)}
            stroke={INK}
            strokeWidth={1.25}
          />
          <path
            d={stretchPath(CHARBOX.bracketR, o)}
            fill="#fff"
            stroke={INK}
            strokeWidth={1.25}
          />
          <path
            d={stretchPath(CHARBOX.flourishR, o)}
            stroke={INK}
            strokeWidth={1.25}
          />
        </>
      )}
    </Svg>
  );
}

/** CharBoxFrame with a value + label overlay — a horizontal text label box.
 *  Use `simple` to omit the bracket-and-flourish end decorations. */
export function CharBox({
  width,
  height,
  value,
  label,
  simple,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  simple?: boolean;
}) {
  // The bracket flourishes extend ~54/319 of width in from each edge.
  const sidePad = simple ? 8 : Math.round((54 / 319.34) * width);
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <CharBoxFrame width={width} height={height} simple={simple} />
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        bottomInset={4}
        sidePadding={sidePad}
        maxValueSize={16}
      />
    </div>
  );
}

// ── proficency-bonus.svg (113.65 × 34.58) — filled circle + banner ────
// Dark-filled shape: circle on the left holds the bonus value; rectangular
// banner extends right. Text must be white to read against the dark fill.

const PROF_BONUS_PATH =
  "M19,5.55a11.92,11.92,0,0,0,3.6,2.18,11.69,11.69,0,0,0,4.5.73,14,14,0,0,1,0,17.66,11.89,11.89,0,0,0-4.5.73A12.13,12.13,0,0,0,19,29a26.35,26.35,0,0,1-7.81,1.43,14.05,14.05,0,0,1,0-26.34A26.68,26.68,0,0,1,19,5.55m15.54.89h67.6c2.4.9,8.7,3.57,10.17,7.39v6.94c-1.47,3.83-7.77,6.5-10.17,7.39H34.5a20.39,20.39,0,0,0-5.13-1.78,16,16,0,0,0,0-18.16A20,20,0,0,0,34.5,6.44M28,6.43h4.73a17.26,17.26,0,0,1-3.81,1.1c-.29-.38-.6-.74-.92-1.1m80.48,0a15.08,15.08,0,0,0,3.84,4.3v1.49c-1.81-2.7-5.55-4.67-8.14-5.79Zm3.84,17.42a15.22,15.22,0,0,0-3.84,4.3h-4.3c2.59-1.11,6.33-3.09,8.14-5.78ZM28,28.15c.32-.35.63-.72.92-1.1a17.82,17.82,0,0,1,3.81,1.1ZM15.42,0a.39.39,0,0,0-.21.49s.14.31.34.7a16,16,0,0,0-6.4,1.57,26.69,26.69,0,0,1,7.58.5h.12q.22.3.48.6c-12.74-3-16,3.45-16,3.45a11.34,11.34,0,0,1,3.8-2.53c.42-.12.84-.21,1.26-.3a16.05,16.05,0,0,0,0,25.56c-.42-.08-.84-.18-1.26-.29a11.23,11.23,0,0,1-3.8-2.54s3.31,6.43,16,3.45l-.48.61h-.12a27,27,0,0,1-7.58.49,16,16,0,0,0,6.4,1.57c-.2.4-.32.66-.34.71a.38.38,0,1,0,.7.28s3-5.72,6.93-6.8a15.14,15.14,0,0,1,3.57-.68,14,14,0,0,1-7.8,4.28,4.35,4.35,0,0,0-1.31,2.19,16,16,0,0,0,6.3-1.81l2.15-1.38c.26-.2.52-.41.77-.63h82.69l.19-.33c.58-1,2.39-3.62,3.85-4.31l.4-.18V9.89l-.4-.19C111.79,9,110,6.36,109.4,5.4l-.19-.34H26.52c-.25-.22-.51-.43-.77-.63L23.6,3.06a16,16,0,0,0-6.3-1.82,4.27,4.27,0,0,0,1.31,2.19,14.1,14.1,0,0,1,7.8,4.28A14.65,14.65,0,0,1,22.84,7C18.92,6,15.91.25,15.91.23a.37.37,0,0,0-.49-.2";

export function ProfBonusFrame({ width, height }: FrameProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 113.65 34.58"
      style={{ position: "absolute", inset: 0 }}
    >
      <path d={PROF_BONUS_PATH} fill={INK} />
    </svg>
  );
}

/** ProfBonusFrame with the bonus value in the left circle and a label in the
 *  right banner. Both are white — the frame fill is dark. */
export function ProfBonus({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  // Circle occupies the left ~30% of the artwork; banner takes the rest.
  const circleW = Math.round((34.5 / 113.65) * width);
  const bannerW = width - circleW;
  const valueFontSize = Math.min(Math.round(height * 0.5), 18);
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <ProfBonusFrame width={width} height={height} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: circleW,
          height: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value !== undefined && value !== null && value !== "" && (
          <span
            style={{
              fontWeight: 800,
              fontSize: valueFontSize,
              lineHeight: 1,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        )}
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            left: circleW,
            top: 0,
            width: bannerW,
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 6.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── SpellHeadBlock.svg (75.59 × 33.92) — hex-ended banner ─────────────

const SPELLHEAD = {
  outline:
    "M68.56,0.69 L7.03,0.69 L0.69,8.66 L0.69,25.26 L7.02,33.24 L68.56,33.24 L74.9,25.26 L74.9,8.66 Z",
  thinL: "M9.31.69,2.6,9m0,15.92,6.71,8.32M2.6,6.26V28",
  thinR: "M66.27.69,73,9m0,15.92-6.72,8.32M73,6.26V28",
  dotL: "M1.65,17a1,1,0,0,0,1.9,0,.95.95,0,0,0-1.9,0",
  dotR: "M73.94,17A.95.95,0,1,1,73,16a.95.95,0,0,1,1,.95",
};

export function SpellHeadFrame({ width, height }: FrameProps) {
  const o = { origW: 75.59, origH: 33.92, width, height };
  return (
    <Svg width={width} height={height}>
      <path
        d={stretchPath(SPELLHEAD.outline, o)}
        stroke={INK}
        strokeWidth={1.3}
      />
      <path
        d={stretchPath(SPELLHEAD.thinL, o)}
        stroke={INK}
        strokeWidth={0.6}
      />
      <path
        d={stretchPath(SPELLHEAD.thinR, o)}
        stroke={INK}
        strokeWidth={0.6}
      />
      <path d={stretchPath(SPELLHEAD.dotL, o)} fill={INK} />
      <path d={stretchPath(SPELLHEAD.dotR, o)} fill={INK} />
    </Svg>
  );
}

/** SpellHeadFrame with value + label. */
export function SpellHead({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <SpellHeadFrame width={width} height={height} />
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        maxValueSize={22}
      />
    </div>
  );
}
// ── Shield (AC) — IconFrame rebuild of the official AC.svg ─────────
// Single silhouette traced from the original asset's outermost contour
// on its 48 × 55.08 canvas; the banded borders and studs the original
// baked into nested contours now come from the IconFrame construction.
// Scaled down 5.6% vertically about the viewBox centre so its rendered
// height matches the Heart/Save frames, which fill less of their own
// (shorter) viewBox.
const SHIELD_SHAPE =
  "M24,1.54L6.62,6.56C6.62,6.64,5.91,14.29,0.62,15.3L0,15.42V27.61C0.08,27.97,5.86,48.97,24,53.46C42.14,48.97,47.92,27.97,48,27.61V15.42L47.38,15.3C42.09,14.29,41.38,6.64,41.38,6.56Z";

// Centre-relative positions of the original asset's four studs: below
// the peak, the two waist corners, and the bottom tip.
const SHIELD_RIVETS = [
  { x: 0, y: -22.66 },
  { x: 20.5, y: -9.91 },
  { x: 0, y: 22.66 },
  { x: -20.5, y: -9.91 },
];

/** Shield-shaped stat frame with value + label, e.g. "18" over "AC". Pass
 *  `showLabel={false}` to drop the label — the vitals block's "Compact"
 *  display mode. */
export function Shield({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={SHIELD_SHAPE}
      viewBox="-1 -1 50 57.08"
      rivets={SHIELD_RIVETS}
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── Heart (Max HP) — companion piece to the AC shield ─────────────────
// A IconFrame (see IconFrame.tsx): silhouette drawn 1.2× wider
// than the AC shield's 48-unit canvas (x-coords scaled about the
// centreline), on a 57.6 × 55.08 viewBox.
const HEART_SHAPE =
  "M28.8,8.1C25.92,4.6,21.48,2.4,16.92,2.4C8.76,2.4,2.4,9,2.4,17.4C2.4,27.7,11.28,36.1,24.84,48.8L28.8,52.5L32.76,48.8C46.32,36.1,55.2,27.7,55.2,17.4C55.2,9,48.84,2.4,40.68,2.4C36.12,2.4,31.68,4.6,28.8,8.1Z";

/** Heart-shaped stat frame with value + label, e.g. "52" over "HP". Pass
 *  `showLabel={false}` to drop the label — the vitals block's "Compact"
 *  display mode. */
export function Heart({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={HEART_SHAPE}
      viewBox="0 0 57.6 55.08"
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── Save box — an open book ────────────────────────────────────────────
// Two page spreads meeting at a spine dip top-centre and bottom-centre;
// both page edges bow upward, the bottom edge parallel to the top.
// Drawn on the same 57.6 × 55.08 canvas as the heart, with matching top
// and bottom extremes (2.4 / 52.5) and a shallower spine dip — taller
// straight sides, gentler curve — than the original.
const SAVE_SHAPE =
  "M28.8,7.4C21.6,3.23,12.8,1.4,4,2.4L4,47.5C12.8,46.5,21.6,48.33,28.8,52.5C36,48.33,44.8,46.5,53.6,47.5L53.6,2.4C44.8,1.4,36,3.23,28.8,7.4Z";

/** Save-DC stat frame with value + label, e.g. "14" over "Save". Pass
 *  `showLabel={false}` to drop the label — the vitals block's "Compact"
 *  display mode. */
export function SaveBox({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={SAVE_SHAPE}
      viewBox="0 0 57.6 55.08"
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── Chevron (Speed) — a box with a protruding tip and a matching notch ──
// A single thick chevron ribbon: flat top and bottom, a triangular point
// sticking out on the right, and a matching triangular notch cut into
// the left — same (shallow) depth on both ends, filling almost the full
// canvas so the points stay gentle and the flat middle stays roomy for
// the value.
const CHEVRON_SHAPE = "M2.2,2L45.1,2L52.8,24L45.1,46L2.2,46L9.9,24Z";

/** Chevron stat frame with value + label, e.g. "30" over "Speed". Pass
 *  `showLabel={false}` to drop the label — the vitals block's "Compact"
 *  display mode. */
export function Chevron({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={CHEVRON_SHAPE}
      viewBox="0 0 55 48"
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── Hexagon (Passive Perception) ───────────────────────────────────────
// A regular hexagon at radius 26, standing on two of its points — like
// feet — with a flat edge between them (mirrored at the top too, a
// consequence of the 6-fold symmetry), rather than balancing on a single
// point. Vertices sit at the same six positions the icon's previous
// six-pointed star used for its outer points.
const HEXAGON_SHAPE =
  "M41.4,2.4L54.4,24.92L41.4,47.43L15.4,47.43L2.4,24.92L15.4,2.4Z";

// Centre-relative positions of the six vertices, pulled in from the tip
// (radius 26) to radius 22.66 — the same 3.34-unit inset the Shield uses
// to land its studs on the inner border ring rather than the edge.
const HEXAGON_RIVETS = [
  { x: 11, y: -19 },
  { x: 22, y: 0 },
  { x: 11, y: 19 },
  { x: -11, y: 19 },
  { x: -22, y: 0 },
  { x: -11, y: -19 },
];

/** Hexagon stat frame with value + label, e.g. "15" over "Perception".
 *  Cropped tight to the shape's own bounds (plus the usual 2.4-unit
 *  margin) rather than the shared canvas, so the container's aspect
 *  ratio matches what's actually drawn (see the Orb's note on this). */
export function Hexagon({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={HEXAGON_SHAPE}
      viewBox="0 0 56.8 49.83"
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── Orb (Passive Insight) — a scrying orb mounted on a stand ──────────
// Just two pieces: a true circle (the orb — radius stays circular, never
// stretched) sitting directly on a trapezium (the stand), meeting at the
// circle's widest point (its equator) so the trapezium's top edge is the
// full-diameter chord — the widest a plain circle+trapezium join can be —
// then tapering straight down to a flat foot. Flat foot (not a point)
// leaves room for a longer label than a sharp tip would.
const ORB_SHAPE = "M3.8,27A25,25,0,1,1,53.8,27L42.8,52L14.8,52Z";

/** Orb-on-a-stand stat frame with value + label, e.g. "13" over "Insight".
 *  Cropped tight to the shape's own bounds (see the Eye's note above) so
 *  its narrow container isn't letterboxed against the shared canvas. */
export function Orb({
  width,
  height,
  value,
  label,
  showLabel = true,
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <IconFrame
      width={width}
      height={height}
      path={ORB_SHAPE}
      viewBox="1.4 -0.4 54.8 54.8"
      value={value}
      label={label}
      showLabel={showLabel}
    />
  );
}

// ── CharScroll.svg — scroll banner, with/without the dragon ───────────
// Grey background polygons and the "Dungeons & Dragons" lettering are
// excluded. Art box: x 21..254 of the original; dragon extends to y 0.

const SCROLL = {
  rollWhite: "M21.85,45.73 L21.85,83.23 L57.35,78.59 L57.35,41.09 Z",
  rollThin: "M22.63,48.24l34.72-4.42M22.63,80.45l34.72-4.93",
  rollGrey: "M57.35,41.09 L33.13,37.51 L33.13,75.01 L57.35,78.59 Z",
  body: "M252.17,75c-61.75,11.25-157.29-11.25-219,0V37.51c61.75-11.25,157.29,11.25,219,0Z",
  bodyThin:
    "M252.17,40.43s-19.87,8-114-.29c-66.51-5.89-99.72-.73-104.85.17M253.05,71.39s-20.5,8.66-114.67.33c-66.51-5.89-99.72-.73-104.85.17",
  // Midline between the two bodyThin pinstripes, running left-to-right (the
  // pinstripes themselves run right-to-left, which would read backwards) —
  // used as the path the name text follows, so it rides the scroll's own wave.
  nameCurve:
    "M33.32,55.81C38.45,54.91,71.66,49.75,138.17,55.64C232.30,63.93,252.17,55.93,252.17,55.93",
  // The same curve, re-subdivided to start just clear of the dragon's head
  // (solid ink up to local x~106). It still runs across the breath/smoke
  // wisp (SCROLL.dragon[1], x~192-246) further along — the text's white
  // halo (see NameScroll) keeps it legible there instead of trimming the
  // curve down to a sliver between the two and cramping the font size.
  dragon: [
    "M78.5,5a22.83,22.83,0,0,0,.22,6.34,50.35,50.35,0,0,0-4.29-2.77,10,10,0,0,1-3.16-3.65c-.48-.85-.76-1.48-.76-1.48a6.6,6.6,0,0,0-1.1,7.27,14.23,14.23,0,0,0-7.88.19c9.18,6,4.3,6.5-1,9s-5.68,5.63-5.68,5.63c6.33-2.08,8.85.58,8.85.58-3.41,3.26-.37,8.35-.37,8.35,3.31,6.34,11.51,9,18.85,10.15a70.1,70.1,0,0,0,13.7.67l-16.72,5.2-15,3.79S49.23,52.65,43.75,40s4.09-22.57,3.13-23.22-2.07.76-2.19.91c4.16-11.91,16.69-11.78,17.19-13s-2.47-1.35-2.47-1.35C72.08-.84,78.5,5,78.5,5",
    "M247.47,80c-.64-3.47-3.09-9.12-7.83-12.11-3.92-2.46-7.34-1.92-7.35-3.15,0-1.55,4.36-1.07,4.36-1.07-4.74-2.71-11.53.61-12.5-.94-.57-.94,3.16-2.24,3.16-2.24-5.77-.21-12.59,2.76-15.32,5.46,6.89-2.31,16.59-1,21,2.83a20.56,20.56,0,0,0-6-2.19c-7.82-1.57-16.52.76-21.76,2.94a51.1,51.1,0,0,0-10.43,5c-3.9,2.27-11.11,4.38-16,2.31h0s7.65,12.75,17.06,8.32c.69-.39,1.35-.78,2-1.17a64.25,64.25,0,0,0,10.31-7.43,52.33,52.33,0,0,1,14-6.88,10.44,10.44,0,0,1,4.42-.33c3.72.51,7,2.89,8,5.74,2.87-.5,10.14,1.9,12.88,4.94",
    "M84.53,34.28c-.79-4.26-6.67-5-9.7-3a11.7,11.7,0,0,1,6.28-6.19,31.28,31.28,0,0,0-4.48-1.29c1.94-1.48,6.71-2.6,9.13-2.39a9.61,9.61,0,0,0-1.44-.3l.46-2.77c-.27-2.32-2.37-5-4.87-6.58-1.24-3.55,0-10,1.68-11.73C80.73,9.29,93.85,15,96.4,21.88,95,16,88.89,12.17,86.05,8.61a9.44,9.44,0,0,1,1.06-7.52C86.61,7.32,93.19,12.4,96.68,16c4.12,4.23,5.21,7.9,4.54,10.85a2.52,2.52,0,0,1,1.91,2.74,5.16,5.16,0,0,0,3.15-2.73c.53,4.66-2.35,9.47-5.44,10.84a4.25,4.25,0,0,0-.46-3.92c-1.32-1.71-5.21-1.85-6.53-1.8,0,0,1.69-2.34,1.08-3.57-.74-1.53-8.38-1.1-11.83,0a14.72,14.72,0,0,1,4.85.73c-.56.78-2.06,4.09-1.08,5.13.83.89,2-.43,2.15-.6-.11.32-1.26,3.66-.47,4.5s2.67.33,2.67.33C90,41.37,85.5,43.22,82.4,43.12a6.56,6.56,0,0,0,3.32-3.4,8.67,8.67,0,0,1-3.76.37c1-.38,3.1-2.89,2.57-5.81m10.92-8.8a7.63,7.63,0,0,0-4.29-4.66c.6,2.38,1.44,4.58,4.29,4.66",
    "M68.17,16.82c.51-1.8-3-5-4.31-5.63a20.64,20.64,0,0,1,7.37,1A8.68,8.68,0,0,1,70.48,5c2.49,6.53,12.08,7.87,14.3,13.3l-.46,2.77c-3.79-.49-9.38.64-12.2,3.77a22.42,22.42,0,0,1,4.49.93c-4.27.64-10.15,4.4-11.91,6.21.52-2.44,1.27-4.49.74-6-.75-2.1-3.25-3.06-8.3-2.17,3.49-3.29,10.5-5.18,11-7",
    "M40.14,33.34l1,2.22c-1.37.23-2.91,5.64-2.91,5.64-3.49-2-.55-8.48-.55-8.48Z",
    "M32.52,32.42a12.49,12.49,0,0,1,2.78-1.55l1.59,1.41-.82.25s-1.53,5-.91,7.07l1,2.9s-3.26-.65-3.76-1.9c0,0-1-5.63.12-8.18",
    "M30.68,34.54s.21,6.42.87,7l2.42,1L34,44.75s-4.32-1.37-4.68-3S28.72,36,28.72,36a4,4,0,0,1,2-1.44",
  ],
  dragonEye:
    "M91.16,20.82a7.63,7.63,0,0,1,4.29,4.66c-2.85-.08-3.69-2.28-4.29-4.66",
};

/** Scroll aspect helper: each variant crops its own source box — the
 *  plain ribbon is tightly cropped to just the body (no dragon head
 *  space above), while the dragon and party variants need the extra
 *  headroom above the ribbon for their own artwork. Callers must size
 *  the rendered banner to whichever box matches the variant in play
 *  (see scrollBox below) — mismatching them stretches the art, since
 *  the SVG's preserveAspectRatio="none" fills whatever box it's given. */
export const SCROLL_BOX = { x: 21, y: 30, w: 235, h: 55 };
export const DRAGON_SCROLL_BOX = { x: 21, y: -3, w: 235, h: 90 };
export const PARTY_SCROLL_BOX = { x: 21, y: -4, w: 235, h: 90 };
export const SPELL_SCROLL_BOX = { x: 21, y: -2.5, w: 235, h: 90 };

/** The crop box every scroll variant renders its viewBox from — callers
 *  (e.g. CardFaces, sizing the banner from its own aspect ratio) key off
 *  this rather than duplicating the box lookup. */
export function scrollBox(variant: ScrollStyle) {
  switch (variant) {
    case "dragon":
      return DRAGON_SCROLL_BOX;
    case "party":
      return PARTY_SCROLL_BOX;
    case "spell":
      return SPELL_SCROLL_BOX;
    default:
      return SCROLL_BOX;
  }
}

export function ScrollFrame({
  width,
  height,
  variant = "dragon",
}: FrameProps & { variant?: Exclude<ScrollStyle, "none"> }) {
  const box = scrollBox(variant);
  const line = { stroke: INK, vectorEffect: "non-scaling-stroke" as const };

  if (variant === "spell") {
    return (
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
  }

  if (variant === "party") {
    return (
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
  }

  const dragon = variant === "dragon";
  return (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      {dragon && <path d={SCROLL.dragon[0]} fill={INK} />}
      {/* Depth order: body at the back, grey backing sheet over it, white
          flap in front — keeps the flap's top edge complete with the grey
          wedge peeking out exactly like it does along the bottom. */}
      <path d={SCROLL.rollWhite} fill="#fff" />
      <path d={SCROLL.rollWhite} {...line} strokeWidth={1.38} />
      <path d={SCROLL.rollThin} {...line} strokeWidth={0.75} />
      <path d={SCROLL.rollGrey} fill="#bfc0c3" />
      <path d={SCROLL.rollGrey} {...line} strokeWidth={1.38} />
      <path d={SCROLL.body} fill="#fff" />
      <path d={SCROLL.body} {...line} strokeWidth={1.38} />
      <path d={SCROLL.bodyThin} {...line} strokeWidth={0.75} />
      {dragon &&
        SCROLL.dragon.slice(1).map((d, i) => <path key={i} d={d} fill={INK} />)}
      {dragon && <path d={SCROLL.dragonEye} fill="#fff" />}
    </svg>
  );
}

// Shared text styling for both scroll variants — same anchor, same
// baseline, same fitting formula and size cap, same white halo. Only the
// usable width feeds in differently, from each curve's own measured
// length: nameCurveDragon's ~133-unit run (clear of the dragon's head, but
// still crossing its smoke wisp) versus nameCurve's full ~219-unit run —
// sizing both off one shared width would either shrink the DM side to
// match the tighter player side, or overflow it.
const NAME_CURVE_LENGTH = 219;
const NAME_TEXT_MAX_SIZE = 16;

/** The scroll banner (plain ribbon, dragon-headed, or the more elaborate
 *  party ribbon) with a value that rides the ribbon's own wave, e.g. a
 *  character's name — text styling and centering use the same rule for
 *  every variant, just scaled to that variant's own crop box. The white
 *  halo behind the glyphs (rather than trimming the curve tighter still)
 *  is what keeps the name legible where it crosses the dragon artwork. */
export function NameScroll({
  width,
  height,
  value,
  label,
  variant = "dragon",
}: FrameProps & {
  value?: React.ReactNode;
  label?: string;
  variant?: Exclude<ScrollStyle, "none">;
}) {
  const box = scrollBox(variant);
  const curve = SCROLL.nameCurve;
  const curveLength = NAME_CURVE_LENGTH;
  const pathId = useId();
  const text =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const usableWidth = curveLength * 0.85;
  const fontSize = text
    ? Math.max(
        8,
        Math.min(NAME_TEXT_MAX_SIZE, (usableWidth * 1.5) / text.length),
      )
    : 0;

  return (
    <div
      style={{
        position: "relative",
        width: width,
        height: height,
      }}
    >
      <ScrollFrame width={width} height={height} variant={variant} />
      {text && (
        <svg
          width="100%"
          height="100%"
          viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <path id={pathId} d={curve} />
          </defs>
          {/* The curve is shared across variants, but the party ribbon
              sits ~1 unit higher than the dragon/plain ribbon at the same
              coordinates — nudge the text up to match its own ribbon. */}
          <g
            transform={
              variant === "party"
                ? "translate(0, -1)"
                : variant === "spell"
                  ? "translate(0, 0.5)"
                  : undefined
            }
          >
            <text
              fontWeight="bold"
              fontSize={fontSize}
              fill={INK}
              stroke="#fff"
              strokeWidth={fontSize * 0.12}
              strokeLinejoin="round"
              paintOrder="stroke"
              dominantBaseline="central"
            >
              <textPath
                href={`#${pathId}`}
                startOffset="50%"
                textAnchor="middle"
              >
                {text}
              </textPath>
            </text>
          </g>
        </svg>
      )}
      {label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              paddingBottom: 4,
              fontSize: 6.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: LABEL_GREY,
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Notes box — framed with the same 5eBorder as the player side ──────
// Keeps the DM and player faces visually consistent. PlayerFrame's 9-slice
// stretch needs concrete pixel dimensions, so a ResizeObserver measures
// this box's actual (flex-determined) size on every layout change.

/** A left-aligned block of free text — the DM's notes section — framed
 *  with the player-side border and a caption centered along the bottom
 *  edge, styled like the vital stack's own labels. Has no intrinsic
 *  height of its own; wrap it in a `flex: 1` container to have it eat
 *  whatever space is left at the bottom of the card. */
export function NotesBox({
  value,
  label = "Notes",
  showLabel = true,
}: {
  value?: string;
  label?: string;
  showLabel?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", height: "100%" }}>
      {size.width > 0 && size.height > 0 && (
        <PlayerFrame width={size.width} height={size.height} />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "8px 12px 6px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden" }}>
          {value && (
            <div
              style={{
                fontSize: 8,
                lineHeight: 1.35,
                color: INK,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                textAlign: "left",
              }}
            >
              {value}
            </div>
          )}
        </div>
        {showLabel && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 6.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: LABEL_GREY,
              }}
            >
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
