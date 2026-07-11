"use client";

import type { CardData } from "@/types/card";
import InitiativeCard from "@/components/InitiativeCard";

interface PrintAreaProps {
  cards: CardData[];
  activeId: string;
  scope: "current" | "all";
  gutterHeightCm: number;
}

// Kept off-screen (not display:none — html-to-image needs the nodes
// actually laid out to rasterize them for export) and only brought
// on-screen by the @media print rules in globals.css.
export default function PrintArea({
  cards,
  activeId,
  scope,
  gutterHeightCm,
}: PrintAreaProps) {
  return (
    <div id="print-area" className={scope === "all" ? "mode-all" : "mode-current"}>
      {cards.map((card) => (
        <div
          key={card.id}
          data-card-id={card.id}
          style={{
            display: scope === "all" || card.id === activeId ? undefined : "none",
          }}
        >
          <InitiativeCard card={card} gutterHeightCm={gutterHeightCm} />
        </div>
      ))}
    </div>
  );
}
