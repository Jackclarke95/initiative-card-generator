import type { CardData } from "@/types/card";

export interface Party {
  id: string;
  name: string;
  cards: CardData[];
  activeCardId: string;
}
