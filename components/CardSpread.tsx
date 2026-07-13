"use client";

import { PlayerFace, DmFace } from "@/components/CardFaces";
import type { CardData } from "@/types/card";

interface CardSpreadProps {
  card: CardData;
  /** "row" (side by side) fits wide viewports; "column" (stacked) lets
   *  the cards render larger when the available space is tall and
   *  narrow instead. */
  direction?: "row" | "column";
}

// Both faces shown right-side up, side by side, with no fold gutter —
// an easier arrangement to proof-read while editing than the
// fold-ready layout (rotated player face, gutter, DM face) that
// InitiativeCard renders for print/export.
export default function CardSpread({ card, direction = "row" }: CardSpreadProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap: 16,
        alignItems: direction === "row" ? "flex-start" : "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span
          className="text-[10px] uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Player side
        </span>
        <PlayerFace card={card} rotated={false} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span
          className="text-[10px] uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          DM side
        </span>
        <DmFace card={card} />
      </div>
    </div>
  );
}
