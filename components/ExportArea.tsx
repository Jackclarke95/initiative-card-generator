"use client";

import type { CardData } from "@/types/card";
import InitiativeCard from "@/components/InitiativeCard";

interface ExportAreaProps {
  cards: CardData[];
  gutterHeightCm: number;
}

// Off-screen (not display:none — html-to-image/jsPDF need the nodes
// actually laid out to rasterize them) home for every card's DOM, so
// any export action (single file, zip, or PDF) can find a card's node
// by data-card-id regardless of which card is being edited on screen.
export default function ExportArea({ cards, gutterHeightCm }: ExportAreaProps) {
  return (
    <div id="export-area">
      {cards.map((card) => (
        <div key={card.id} data-card-id={card.id}>
          <InitiativeCard card={card} gutterHeightCm={gutterHeightCm} />
        </div>
      ))}
    </div>
  );
}
