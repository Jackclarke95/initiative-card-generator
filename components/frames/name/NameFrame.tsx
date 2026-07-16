// Name — the character-name banner ribbon (basic/dragon/party/spell),
// with a value that rides the ribbon's own curved path rather than sitting
// in a plain rectangular box, so it doesn't reuse Frame's value/label
// layout at all. There is no `label` prop here — name scrolls never show
// one, so that's a type-level guarantee rather than a hidden runtime rule.

import { useId } from "react";
import { INK } from "@/components/frames/Frame";

export interface ScrollBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface NameFrameProps {
  width: number;
  height: number;
  /** The ribbon's own artwork, already cropped/sized to `box`. */
  art: React.ReactNode;
  /** The crop box this variant's art (and `curve`) are drawn in. */
  box: ScrollBox;
  /** The curve the name text rides, in the same coordinate space as `box`. */
  curve: string;
  /** The full length of `curve`, used to size the text to fit it — override
   *  per instance if a variant ever uses a differently-sized curve. */
  curveLength?: number;
  /** Nudges the text to match this variant's own ribbon position — the
   *  curve is shared across variants, but some ribbons sit a little
   *  higher/lower than others at the same coordinates. */
  textOffset?: { x: number; y: number };
  /** Largest the name text is allowed to grow. */
  maxValueSize?: number;
  value?: React.ReactNode;
  /** Suppress the curved name text (keeping the banner). Used while the
   *  name is being edited, when a straight editable line stands in for it. */
  hideValue?: boolean;
}

const DEFAULT_CURVE_LENGTH = 219;
const DEFAULT_MAX_VALUE_SIZE = 16;

export function NameFrame({
  width,
  height,
  art,
  box,
  curve,
  curveLength = DEFAULT_CURVE_LENGTH,
  textOffset,
  maxValueSize = DEFAULT_MAX_VALUE_SIZE,
  value,
  hideValue = false,
}: NameFrameProps) {
  const pathId = useId();
  const text =
    !hideValue && (typeof value === "string" || typeof value === "number")
      ? String(value)
      : "";
  const usableWidth = curveLength * 0.85;
  const fontSize = text
    ? Math.max(8, Math.min(maxValueSize, (usableWidth * 1.5) / text.length))
    : 0;

  return (
    <div style={{ position: "relative", width, height }}>
      {art}
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
          <g
            transform={
              textOffset
                ? `translate(${textOffset.x}, ${textOffset.y})`
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
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {text}
              </textPath>
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}
