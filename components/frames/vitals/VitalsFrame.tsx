// Vitals frame — a complete stat display built from a single silhouette.
// Shared by AC / Max HP / Spell Save DC / Speed / Passive Perception /
// Passive Insight: the silhouette is filled white, then — clipped to its
// interior so nothing leaks outside — a fat black stroke is laid down and
// a slightly narrower white stroke carves out its middle, leaving a thin
// inner border running parallel to the edge (strokes sit at a uniform
// distance from the path, unlike a scaled copy). The crisp outer border
// stroke goes on top. Rivet studs are optional explicit coordinates, given
// relative to the centre of the frame (+x right, +y down). The label
// always sits at the bottom of the value/label pair — Vitals never puts it
// on top — and is omitted entirely (not just hidden) when `label` isn't
// passed.
//
// The silhouette itself is size-less: it's defined in its own viewBox and
// simply grows or shrinks (uniformly, preserving its aspect ratio) to fill
// whatever `width`/`height` box it's given, via the browser's default SVG
// scaling. The stroke widths and rivet size are a separate concern — they
// stay a constant rendered size regardless of how big or small the
// silhouette itself ends up: the two banding strokes use
// `vector-effect="non-scaling-stroke"` (unaffected by the viewBox scale by
// definition), and the rivet radius is pre-divided by that same scale
// factor so it comes back out at its intended size once the SVG scales it.
//
// The only thing that differs between AC/HP/DC/Speed/PP/Insight is which
// shape data file its wrapper (see index.tsx) imports.

import { useId } from "react";
import { Frame, INK } from "@/components/frames/Frame";

interface VitalsFrameProps {
  width: number;
  height: number;
  /** The frame's silhouette as an SVG path (a single closed subpath). */
  path: string;
  /** Coordinate space the path is drawn in, e.g. "0 0 57.6 55.08". */
  viewBox: string;
  /** Outer border stroke width, in constant rendered pixels regardless of
   *  how much the silhouette itself scales. */
  outerW?: number;
  /** Fat black stroke — its half-width is the inner border's outer edge.
   *  Constant rendered pixels, same as `outerW`. */
  bandW?: number;
  /** White stroke carving the band — half-width is the border's inner
   *  edge. Constant rendered pixels, same as `outerW`. */
  gapW?: number;
  /** Rivet dot radius, in constant rendered pixels. */
  rivetR?: number;
  /** Rivet centres, relative to the centre of the frame. */
  rivets?: ReadonlyArray<{ x: number; y: number }>;
  value?: React.ReactNode;
  label?: string;
  /** Gap between the label's baseline and the frame's bottom edge;
   *  defaults to 16% of the height to clear tapering/pointed bottoms. */
  labelInset?: number;
  /** Largest the value text is allowed to grow. */
  maxValueSize?: number;
}

export function VitalsFrame({
  width,
  height,
  path,
  viewBox,
  outerW = 1.5,
  bandW = 7,
  gapW = 5.5,
  rivetR = 1.1,
  rivets = [],
  value,
  label,
  labelInset,
  maxValueSize = 26,
}: VitalsFrameProps) {
  const clipId = useId();
  const [minX, minY, vbW, vbH] = viewBox.split(/[\s,]+/).map(Number);
  const centreX = minX + vbW / 2;
  const centreY = minY + vbH / 2;
  // The same uniform "meet" scale factor the browser applies when fitting
  // this viewBox into width×height — used to counteract the rivets'
  // scaling so their rendered size stays constant (see the vectorEffect
  // note above for how the two banding strokes achieve the same thing).
  const scale = Math.min(width / vbW, height / vbH);
  const rivetViewBoxR = rivetR / scale;

  const art = (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill="#fff" />
      <g clipPath={`url(#${clipId})`}>
        <path
          d={path}
          stroke={INK}
          strokeWidth={bandW}
          strokeLinejoin="miter"
          strokeMiterlimit={8}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={path}
          stroke="#fff"
          strokeWidth={gapW}
          strokeLinejoin="miter"
          strokeMiterlimit={8}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <path
        d={path}
        stroke={INK}
        strokeWidth={outerW}
        strokeLinejoin="miter"
        strokeMiterlimit={8}
        vectorEffect="non-scaling-stroke"
      />
      {rivets.map(({ x, y }) => (
        <circle
          key={`${x}-${y}`}
          cx={centreX + x}
          cy={centreY + y}
          r={rivetViewBoxR}
          fill={INK}
        />
      ))}
    </svg>
  );

  return (
    <Frame
      width={width}
      height={height}
      art={art}
      value={value}
      label={label ? { text: label, position: "bottom" } : undefined}
      labelInset={labelInset ?? Math.round(height * 0.16)}
      maxValueSize={maxValueSize}
      // Frame's default valueMarginTop nudges the value down to visually
      // balance against a label underneath it — with no label at all
      // (the "compact" display mode), there's nothing to balance against,
      // so the value should sit dead-center in the box instead.
      valueMarginTop={label ? undefined : 0}
    />
  );
}
