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
  children,
}: {
  card: CardData;
  onChange: (card: CardData) => void;
  children: React.ReactNode;
}) {
  const value = useMemo<CardEditContextValue>(
    () => ({ editable: true, update: createCardUpdater(card, onChange) }),
    [card, onChange],
  );
  return (
    <CardEditContext.Provider value={value}>
      {children}
    </CardEditContext.Provider>
  );
}
