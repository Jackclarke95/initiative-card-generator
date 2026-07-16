// AC — VitalsFrame rebuild of the official AC.svg. Single silhouette traced
// from the original asset's outermost contour on its 48 × 55.08 canvas;
// the banded borders and studs the original baked into nested contours
// now come from VitalsFrame's construction. Scaled down 5.6% vertically
// about the viewBox centre so its rendered height matches the Heart/Save
// frames, which fill less of their own (shorter) viewBox.

export const SHIELD_VIEW_BOX = "-1 -1 50 57.08";

export const SHIELD_PATH =
  "M24,1.54L6.62,6.56C6.62,6.64,5.91,14.29,0.62,15.3L0,15.42V27.61C0.08,27.97,5.86,48.97,24,53.46C42.14,48.97,47.92,27.97,48,27.61V15.42L47.38,15.3C42.09,14.29,41.38,6.64,41.38,6.56Z";

// Centre-relative positions of the original asset's four studs: below the
// peak, the two waist corners, and the bottom tip.
export const SHIELD_RIVETS = [
  { x: 0, y: -22.66 },
  { x: 20.5, y: -9.91 },
  { x: 0, y: 22.66 },
  { x: -20.5, y: -9.91 },
];
