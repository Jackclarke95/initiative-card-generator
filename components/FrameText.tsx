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
  /** Gap between the label's baseline and the frame's bottom edge — bump
   *  this up for frames that taper or curve near the bottom (e.g. the shield). */
  bottomInset?: number;
  /** Horizontal margin reserved on each side when sizing the value text. */
  sidePadding?: number;
  /** Largest the value text is allowed to grow. */
  maxValueSize?: number;
  /** Which edge the label sits against; the value fills the remaining space. */
  labelPosition?: "top" | "bottom";
  /** "default" shares the box with the label, centered in whatever
   *  vertical space is left over. "middle" pins the value to the box's
   *  true vertical center regardless of where the label sits. */
  valuePosition?: "default" | "middle";
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
  bottomInset = 3,
  sidePadding = 6,
  maxValueSize = 24,
  labelPosition = "bottom",
  valuePosition = "default",
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
        // This nudge only makes sense when the value shares the flex stack
        // with the label below it (see the "default" case further down) —
        // "middle" wants the glyph box itself dead-centered, untouched.
        marginTop: valuePosition === "middle" ? 0 : 10,
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

  if (valuePosition === "middle") {
    // Value sits dead-center of the box, unaffected by the label — the
    // label is an absolute overlay pinned to its edge instead of sharing
    // the flex stack that would otherwise push the value off-center.
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {valueSpan}
        </div>
        {label && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              [labelPosition]: 0,
              display: "flex",
              justifyContent: "center",
              [labelPosition === "top" ? "paddingTop" : "paddingBottom"]:
                bottomInset,
            }}
          >
            <span style={{ ...labelStyle, marginBottom: 3 }}>{label}</span>
          </div>
        )}
      </div>
    );
  }

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

  const labelEl = label && (
    <span
      style={{
        ...labelStyle,
        [labelPosition === "top" ? "paddingTop" : "paddingBottom"]: bottomInset,
        marginBottom: 3,
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
