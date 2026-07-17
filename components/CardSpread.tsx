"use client";

import { PlayerFace, DmFace } from "@/components/CardFaces";
import { inToPx, type LayoutConfig } from "@/lib/cardLayout";
import type { CardData } from "@/types/card";

interface CardSpreadProps {
  card: CardData;
  layout: LayoutConfig;
  /** "row" (side by side) fits wide viewports; "column" (stacked) lets
   *  the cards render larger when the available space is tall and
   *  narrow instead. */
  direction?: "row" | "column";
}

// Both faces shown right-side up, side by side, with no fold gutter —
// an easier arrangement to proof-read while editing than the
// fold-ready layout (rotated player face, gutter, DM face) that
// InitiativeCard renders for print/export. A hidden side just drops
// its column entirely.
export default function CardSpread({ card, layout, direction = "row" }: CardSpreadProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap: 16,
        alignItems: direction === "row" ? "flex-start" : "center",
      }}
    >
      {layout.player.visible && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span
            className="text-[10px] uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Player side
          </span>
          <PlayerFace
            card={card}
            rotated={false}
            width={inToPx(layout.player.widthIn)}
            height={inToPx(layout.player.heightIn)}
          />
        </div>
      )}
      {layout.dm.visible && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span
            className="text-[10px] uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            DM side
          </span>
          <DmFace
            card={card}
            width={inToPx(layout.dm.widthIn)}
            height={inToPx(layout.dm.heightIn)}
          />
        </div>
      )}
    </div>
  );
}
