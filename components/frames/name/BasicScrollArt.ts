// Basic Scroll artwork — CharScroll.svg's plain ribbon, no dragon or
// extra artwork above it. Its pieces (the ribbon + pinstripes) are shared
// by the Dragon variant too — see DragonScrollArt.ts.

export const ROLL_WHITE = "M21.85,45.73 L21.85,83.23 L57.35,78.59 L57.35,41.09 Z";
export const ROLL_THIN = "M22.63,48.24l34.72-4.42M22.63,80.45l34.72-4.93";
export const ROLL_GREY = "M57.35,41.09 L33.13,37.51 L33.13,75.01 L57.35,78.59 Z";
export const BODY =
  "M252.17,75c-61.75,11.25-157.29-11.25-219,0V37.51c61.75-11.25,157.29,11.25,219,0Z";
export const BODY_THIN =
  "M252.17,40.43s-19.87,8-114-.29c-66.51-5.89-99.72-.73-104.85.17M253.05,71.39s-20.5,8.66-114.67.33c-66.51-5.89-99.72-.73-104.85.17";

// Midline between the two BODY_THIN pinstripes, running left-to-right (the
// pinstripes themselves run right-to-left, which would read backwards) —
// the path the name text rides, so it follows the ribbon's own wave. Shared
// by every variant (they all crop the same underlying artwork).
export const NAME_CURVE =
  "M33.32,55.81C38.45,54.91,71.66,49.75,138.17,55.64C232.30,63.93,252.17,55.93,252.17,55.93";

// Tightly cropped to just the ribbon (no dragon head space above).
export const SCROLL_BOX = { x: 21, y: 30, w: 235, h: 55 };
