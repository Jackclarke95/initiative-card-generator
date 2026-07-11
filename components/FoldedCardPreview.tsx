"use client";

import { DmFace, FACE_W, FACE_H } from "@/components/CardFaces";
import type { CardData } from "@/types/card";

interface FoldedCardPreviewProps {
  card: CardData;
  gutterHeightCm: number;
  /** The gutter slider's maximum — the SVG's own pixel footprint is
   *  sized off this (not the current value), so dragging the slider
   *  changes how "open" the book looks without the surrounding form
   *  growing or shrinking. */
  maxGutterHeightCm: number;
}

const SCALE = 0.25;
const PX_PER_CM = 96 / 2.54;
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

interface Point {
  x: number;
  y: number;
}

// Standard 30° isometric projection: y (card height) stays vertical
// with no foreshortening, while x (width) and z (depth) each recede at
// 30° from horizontal — the classic way to draw 3D shapes in 2D.
function project(x: number, y: number, z: number): Point {
  return {
    x: (x - z) * COS30,
    y: (x + z) * SIN30 - y,
  };
}

function panelCorners(w: number, h: number, z: number) {
  return {
    bl: project(0, 0, z),
    br: project(w, 0, z),
    tr: project(w, h, z),
    tl: project(0, h, z),
  };
}

function toPolygon(points: Point[], offset: Point): string {
  return points.map((p) => `${p.x + offset.x},${p.y + offset.y}`).join(" ");
}

// An isometric preview of the folded card as an open "book": two
// full card-sized panels (front-left and back-right) joined only by a
// thin ridge at the top — the gutter fold — with no side or bottom
// walls connecting them, since a folded card is two hinged panels,
// not a solid block. The fold sits at the gutter's midline, so the
// ridge depth is half the current gutter height. The front panel
// shows the actual DM face (isometric is a parallel projection, so a
// rectangle always maps to a parallelogram via a plain 2D affine
// transform — no 3D/perspective math needed to place it).
export default function FoldedCardPreview({
  card,
  gutterHeightCm,
  maxGutterHeightCm,
}: FoldedCardPreviewProps) {
  const W = FACE_W * SCALE;
  const H = FACE_H * SCALE;
  const D = Math.max(0, (gutterHeightCm * PX_PER_CM * SCALE) / 2);
  const maxD = Math.max(0, (maxGutterHeightCm * PX_PER_CM * SCALE) / 2);

  const front = panelCorners(W, H, 0);
  const back = panelCorners(W, H, -D);
  // The widest the back panel could ever swing to — used only to fix
  // the SVG's own dimensions, not to place anything.
  const maxBack = panelCorners(W, H, -maxD);

  const bounds = [
    front.bl,
    front.br,
    front.tr,
    front.tl,
    maxBack.bl,
    maxBack.br,
    maxBack.tr,
    maxBack.tl,
  ];
  const minX = Math.min(...bounds.map((p) => p.x));
  const maxX = Math.max(...bounds.map((p) => p.x));
  const minY = Math.min(...bounds.map((p) => p.y));
  const maxY = Math.max(...bounds.map((p) => p.y));
  const pad = 2;
  const offset: Point = { x: -minX + pad, y: -minY + pad };
  const viewW = maxX - minX + pad * 2;
  const viewH = maxY - minY + pad * 2;

  // Affine matrix mapping the DM face's own full-size DOM box
  // (0,0)-(FACE_W,FACE_H) onto the front panel's isometric quad.
  const p00 = { x: front.tl.x + offset.x, y: front.tl.y + offset.y }; // DOM top-left
  const p10 = { x: front.tr.x + offset.x, y: front.tr.y + offset.y }; // DOM top-right
  const p01 = { x: front.bl.x + offset.x, y: front.bl.y + offset.y }; // DOM bottom-left
  const a = (p10.x - p00.x) / FACE_W;
  const b = (p10.y - p00.y) / FACE_W;
  const c = (p01.x - p00.x) / FACE_H;
  const d = (p01.y - p00.y) / FACE_H;

  return (
    <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`}>
      {/* Back panel — the other half of the fold, drawn first so the
          front panel and ridge sit visually in front of it. */}
      <polygon
        points={toPolygon([back.bl, back.br, back.tr, back.tl], offset)}
        fill="#e2e2e2"
        stroke="var(--card-border)"
        strokeWidth={0.5}
      />
      {/* Ridge — the ~half-gutter fold connecting the two panels */}
      {D > 0.4 && (
        <polygon
          points={toPolygon([front.tl, front.tr, back.tr, back.tl], offset)}
          fill="#b8b8b8"
          stroke="var(--card-border)"
          strokeWidth={0.5}
        />
      )}
      {/* Front panel — the real DM face, sheared onto the quad above */}
      <foreignObject
        x={0}
        y={0}
        width={FACE_W}
        height={FACE_H}
        transform={`matrix(${a} ${b} ${c} ${d} ${p00.x} ${p00.y})`}
      >
        <DmFace card={card} />
      </foreignObject>
    </svg>
  );
}
