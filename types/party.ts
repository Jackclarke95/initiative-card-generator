import type { CardData } from "@/types/card";
import type { LayoutConfig } from "@/lib/cardLayout";

export interface Party {
  id: string;
  name: string;
  cards: CardData[];
  activeCardId: string;
  /** Shared Player/DM size, height, and visibility defaults for every card
   *  in this party — individual cards may override one or both sides
   *  (see CardData.layoutOverride). */
  layout: LayoutConfig;
}
