"use client";

import type { CardData } from "@/types/card";

interface CardListProps {
  cards: CardData[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CardList({
  cards,
  activeId,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
}: CardListProps) {
  return (
    <div
      className="no-print px-4 py-3 border-b shrink-0"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          Cards ({cards.length})
        </h2>
        <button
          onClick={onAdd}
          className="px-2 py-1 rounded text-xs font-semibold"
          style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
        >
          + Add
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors"
            style={{
              background: card.id === activeId ? "var(--accent)" : "var(--surface-raised)",
              color: card.id === activeId ? "#fff" : "var(--text-primary)",
            }}
          >
            <span className="truncate">{card.characterName || "Untitled"}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(card.id);
                }}
                title="Duplicate"
                className="w-5 h-5 flex items-center justify-center rounded opacity-80 hover:opacity-100"
              >
                ⧉
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(card.id);
                }}
                title="Remove"
                disabled={cards.length <= 1}
                className="w-5 h-5 flex items-center justify-center rounded opacity-80 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
