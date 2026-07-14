// Value + label overlay shared by the stat-carrying frames: the label
// sits at the bottom, inside the frame, in medium grey; the value fills
// whatever space is left above it.

export const INK = "#111";
export const LABEL_GREY = "#6b6b6b";
// Shared by the damage-type row: the "neither" state's text/ring color and
// the dashed separators between entries — same pale grey so the unmarked
// state visually recedes into the row's own dividers.
export const PALE_GREY = "#ccc";

interface FrameTextProps {
  width: number;
  height: number;
  value?: React.ReactNode;
  label?: string;
  /** Set false to keep the space `label` reserves (so the value sits
   *  exactly where it would with the label showing) without actually
   *  printing the label text — e.g. the vitals block's "Compact" mode. */
  showLabel?: boolean;
  /** Gap between the label's baseline and the frame's bottom edge — bump
   *  this up for frames that taper or curve near the bottom (e.g. the shield). */
  bottomInset?: number;
  /** Horizontal margin reserved on each side when sizing the value text. */
  sidePadding?: number;
  /** Largest the value text is allowed to grow. */
  maxValueSize?: number;
  /** Which edge the label sits against; the value fills the remaining space. */
  labelPosition?: "top" | "bottom";
  /** Nudges the value down from dead-center of its available space — most
   *  frames read better with a slight downward push (their labels sit
   *  right at a tapered or curved edge), but boxier frames want the value
   *  perfectly centered, so this can be zeroed out. */
  valueMarginTop?: number;
}

/** Picks a value font size that fills the available box without overflowing. */
function fitValueFontSize(
  value: React.ReactNode,
  maxW: number,
  maxH: number,
  cap: number,
) {
  const text =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (!text) return cap;
  const widthFit = (maxW * 1.5) / text.length;
  return Math.max(8, Math.min(cap, maxH, widthFit));
}

export function FrameText({
  width,
  height,
  value,
  label,
  showLabel = true,
  bottomInset = 3,
  sidePadding = 6,
  maxValueSize = 24,
  labelPosition = "bottom",
  valueMarginTop = 10,
}: FrameTextProps) {
  const labelLines = label ? label.split("\n").length : 0;
  const labelLineH = 6.5 * 1.3;
  const labelZoneH = label ? labelLineH * labelLines + bottomInset : 0;
  const valueAreaH = Math.max(0, height - labelZoneH) * 0.92;
  const hasValue = value !== undefined && value !== null && value !== "";
  const fontSize = fitValueFontSize(
    value,
    Math.max(0, width - sidePadding * 2),
    valueAreaH,
    maxValueSize,
  );

  const valueSpan = hasValue && (
    <span
      style={{
        fontWeight: "bold",
        fontSize,
        lineHeight: 1,
        color: INK,
        whiteSpace: "nowrap",
        marginTop: valueMarginTop,
      }}
    >
      {value}
    </span>
  );

  const labelStyle = {
    fontSize: 6.5,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    color: LABEL_GREY,
    whiteSpace: "pre-line" as const,
    textAlign: "center" as const,
    lineHeight: 1.3,
  };

  const valueEl = (
    <div
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {valueSpan}
    </div>
  );

  // Rendered (rather than omitted) even when showLabel is false, and only
  // visually hidden — an omitted element wouldn't take up any space in the
  // flex column below, so the value's flex:1 box would expand to fill the
  // whole frame instead of just what's left above the label's reserved zone.
  const labelEl = label && (
    <span
      style={{
        ...labelStyle,
        [labelPosition === "top" ? "paddingTop" : "paddingBottom"]: bottomInset,
        marginBottom: 3,
        visibility: showLabel ? "visible" : "hidden",
      }}
    >
      {label}
    </span>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {labelPosition === "top" ? (
        <>
          {labelEl}
          {valueEl}
        </>
      ) : (
        <>
          {valueEl}
          {labelEl}
        </>
      )}
    </div>
  );
}
