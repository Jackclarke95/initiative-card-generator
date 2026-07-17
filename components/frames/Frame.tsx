// Generic stat-frame base: positions a category's own `art` (its SVG
// silhouette/border/whatever) and, on top of it, a value + an optional
// label — both laid out against a plain rectangular content box, with no
// awareness of the art's actual silhouette. Every shape is treated
// identically; `labelInset`/`sidePadding`/`maxValueSize` are plain
// pass-through knobs a caller can set on any instance if a particular
// value/label overflows its shape (e.g. a long label near a narrow point) —
// nothing in this component, or in any shape's own file, ever branches on
// which shape it is to compensate.

import { useEditableLabelText, useEditableText } from "@/components/fieldEdit";

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
  const style: React.CSSProperties = {
    // Block, not the span default of inline: vertical padding on an inline
    // element is purely a paint-time effect (spec'd to not affect line
    // height), so it wouldn't budge the box's actual size — that only ever
    // worked here because the non-editable span sits directly as a flex
    // item, and flex blockifies its items regardless of their own
    // `display`. The editable branch below wraps the span in its own div
    // (for the click-anywhere-to-focus handler), demoting the span to an
    // ordinary inline child where that blockification no longer applies.
    display: "block",
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
  };

  // In the editable preview a caller can wire up the label caption itself
  // (not just the value) as an in-place edit target — currently just vital
  // boxes. `edit` is null everywhere else, so this renders as a plain span
  // as before.
  const edit = useEditableLabelText(text);
  if (!edit) return <span style={style}>{text}</span>;

  return (
    <div
      // Clicking anywhere in the label's own line — including empty space
      // beside a blank caption — focuses it and drops the caret at the end,
      // mirroring Frame's value area.
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).isContentEditable) {
          e.preventDefault();
          edit.focusEnd();
        }
      }}
    >
      <span
        {...edit.bind}
        style={{ ...style, outline: "none", cursor: "text" }}
      />
    </div>
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
  const valueMarginBottom = label ? 5 : 0;
  // The value's own margins (balancing it against the label, plus the
  // optical nudge) take up real vertical space too — leaving them out of
  // this budget let the value's rendered box (font size + margins) run
  // taller than what's actually left after the label, overflowing past the
  // frame's bottom edge and dragging the label down with it. Leave a modest
  // margin between the value and the frame on top of that.
  const valueAreaH =
    Math.max(0, height - labelZoneH - valueMarginTop - valueMarginBottom) *
    0.9;
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
    marginBottom: valueMarginBottom,
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
