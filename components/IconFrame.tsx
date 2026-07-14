// Icon frame — a complete stat display built from a single shape.
// Generic construction matching the AC shield's anatomy, from any closed
// path: the silhouette is filled white, then — clipped to its interior
// so nothing leaks outside — a fat black stroke is laid down and a
// slightly narrower white stroke carves out its middle, leaving a thin
// inner border running parallel to the edge (strokes sit at a uniform
// distance from the path, unlike a scaled copy). The crisp outer border
// stroke goes on top. Rivet studs are optional explicit coordinates,
// given relative to the centre of the frame (+x right, +y down). The
// value and label render over the frame:
//
//   <IconFrame w={62} h={60} path={SHAPE} viewBox="0 0 57.6 55.08"
//               rivets={[{ x: 0, y: -14.5 }]} value={15} label="AC" />

import { useId } from "react";
import { FrameText, INK } from "@/components/FrameText";

interface IconFrameProps {
  width: number;
  height: number;
  /** The frame's silhouette as an SVG path (a single closed subpath). */
  path: string;
  /** Coordinate space the path is drawn in, e.g. "0 0 57.6 55.08". */
  viewBox: string;
  /** Outer border stroke width. */
  outerW?: number;
  /** Fat black stroke — its half-width is the inner border's outer edge. */
  bandW?: number;
  /** White stroke carving the band — half-width is the border's inner edge. */
  gapW?: number;
  rivetR?: number;
  /** Rivet centres, relative to the centre of the frame. */
  rivets?: ReadonlyArray<{ x: number; y: number }>;
  value?: React.ReactNode;
  label?: string;
  /** Set false to keep the label's reserved space (so the value doesn't
   *  shift) without printing its text. */
  showLabel?: boolean;
  /** Gap between the label's baseline and the frame's bottom edge;
   *  defaults to 16% of the height to clear tapering/pointed bottoms. */
  bottomInset?: number;
  /** Largest the value text is allowed to grow. */
  maxValueSize?: number;
}

export function IconFrame({
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
  showLabel = true,
  bottomInset,
  maxValueSize = 26,
}: IconFrameProps) {
  const clipId = useId();
  const [minX, minY, vbW, vbH] = viewBox.split(/[\s,]+/).map(Number);
  const centreX = minX + vbW / 2;
  const centreY = minY + vbH / 2;
  return (
    <div style={{ position: "relative", width: width, height: height }}>
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
          />
          <path
            d={path}
            stroke="#fff"
            strokeWidth={gapW}
            strokeLinejoin="miter"
            strokeMiterlimit={8}
          />
        </g>
        <path
          d={path}
          stroke={INK}
          strokeWidth={outerW}
          strokeLinejoin="miter"
          strokeMiterlimit={8}
        />
        {rivets.map(({ x, y }) => (
          <circle
            key={`${x}-${y}`}
            cx={centreX + x}
            cy={centreY + y}
            r={rivetR}
            fill={INK}
          />
        ))}
      </svg>
      <FrameText
        width={width}
        height={height}
        value={value}
        label={label}
        showLabel={showLabel}
        bottomInset={bottomInset ?? height * 0.16}
        maxValueSize={maxValueSize}
      />
    </div>
  );
}
