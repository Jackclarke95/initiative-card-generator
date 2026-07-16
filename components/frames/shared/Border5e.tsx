// The classic 5e sheet border — a plain outline, no value/label overlay.
// Used directly for the player-face outer border, and as the Generic Notes
// frame's art.

import { stretchPath } from "@/components/svgNineSlice";
import { INK } from "@/components/frames/Frame";
import {
  BORDER_5E_ORIG_H,
  BORDER_5E_ORIG_W,
  BORDER_5E_PATH,
} from "@/components/frames/shared/Border5eArt";

export function Border5e({
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
        d={stretchPath(BORDER_5E_PATH, {
          origW: BORDER_5E_ORIG_W,
          origH: BORDER_5E_ORIG_H,
          width,
          height,
        })}
        fill={INK}
      />
    </svg>
  );
}
