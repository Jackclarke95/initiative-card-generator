"use client";

import type { CardData } from "@/types/card";
import type { Party } from "@/types/party";
import InitiativeCard from "@/components/InitiativeCard";
import { resolveLayout } from "@/lib/cardLayout";

interface ExportAreaProps {
  cards: CardData[];
  party: Party;
}

// Off-screen (not display:none — html-to-image/jsPDF need the nodes
// actually laid out to rasterize them) home for every card's DOM, so
// any export action (single file, zip, or PDF) can find a card's node
// by data-card-id regardless of which card is being edited on screen.
export default function ExportArea({ cards, party }: ExportAreaProps) {
  return (
    <div id="export-area">
      {cards.map((card) => (
        <div key={card.id} data-card-id={card.id}>
          <InitiativeCard card={card} layout={resolveLayout(party, card)} />
        </div>
      ))}
    </div>
  );
}
