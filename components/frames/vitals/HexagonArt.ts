// Passive Perception — a regular hexagon at radius 26, standing on two of
// its points — like feet — with a flat edge between them (mirrored at the
// top too, a consequence of the 6-fold symmetry), rather than balancing
// on a single point. Vertices sit at the same six positions the icon's
// previous six-pointed star used for its outer points.

export const HEXAGON_VIEW_BOX = "0 0 56.8 49.83";

export const HEXAGON_PATH =
  "M41.4,2.4L54.4,24.92L41.4,47.43L15.4,47.43L2.4,24.92L15.4,2.4Z";

// Centre-relative positions of the six vertices, pulled in from the tip
// (radius 26) to radius 22.66 — the same 3.34-unit inset the Shield uses
// to land its studs on the inner border ring rather than the edge.
export const HEXAGON_RIVETS = [
  { x: 11, y: -19 },
  { x: 22, y: 0 },
  { x: 11, y: 19 },
  { x: -11, y: 19 },
  { x: -22, y: 0 },
  { x: -11, y: -19 },
];
