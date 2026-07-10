// Value + label overlay shared by the stat-carrying frames: the label
// sits at the bottom, inside the frame, in medium grey; the value fills
// whatever space is left above it.

export const INK = "#111";
export const LABEL_GREY = "#6b6b6b";

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
        {hasValue && (
          <span
            style={{
              fontWeight: "bold",
              fontSize,
              lineHeight: 1,
              color: INK,
              whiteSpace: "nowrap",
              marginTop: 10,
            }}
          >
            {value}
          </span>
        )}
      </div>
      {label && (
        <span
          style={{
            paddingBottom: bottomInset,
            fontSize: 6.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: LABEL_GREY,
            whiteSpace: "pre-line",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 3,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
