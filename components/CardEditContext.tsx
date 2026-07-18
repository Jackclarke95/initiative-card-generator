"use client";

// Carries "this face is editable" down to CardFaces without threading props
// through CardSpread. The default is { editable: false, update: null }, so any
// face rendered OUTSIDE a provider is inert — that's what keeps the off-screen
// measurement copies, the folded preview, and the export layout static (and
// therefore keeps exported images clean). Only the on-screen center preview is
// wrapped in CardEditProvider.

import { createContext, useContext, useMemo } from "react";
import { createCardUpdater, type CardUpdater } from "@/lib/cardUpdate";
import type { CardData } from "@/types/card";

interface CardEditContextValue {
  editable: boolean;
  update: CardUpdater | null;
}

const CardEditContext = createContext<CardEditContextValue>({
  editable: false,
  update: null,
});

export function useCardEdit(): CardEditContextValue {
  return useContext(CardEditContext);
}

export function CardEditProvider({
  card,
  onChange,
  maxVitalColumns,
  children,
}: {
  card: CardData;
  onChange: (card: CardData) => void;
  /** How many vital columns actually fit at this card's current DM-face
   *  width — see lib/vitalsLayout.ts's maxVitalColumns. Threaded through to
   *  createCardUpdater so inline edits (drag-reordering vitals on the DM
   *  face) cascade row overflow against the same ceiling the sidebar form
   *  uses. */
  maxVitalColumns: number;
  children: React.ReactNode;
}) {
  const value = useMemo<CardEditContextValue>(
    () => ({
      editable: true,
      update: createCardUpdater(card, onChange, maxVitalColumns),
    }),
    [card, onChange, maxVitalColumns],
  );
  return (
    <CardEditContext.Provider value={value}>
      {children}
    </CardEditContext.Provider>
  );
}
