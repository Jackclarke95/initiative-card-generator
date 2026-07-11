"use client";

import { PlayerFace, DmFace } from "@/components/CardFaces";
import type { CardData } from "@/types/card";

interface CardSpreadProps {
  card: CardData;
}

// Both faces shown right-side up, side by side, with no fold gutter —
// an easier arrangement to proof-read while editing than the
// fold-ready layout (rotated player face, gutter, DM face) that
// InitiativeCard renders for print/export.
export default function CardSpread({ card }: CardSpreadProps) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <PlayerFace card={card} rotated={false} />
      <DmFace card={card} />
    </div>
  );
}
