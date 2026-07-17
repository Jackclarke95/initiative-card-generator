"use client";

import { DmFace, PlayerFace } from "@/components/CardFaces";
import { inToPx } from "@/lib/cardLayout";
import type { CardData } from "@/types/card";

interface FoldedCardPreviewProps {
  card: CardData;
  gutterHeightCm: number;
  /** The gutter slider's maximum — the SVG's own pixel footprint is
   *  sized off this (not the current value), so dragging the slider
   *  changes how "open" the book looks without the surrounding form
   *  growing or shrinking. */
  maxGutterHeightCm: number;
  /** The visible front panel's own size, in inches (whichever face
   *  `face` selects). */
  widthIn: number;
  heightIn: number;
  /** The *other* face's size, in inches — the folded card is one physical
   *  object, so its back panel (drawn as a plain schematic, not real
   *  content) needs its own real dimensions too, or the wedge reads as
   *  uniformly one side's size when the two sides actually differ. */
  backWidthIn: number;
  backHeightIn: number;
  /** Which face sits on the visible front panel. */
  face?: "dm" | "player";
  /** Mirrors the whole wedge left-right, so the front panel faces
   *  right instead of left — the face content is counter-mirrored so
   *  it still reads normally, only the fold's direction flips. */
  mirrored?: boolean;
}

const SCALE = 0.25;
const PX_PER_CM = 96 / 2.54;
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);
// Panels splay this many degrees past a flat 90° from the ridge, so the
// fold reads as an open tent rather than a book lying perfectly flat.
const TILT_DEG = -5;
const COS_TILT = Math.cos((TILT_DEG * Math.PI) / 180);
const SIN_TILT = Math.sin((TILT_DEG * Math.PI) / 180);

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

// A panel hinged at its top edge (y = 0, depth hingeZ) and tilted about
// that hinge by TILT_DEG so its bottom edge swings further past
// hingeZ — the top edge (the ridge) is untouched, only the free bottom
// edge splays out, same as a tent panel leaning open past vertical.
// `tiltSign` flips which way the bottom edge swings: the front and
// back panels need opposite signs so they splay apart into a "V"
// rather than both leaning the same way.
//
// The hinge sits at a fixed y = 0 rather than at each panel's own
// height, so it lands at the same screen position for both panels
// regardless of how tall either one is — only the depth offset
// (hingeZ, i.e. the gutter) should ever separate them.
//
// `xOffset` places the panel's own x∈[0,w] span at an absolute
// position — front and back both anchor at their own right edge
// (x = 0), so the two spans overlap there regardless of how their
// widths compare (see frontXOffset/backXOffset below).
function panelCorners(
  w: number,
  h: number,
  xOffset: number,
  hingeZ: number,
  tiltSign: 1 | -1,
) {
  function corner(x: number, y: number): Point {
    // y: 0 at the hinge (top edge), -h at the free bottom edge.
    const tiltedY = y * COS_TILT;
    const tiltedZ = hingeZ + tiltSign * y * SIN_TILT;
    return project(x + xOffset, tiltedY, tiltedZ);
  }
  return {
    bl: corner(0, -h),
    br: corner(w, -h),
    tr: corner(w, 0),
    tl: corner(0, 0),
  };
}

function toPolygon(points: Point[], offset: Point): string {
  return points.map((p) => `${p.x + offset.x},${p.y + offset.y}`).join(" ");
}

