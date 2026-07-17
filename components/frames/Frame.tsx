// Generic stat-frame base: positions a category's own `art` (its SVG
// silhouette/border/whatever) and, on top of it, a value + an optional
// label — both laid out against a plain rectangular content box, with no
// awareness of the art's actual silhouette. Every shape is treated
// identically; `labelInset`/`sidePadding`/`maxValueSize` are plain
// pass-through knobs a caller can set on any instance if a particular
// value/label overflows its shape (e.g. a long label near a narrow point) —
// nothing in this component, or in any shape's own file, ever branches on
// which shape it is to compensate.

import { useEditableText } from "@/components/fieldEdit";

export const INK = "#111";
export const LABEL_GREY = "#6b6b6b";
// Shared by the damage-type row: the "neither" state's text/ring color and
// the dashed separators between entries — same pale grey so the unmarked
// state visually recedes into the row's own dividers.
export const PALE_GREY = "#ccc";

export interface LabelConfig {
  text: string;
  /** Which edge the label sits against; the value fills the remaining
   *  space. Fixed per frame category (e.g. always "bottom" for Vitals,
   *  always "top" for Ability Scores) — never chosen per instance. */
  position: "top" | "bottom";
}

interface FrameProps {
  width: number;
  height: number;
  /** The frame's own artwork, already sized to `width`/`height`. */
  art: React.ReactNode;
  value?: React.ReactNode;
  /** Omit entirely to hide the label — there is no separate visibility flag. */
  label?: LabelConfig;
  /** Gap between the label's baseline and the frame's edge it sits against —
   *  bump this up for frames that taper or curve near that edge. */
  labelInset?: number;
  /** Horizontal margin reserved on each side when sizing the value text. */
  sidePadding?: number;
  /** Largest the value text is allowed to grow. */
  maxValueSize?: number;
  /** Nudges the value down from dead-center of its available space — most
   *  frames read better with a slight downward push, but boxier frames want
   *  the value perfectly centered, so this can be zeroed out. */
  valueMarginTop?: number;
}

/** The small uppercase caption every frame category uses — shared as its
 *  own piece so a category whose value doesn't fit `Frame`'s centered,
 *  auto-fit layout (e.g. Generic Notes' free-flowing text) can still reuse
 *  the actual label rendering rather than restyling its own copy. */
export function Label({
  text,
  position,
  inset = 3,
}: {
  text: string;
  position: "top" | "bottom";
  inset?: number;
}) {
  return (
    <span
      style={{
        fontSize: 6.5,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 600,
        color: LABEL_GREY,
        whiteSpace: "pre-line",
        textAlign: "center",
        lineHeight: 1.3,
        [position === "top" ? "paddingTop" : "paddingBottom"]: inset,
        marginBottom: 3,
      }}
    >
      {text}
    </span>
  );
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
  // Empty text still respects the height clamp — skipping it here (leaving
  // only the cap) would make an empty field's placeholder cursor a
  // different size than the field ever renders at once it has real text,
  // which is its own source of a layout jump on the first keystroke.
  if (!text) return Math.max(8, Math.min(cap, maxH));
  const widthFit = (maxW * 1.5) / text.length;
  return Math.max(8, Math.min(cap, maxH, widthFit));
}

export function Frame({
  width,
  height,
  art,
  value,
  label,
  labelInset = 3,
  sidePadding = 5,
  maxValueSize = 24,
  valueMarginTop = 10,
}: FrameProps) {
  const labelLines = label ? label.text.split("\n").length : 0;
  const labelLineH = 6.5 * 1.3;
  const labelZoneH = label ? labelLineH * labelLines + labelInset : 0;
  // Leave a modest margin between the value and the frame.
  const valueAreaH = Math.max(0, height - labelZoneH) * 0.9;
  const hasValue = value !== undefined && value !== null && value !== "";
  const fontSize = fitValueFontSize(
    value,
    Math.max(0, width - sidePadding * 2),
    valueAreaH,
    maxValueSize,
  );

  // In the editable preview the value text itself becomes the input (no
  // overlay): the real, auto-fit glyphs are what you type into. `edit` is
  // null everywhere else, so this renders as a plain span as before.
  const editText =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const edit = useEditableText(editText);

  const valueStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontSize,
    lineHeight: 1,
    color: INK,
    whiteSpace: "nowrap",
    marginTop: valueMarginTop,
  };

  const valueSpan = edit ? (
    <span
      {...edit.bind}
      style={{
        ...valueStyle,
        outline: "none",
        cursor: "text",
      }}
    />
  ) : (
    hasValue && <span style={valueStyle}>{value}</span>
  );

  const valueEl = (
    <div
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // `clip`, not `hidden`: an overflow:hidden box is still a scroll
        // container — focusing the editable value or placing its caret
        // makes the browser scroll-the-caret-into-view inside it, and at
        // line-height 1 the caret's rect (drawn from full font metrics)
        // pokes past the line box, so that "reveal" nudged the whole
        // value up a few pixels. The nudge lives in element.scrollTop —
        // a DOM property — so markup and computed styles compared
        // byte-identical while the paint differed, and it survived
        // remounting the span (the offset sat here, on the parent).
        // overflow:clip clips identically but is NOT a scroll container:
        // there is no scrollTop to nudge, by definition.
        overflow: "clip",
      }}
      // Clicking anywhere in the value area (incl. an empty field, which has
      // no glyphs to hit) focuses the editable text and drops the caret at
      // the end. Clicks that land on the editable text itself fall through to
      // the browser's native caret placement.
      onMouseDown={
        edit
          ? (e) => {
              if (!(e.target as HTMLElement).isContentEditable) {
                e.preventDefault();
                edit.focusEnd();
              }
            }
          : undefined
      }
    >
      {valueSpan}
    </div>
  );

  const labelEl = label && (
    <Label text={label.text} position={label.position} inset={labelInset} />
  );

  return (
    <div style={{ position: "relative", width, height }}>
      {art}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {label?.position === "top" ? (
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
    </div>
  );
}
