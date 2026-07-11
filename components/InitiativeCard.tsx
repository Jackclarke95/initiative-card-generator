"use client";

import { PlayerFace, DmFace } from "@/components/CardFaces";
import type { CardData } from "@/types/card";

interface InitiativeCardProps {
  card: CardData;
  gutterHeightCm: number;
}

// The print/export-ready layout: the player face upside down, a fold
// gutter, then the DM face — folding the sheet in half along the
// gutter lines the two faces up back-to-back into one physical card.
export default function InitiativeCard({
  card,
  gutterHeightCm,
}: InitiativeCardProps) {
  const gutterStyle = {
    height: `${gutterHeightCm}cm`,
    "--gutter-height": `${gutterHeightCm}cm`,
  } as React.CSSProperties;

  return (
    <div
      className="card-unit"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <PlayerFace card={card} />
      <div className="card-gutter" style={gutterStyle} />
      <DmFace card={card} />
    </div>
  );
}