// An isometric preview of the folded card as an open "book": two
// full card-sized panels (front-left and back-right) joined only by a
// thin ridge at the top — the gutter fold — with no side or bottom
// walls connecting them, since a folded card is two hinged panels,
// not a solid block. The front panel shows the actual DM face
// (isometric is a parallel projection, so a rectangle always maps to
// a parallelogram via a plain 2D affine transform — no 3D/perspective
// math needed to place it).
export default function FoldedCardPreview({
  card,
  gutterHeightCm,
  maxGutterHeightCm,
  widthIn,
  heightIn,
  backWidthIn,
  backHeightIn,
  face = "dm",
  mirrored = false,
}: FoldedCardPreviewProps) {
  const frontWpx = inToPx(widthIn) * SCALE;
  const frontHpx = inToPx(heightIn) * SCALE;
  const backWpx = inToPx(backWidthIn) * SCALE;
  const backHpx = inToPx(backHeightIn) * SCALE;

  // Player and DM share the same width axis — the fold doesn't rotate
  // it, it's the height axis that hinges — so the two panels' widths
  // should overlap, not sit side by side. Both the front and back panel
  // anchor at their own right edge (x = 0, nearest the hinge/ridge —
  // the edge closest to the camera), extending leftward by their own
  // width — so whichever is narrower sits fully inside the wider one's
  // span, sharing that right edge, rather than the two drifting apart.
  const frontXOffset = -frontWpx;
  const backXOffset = -backWpx;
  const widthsMatch = frontWpx === backWpx;

  // Physically the fold sits at the gutter's midline, leaving half its
  // height as the visible ridge — but at this scale that read as too
  // subtle, so this doubles it (the full gutter height) for legibility.
  const D = Math.max(0, gutterHeightCm * PX_PER_CM * SCALE);
  const maxD = Math.max(0, maxGutterHeightCm * PX_PER_CM * SCALE);

  const front = panelCorners(frontWpx, frontHpx, frontXOffset, 0, 1);
  const back = panelCorners(backWpx, backHpx, backXOffset, -D, -1);
  // The back panel's screen extent varies with the *current* gutter depth
  // in a way that isn't monotonic toward the max end — at a shallow
  // depth (small D) its bottom edge actually reaches further down than
  // at the deepest setting — so bounding the SVG's fixed footprint off
  // only the max-depth case clipped the bottom edge at shallow depths.
  // Using both extremes (D = 0 and D = maxD) covers the full range any
  // current D can produce.
  const minDBack = panelCorners(backWpx, backHpx, backXOffset, 0, -1);
  const maxDBack = panelCorners(backWpx, backHpx, backXOffset, -maxD, -1);

  const bounds = [
    front.bl,
    front.br,
    front.tr,
    front.tl,
    minDBack.bl,
    minDBack.br,
    minDBack.tr,
    minDBack.tl,
    maxDBack.bl,
    maxDBack.br,
    maxDBack.tr,
    maxDBack.tl,
  ];
  const minX = Math.min(...bounds.map((p) => p.x));
  const maxX = Math.max(...bounds.map((p) => p.x));
  const minY = Math.min(...bounds.map((p) => p.y));
  const maxY = Math.max(...bounds.map((p) => p.y));
  const pad = 2;
  const offset: Point = { x: -minX + pad, y: -minY + pad };
  const viewW = maxX - minX + pad * 2;
  const viewH = maxY - minY + pad * 2;

  // The ridge (fold) can only physically connect where paper exists on
  // both the front and back panel — i.e. their overlap, which is at
  // most the narrower side's full width (they always share at least
  // the anchor point above). Drawn as a true rectangle (front-side and
  // back-side edges span the exact same x-range) rather than tapering
  // to each panel's own full width, which is what made it read as a
  // trapezoid when the two widths differed.
  const ridgeMinX = Math.max(frontXOffset, backXOffset);
  const ridgeMaxX = Math.min(frontXOffset + frontWpx, backXOffset + backWpx);
  function topEdgePoint(x: number, hingeZ: number): Point {
    return project(x, 0, hingeZ);
  }
  const ridgeFrontLeft = topEdgePoint(ridgeMinX, 0);
  const ridgeFrontRight = topEdgePoint(ridgeMaxX, 0);
  const ridgeBackRight = topEdgePoint(ridgeMaxX, -D);
  const ridgeBackLeft = topEdgePoint(ridgeMinX, -D);

  // The actual face content is rendered at its real (unscaled) pixel
  // size — CardFaces.tsx lays out several of its measurements (border
  // insets, the name banner's own margins, …) as fixed pixel amounts
  // rather than proportions, so rendering it directly at this preview's
  // shrunk-down panel size distorted those proportions relative to how
  // the same card looks everywhere else in the app. Rendering at true
  // size and only then shearing the whole result down onto the (small)
  // panel quad below keeps every internal proportion faithful — this
  // is a real, if tiny, rendering of the card, not a redrawn model of it.
  const frontRealWpx = inToPx(widthIn);
  const frontRealHpx = inToPx(heightIn);

  // Affine matrix mapping the face's own full-size DOM box
  // (0,0)-(frontRealWpx,frontRealHpx) onto the front panel's isometric
  // quad — isometric projection is a parallel projection, so a
  // rectangle always maps onto a parallelogram via a plain 2D affine
  // transform, no 3D/perspective math needed.
  const p00 = { x: front.tl.x + offset.x, y: front.tl.y + offset.y }; // DOM top-left
  const p10 = { x: front.tr.x + offset.x, y: front.tr.y + offset.y }; // DOM top-right
  const p01 = { x: front.bl.x + offset.x, y: front.bl.y + offset.y }; // DOM bottom-left
  const matA = (p10.x - p00.x) / frontRealWpx;
  const matB = (p10.y - p00.y) / frontRealWpx;
  const matC = (p01.x - p00.x) / frontRealHpx;
  const matD = (p01.y - p00.y) / frontRealHpx;

  const FaceComponent =
    face === "player" ? (
      <PlayerFace card={card} rotated={false} width={frontRealWpx} height={frontRealHpx} />
    ) : (
      <DmFace card={card} width={frontRealWpx} height={frontRealHpx} />
    );

  return (
    <div
      style={{
        display: "inline-block",
        lineHeight: 0,
        transform: mirrored ? "scaleX(-1)" : undefined,
      }}
    >
      <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`}>
        {/* Back panel — the other half of the fold, drawn first so the
            front panel and ridge sit visually in front of it. A fixed
            black stroke (rather than the app's theme-dependent
            --border) keeps the wedge's edges legible against both a
            light and dark app background. */}
        <polygon
          points={toPolygon([back.bl, back.br, back.tr, back.tl], offset)}
          fill="#e2e2e2"
          stroke="#000"
          strokeWidth={0.5}
        />
        {/* Ridge — the ~half-gutter fold connecting the two panels,
            constrained to the narrower side's width (see ridgeMinX/Max
            above). Red-bordered when the two widths don't match, since
            that also means they won't actually line up when printed. */}
        {D > 0.4 && (
          <polygon
            points={toPolygon(
              [ridgeFrontLeft, ridgeFrontRight, ridgeBackRight, ridgeBackLeft],
              offset,
            )}
            fill="#b8b8b8"
            stroke={widthsMatch ? "#000" : "red"}
            strokeWidth={0.5}
          />
        )}
        {/* Front panel — the real face at true size, sheared onto the
            quad above. When the wedge itself is mirrored, this inner div
            carries an opposite mirror so the artwork still reads
            normally — only the fold's direction flips. */}
        <foreignObject
          x={0}
          y={0}
          width={frontRealWpx}
          height={frontRealHpx}
          transform={`matrix(${matA} ${matB} ${matC} ${matD} ${p00.x} ${p00.y})`}
        >
          <div
            style={{
              width: frontRealWpx,
              height: frontRealHpx,
              transform: mirrored ? "scaleX(-1)" : undefined,
            }}
          >
            {FaceComponent}
          </div>
        </foreignObject>
        {/* Outline the front panel on top of the face content — the
            face's own .card-face border is a subtle theme-neutral grey
            that can wash out against the app chrome, so this adds a
            crisp black edge instead. */}
        <polygon
          points={toPolygon([front.bl, front.br, front.tr, front.tl], offset)}
          fill="none"
          stroke="#000"
          strokeWidth={0.5}
        />
      </svg>
    </div>
  );
}
