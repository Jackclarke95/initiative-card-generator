// Lets hovering a range slider and scrolling nudge its value by one step,
// without needing to grab the thumb — shared by every <input type="range">
// in the app (fold gutter, side width/height, …).

import type { WheelEvent } from "react";

export function stepValueOnWheel(
  e: WheelEvent<HTMLInputElement>,
  value: number,
  step: number,
  min: number,
  max: number,
): number {
  e.preventDefault();
  const direction = e.deltaY < 0 ? 1 : -1; // scroll up = increase
  const next = Math.min(max, Math.max(min, value + direction * step));
  // Guards against floating-point drift (0.1 + 0.2 = 0.30000000000000004)
  // accumulating into a value the input's own `step` then rejects.
  return Math.round(next * 100) / 100;
}
