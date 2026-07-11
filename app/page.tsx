"use client";

import { useState, useCallback } from "react";
import { type CardData, DEFAULT_CARD } from "@/types/card";
import CardEditor from "@/components/CardEditor";
import InitiativeCard from "@/components/InitiativeCard";
import { exportCard, type ExportFormat } from "@/lib/exportCard";

export default function Home() {
  const [card, setCard] = useState<CardData>(DEFAULT_CARD);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleChange = useCallback((updated: CardData) => {
    setCard(updated);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const node = document.getElementById("print-area");
      if (!node) return;
      setExporting(format);
      try {
        await exportCard(node, format, card.characterName);
      } catch (err) {
        console.error(`Failed to export ${format}`, err);
        alert(`Failed to export ${format.toUpperCase()}. See console for details.`);
      } finally {
        setExporting(null);
      }
    },
    [card.characterName],
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <aside
        className="no-print flex flex-col w-72 shrink-0 border-r overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-3 border-b shrink-0 flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h1
              className="text-sm font-bold tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              Initiative Cards
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              D&amp;D 5e DM Screen
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(["svg", "png", "jpeg"] as const).map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exporting !== null}
                className="px-2 py-1.5 rounded text-xs font-semibold uppercase transition-colors disabled:opacity-50"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                }}
              >
                {exporting === format ? "…" : format}
              </button>
            ))}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Print
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <CardEditor card={card} onChange={handleChange} />
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p
            className="no-print text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Live Preview
          </p>
          {/* Scale the card up so it's comfortable to review on screen */}
          <div className="preview-scale" style={{ transform: "scale(1.5)" }}>
            <InitiativeCard card={card} />
          </div>
        </div>
      </main>
    </div>
  );
}
