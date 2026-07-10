// Card frames built from the official Roll20 D&D 5e sheet assets
// (github.com/Roll20/roll20-character-sheets, DD5thEditionLegacy/images/licensedsheet).
// Line frames are 9-slice stretched via stretchPath so corners keep their
// size and only the straight runs grow; decorative art (AC shield, scroll)
// scales via its viewBox instead.
//
// NOTE: these are Wizards of the Coast licensed-sheet assets — fine for a
// personal print tool, not for public distribution.

import Image from "next/image";
import { stretchPath } from "@/components/svgNineSlice";
import { FrameText, INK, LABEL_GREY } from "@/components/FrameText";
import { RivetedFrame } from "@/components/RivetedFrame";

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
        d={stretchPath(BORDER_5E, { origW: 185, origH: 199.07, width, height })}
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

/** VitalBoxFrame with a value that fills the box and a label pinned to the
 *  bottom edge inside it — e.g. "10" over "Max HP". */
export function VitalBox({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <div style={{ position: "relative", width, height }}>
      <VitalBoxFrame width={width} height={height} />
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        maxValueSize={26}
      />
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
              letterSpacing: "0.2em",
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

// ── AC.svg (48 × 55.08) — the official shield, scales as one piece ────

const AC_PATH =
  "M24.85,50.52A1.1,1.1,0,0,0,24,50.1a1.08,1.08,0,0,0-.84.42C9.86,45.8,4.65,29.32,4,27.14V18.91a1.13,1.13,0,0,0,.71-1.06.76.76,0,0,0,0-.16c3.69-2.43,5.07-7,5.54-9.19L23.14,4.56A1.11,1.11,0,0,0,24,5a1.08,1.08,0,0,0,.86-.44L37.77,8.5c.47,2.19,1.85,6.76,5.54,9.19,0,0,0,.1,0,.16A1.14,1.14,0,0,0,44,18.91v8.23c-.63,2.18-5.85,18.66-19.14,23.38M38.51,8.1l0-.24L25.09,3.77a1.09,1.09,0,0,0-2.18,0L9.54,7.86l0,.24c-.39,2-1.65,6.51-5.21,8.87a1.1,1.1,0,0,0-.68-.26A1.13,1.13,0,0,0,2.5,17.85a1.15,1.15,0,0,0,.71,1.06V27.2l0,.11c.57,2,5.87,19.09,19.67,24A1.13,1.13,0,0,0,24,52.38a1.11,1.11,0,0,0,1.1-1.11c5.65-2,10.52-6.17,14.48-12.47a47.44,47.44,0,0,0,5.19-11.48l0-8.41a1.14,1.14,0,0,0,.71-1.06,1.12,1.12,0,0,0-1.11-1.14,1.1,1.1,0,0,0-.68.26c-3.55-2.36-4.82-6.92-5.2-8.87m8,19.41C46.13,29,40.41,49,24,53.52,7.59,49,1.87,29,1.47,27.51V16.35c5.06-1.48,6.27-8,6.51-9.88l16-4.9,16,4.9c.24,1.91,1.45,8.4,6.52,9.88ZM47.41,15c-5.28-1.07-6-9.11-6-9.19l0-.51L24,0,6.62,5.32l0,.51c0,.08-.71,8.12-6,9.19L0,15.14V27.61l0,.18C.08,28,5.86,50.24,23.82,55l.18,0,.18,0c18-4.79,23.74-27,23.8-27.24l0-12.65Z";

export function ShieldFrame({ width, height }: FrameProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 55.08"
      style={{ position: "absolute", inset: 0 }}
    >
      <path d={AC_PATH} fill={INK} />
    </svg>
  );
}

/** ShieldFrame with value + label; the label sits above the shield's
 *  pointed tip rather than flush against it. */
export function Shield({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <ShieldFrame width={width} height={height} />
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        bottomInset={height * 0.16}
        maxValueSize={24}
      />
    </div>
  );
}

// ── Heart (Max HP) — companion piece to the AC shield ─────────────────
// A RivetedFrame (see RivetedFrame.tsx): silhouette drawn 1.2× wider
// than the AC shield's 48-unit canvas (x-coords scaled about the
// centreline), on a 57.6 × 55.08 viewBox.
const HEART_SHAPE =
  "M28.8,8.1C25.92,4.6,21.48,2.4,16.92,2.4C8.76,2.4,2.4,9,2.4,17.4C2.4,27.7,11.28,36.1,24.84,48.8L28.8,52.5L32.76,48.8C46.32,36.1,55.2,27.7,55.2,17.4C55.2,9,48.84,2.4,40.68,2.4C36.12,2.4,31.68,4.6,28.8,8.1Z";

// Centre-relative rivet positions: cleft and tip of the heart.
const HEART_RIVETS = [
  { x: 0, y: -14.5 },
  { x: 0, y: 20.7 },
];

/** Heart-shaped stat frame with value + label, e.g. "52" over "HP". */
export function Heart({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <RivetedFrame
      width={width}
      height={height}
      path={HEART_SHAPE}
      viewBox="0 0 57.6 55.08"
      rivets={HEART_RIVETS}
      value={value}
      label={label}
    />
  );
}

// ── Save box — starts as a duplicate of the heart above ───────────────
// Independent copy used by the Spell Save slot so it can be reworked
// into its own design without affecting the heart.

const SAVE_SHAPE =
  "M28.8,8.1C25.92,4.6,21.48,2.4,16.92,2.4C8.76,2.4,2.4,9,2.4,17.4C2.4,27.7,11.28,36.1,24.84,48.8L28.8,52.5L32.76,48.8C46.32,36.1,55.2,27.7,55.2,17.4C55.2,9,48.84,2.4,40.68,2.4C36.12,2.4,31.68,4.6,28.8,8.1Z";

// Centre-relative rivet positions: cleft and tip of the heart.
const SAVE_RIVETS = [
  { x: 0, y: -14.5 },
  { x: 0, y: 20.7 },
];

/** Save-DC stat frame with value + label, e.g. "14" over "Save". */
export function SaveBox({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <RivetedFrame
      width={width}
      height={height}
      path={SAVE_SHAPE}
      viewBox="0 0 57.6 55.08"
      rivets={SAVE_RIVETS}
      value={value}
      label={label}
    />
  );
}

// ── vital-top/mid/bottom.svg (164.94 × 63.89/49.7/49.7) ───────────────
// The stacked vitals column from the sheet: ornate caps top and bottom,
// wavy junction edges between the pieces. Pre-scaled 0.5× so the tall
// originals 9-slice into 34px rows without the zones inverting.

const VITAL_STACK = {
  top: {
    d: "M162.13,62.89a4.42,4.42,0,0,0-3.13-1.7.9.9,0,0,0-1.6,0,12.6,12.6,0,0,0-4.58,1.67H12.12a12.54,12.54,0,0,0-4.58-1.67.9.9,0,0,0-1.6,0,4.44,4.44,0,0,0-3.13,1.7H1v-9A99.44,99.44,0,0,0,2.47,38.18V8.23C4.31,5.26,7.74,1,12.28,1H152.66c4.53,0,8,4.27,9.81,7.23v30a99.44,99.44,0,0,0,1.47,15.72v9ZM1,10.93c.11-.23.44-.93,1-1.86V38.18A91.61,91.61,0,0,1,1,50.6ZM5.41,1H8.25C4.75,2.76,2.27,6.46,1,8.73V4.78C2,4.4,5,3.14,5.41,1M159.54,1c.41,2.14,3.36,3.4,4.4,3.78v4c-1.27-2.27-3.75-6-7.25-7.73ZM163,9.07c.53.93.86,1.63,1,1.86V50.6a91.61,91.61,0,0,1-1-12.42Zm1.62-5.13c-1.14-.35-4.1-1.66-4.1-3.44V0H4.45V.5c0,1.77-3,3.09-4.1,3.44L0,4.05V63.89H3.38l.14-.26A3.35,3.35,0,0,1,6,62.19a.93.93,0,0,0,.73.38.92.92,0,0,0,.71-.36,11.84,11.84,0,0,1,4.3,1.62l.11.06H153.09l.12-.06a11.74,11.74,0,0,1,4.29-1.62.92.92,0,0,0,.71.36.93.93,0,0,0,.73-.38,3.35,3.35,0,0,1,2.48,1.44l.14.26h3.38V4.05Z",
    h: 63.89,
  },
  mid: {
    d: "M163.94,36.41A91.74,91.74,0,0,1,163,24v1.74a91.74,91.74,0,0,1,1-12.43Zm0,12.29h-1.81A4.46,4.46,0,0,0,159,47a.91.91,0,0,0-1.6,0,12.58,12.58,0,0,0-4.58,1.68H12.12A12.58,12.58,0,0,0,7.54,47a.91.91,0,0,0-1.6,0A4.48,4.48,0,0,0,2.81,48.7H1v-9A99.45,99.45,0,0,0,2.47,24v1.74A99.23,99.23,0,0,0,1,10V1H2.81A4.48,4.48,0,0,0,5.94,2.71a.9.9,0,0,0,1.6,0A12.4,12.4,0,0,0,12.12,1h140.7a12.4,12.4,0,0,0,4.58,1.68.9.9,0,0,0,1.6,0A4.46,4.46,0,0,0,162.13,1h1.81v9a99.23,99.23,0,0,0-1.47,15.72V24a99.45,99.45,0,0,0,1.47,15.73ZM1,13.29A91.74,91.74,0,0,1,2,25.72V24A91.74,91.74,0,0,1,1,36.41ZM161.57,0l-.15.26a3.31,3.31,0,0,1-2.48,1.45.89.89,0,0,0-1.44,0A11.7,11.7,0,0,1,153.21.07L153.09,0H11.85l-.12.07A11.7,11.7,0,0,1,7.44,1.68.89.89,0,0,0,6,1.71,3.35,3.35,0,0,1,3.52.27L3.38,0H0V49.7H3.38l.14-.26A3.31,3.31,0,0,1,6,48a.92.92,0,0,0,.73.37A.91.91,0,0,0,7.44,48a11.7,11.7,0,0,1,4.29,1.61l.12.07H153.09l.12-.07A11.7,11.7,0,0,1,157.5,48a.91.91,0,0,0,.71.35.92.92,0,0,0,.73-.37,3.31,3.31,0,0,1,2.48,1.44l.14.26h3.38V0Z",
    h: 49.7,
  },
  bottom: {
    d: "M2.81,1A4.48,4.48,0,0,0,5.94,2.71a.9.9,0,0,0,1.6,0A12.4,12.4,0,0,0,12.12,1h140.7a12.46,12.46,0,0,0,4.58,1.68.9.9,0,0,0,1.6,0A4.46,4.46,0,0,0,162.13,1h1.81v9a99.23,99.23,0,0,0-1.47,15.72V41.47c-1.84,3-5.27,7.23-9.81,7.23H12.28c-4.53,0-8-4.26-9.81-7.23V25.72A99.23,99.23,0,0,0,1,10V1ZM163.94,38.77c-.11.23-.43.93-1,1.86V25.72a91.74,91.74,0,0,1,1-12.43Zm-4.41,9.93h-2.84c3.5-1.76,6-5.46,7.25-7.73v4c-1,.38-4,1.64-4.41,3.78M5.4,48.7C5,46.56,2,45.3,1,44.92V41c1.27,2.27,3.75,6,7.25,7.73ZM2,40.63c-.53-.93-.86-1.63-1-1.86V13.29A91.74,91.74,0,0,1,2,25.72ZM.35,45.76c1.14.35,4.1,1.66,4.1,3.44v.5h156v-.5c0-1.77,3-3.09,4.1-3.44l.35-.11V0h-3.37l-.15.26a3.31,3.31,0,0,1-2.48,1.45.89.89,0,0,0-1.44,0A11.7,11.7,0,0,1,153.21.07L153.09,0H11.85l-.11.07a11.8,11.8,0,0,1-4.3,1.61A.89.89,0,0,0,6,1.71,3.31,3.31,0,0,1,3.52.26L3.38,0H0V45.65Z",
    h: 49.7,
  },
};

export function VitalStackFrame({
  width,
  height,
  part,
}: FrameProps & { part: "top" | "mid" | "bottom" }) {
  const piece = VITAL_STACK[part];
  return (
    <Svg width={width} height={height}>
      <path
        d={stretchPath(piece.d, {
          origW: 164.94,
          origH: piece.h,
          width,
          height,
          scale: 0.5,
        })}
        fill={INK}
      />
    </Svg>
  );
}

/** A full-width VitalStackFrame row with a value + label, e.g. a
 *  character's race or player name over the "Race"/"Player" caption. */
export function VitalStackRow({
  width,
  height,
  part,
  value,
  label,
}: FrameProps & {
  part: "top" | "mid" | "bottom";
  value?: React.ReactNode;
  label?: string;
}) {
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <VitalStackFrame width={width} height={height} part={part} />
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        bottomInset={2}
        sidePadding={24}
        maxValueSize={14}
      />
    </div>
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

/** Scroll aspect helper: source box within the original artwork. */
export const SCROLL_DRAGON_BOX = { x: 21, y: 0, w: 233, h: 99 };
/** Tight crop around scroll body + flap only — no dragon head space above.
 *  y=30 captures the wavy top bezier of the body, which dips to ~y=34. */
export const SCROLL_NODRAGON_BOX = { x: 21, y: 30, w: 233, h: 55 };

export function ScrollFrame({
  width,
  height,
  dragon = true,
}: FrameProps & { dragon?: boolean }) {
  const box = dragon ? SCROLL_DRAGON_BOX : SCROLL_NODRAGON_BOX;
  const line = { stroke: INK, vectorEffect: "non-scaling-stroke" as const };
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

/** The dragon-less scroll (DM side) with a value + label centered on the
 *  scroll body, e.g. a character's name over "Name". */
export function NameScroll({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  const contentW = width * 0.62;
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <ScrollFrame width={width} height={height} dragon={false} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: contentW, height: height }}>
          <FrameText
            width={contentW}
            height={height}
            value={value}
            label={label}
            bottomInset={4}
            maxValueSize={14}
          />
        </div>
      </div>
    </div>
  );
}

/** The dragon scroll (player side) with a value offset to the right of the
 *  dragon's head, since the dragon occupies the left of the banner. */
export function DragonScroll({
  width,
  height,
  value,
  label,
}: FrameProps & { value?: React.ReactNode; label?: string }) {
  return (
    <div style={{ position: "relative", width: width, height: height }}>
      <ScrollFrame width={width} height={height} />
      <div
        style={{
          position: "absolute",
          left: "64%",
          top: "62%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          maxWidth: "62%",
        }}
      >
        {value !== undefined && value !== null && value !== "" && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              color: INK,
            }}
          >
            {value}
          </span>
        )}
        {label && (
          <span
            style={{
              fontSize: 6.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: LABEL_GREY,
              whiteSpace: "pre-line",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ── DnD-Rolltemplate-Info PNGs (330 × 25/52/25) — 3-slice row frame ───

export function InfoTemplateFrame({ width, height }: FrameProps) {
  const cap = Math.min((25 / 330) * width, height / 2);
  const midH = height - cap * 2;
  const img = (src: string, top: number, ih: number) => (
    <Image
      src={src}
      alt=""
      width={330}
      height={52}
      unoptimized
      style={{
        position: "absolute",
        top,
        left: 0,
        width: width,
        height: ih,
        objectFit: "fill",
      }}
    />
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {img("/frames/DnD-Rolltemplate-Info-Top.png", 0, cap)}
      {midH > 0.5 && img("/frames/DnD-Rolltemplate-Info-Middle.png", cap, midH)}
      {img("/frames/DnD-Rolltemplate-Info-Bottom.png", height - cap, cap)}
    </div>
  );
}
