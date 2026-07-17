// Looks up a vital box's chosen shape by name — the single place CardFaces
// and CardEditor go from a VitalFrameShape to the component that renders it.

import type { VitalFrameShape } from "@/types/card";
import {
  Chevron,
  Heart,
  Hexagon,
  Orb,
  Book,
  Shield,
  Circle,
  Square,
} from "@/components/frames/vitals";

export interface VitalFrameProps {
  width: number;
  height: number;
  value?: React.ReactNode;
  label?: string;
  sidePadding?: number;
}

export const VITAL_FRAME_COMPONENTS: Record<
  VitalFrameShape,
  (props: VitalFrameProps) => React.JSX.Element
> = {
  shield: Shield,
  heart: Heart,
  book: Book,
  chevron: Chevron,
  hexagon: Hexagon,
  orb: Orb,
  circle: Circle,
  square: Square,
};
