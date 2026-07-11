"use client";

import { useState, useCallback } from "react";
import { type CardData, DEFAULT_CARD } from "@/types/card";
import CardEditor from "@/components/CardEditor";
import CardList from "@/components/CardList";
import ExportArea from "@/components/ExportArea";
import InitiativeCard from "@/components/InitiativeCard";
import {
  exportCard,
  exportAllCards,
  exportAllCardsAsPdf,
  type ExportFormat,
} from "@/lib/exportCard";
import { PAPER_LABELS, type Margins, type PaperPreset } from "@/lib/paperSizes";

type ExportScope = "current" | "all";
type ExportChoice = ExportFormat | "pdf";
type MarginSide = keyof Margins;

interface PdfSettings {
  paper: PaperPreset;
  margins: Margins;
}

const MARGIN_SIDES: { side: MarginSide; label: string }[] = [
  { side: "top", label: "Top" },
  { side: "bottom", label: "Bottom" },
  { side: "left", label: "Left" },
  { side: "right", label: "Right" },
];

function newCard(): CardData {
  return { ...DEFAULT_CARD, id: crypto.randomUUID(), characterName: "" };
}

export default function Home() {
  const [cards, setCards] = useState<CardData[]>(() => [
    { ...DEFAULT_CARD, id: crypto.randomUUID() },
  ]);
  const [activeId, setActiveId] = useState<string>(() => cards[0].id);
  const [gutterCm, setGutterCm] = useState(1);

  const [exportScope, setExportScope] = useState<ExportScope>("current");
  const [exportChoice, setExportChoice] = useState<ExportChoice>("png");
  const [exporting, setExporting] = useState(false);

  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    paper: "a4",
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  });

  const activeCard = cards.find((c) => c.id === activeId) ?? cards[0];

  const handleChange = useCallback(
    (updated: CardData) => {
      setCards((prev) => prev.map((c) => (c.id === activeId ? updated : c)));
    },
    [activeId],
  );

  const handleAddCard = useCallback(() => {
    const card = newCard();
    setCards((prev) => [...prev, card]);
    setActiveId(card.id);
  }, []);

  const handleDuplicateCard = useCallback((id: string) => {
    const copyId = crypto.randomUUID();
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, { ...prev[idx], id: copyId });
      return next;
    });
    setActiveId(copyId);
  }, []);

  const handleRemoveCard = useCallback(
    (id: string) => {
      setCards((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  function setMargin(side: MarginSide, value: number) {
    setPdfSettings((prev) => ({ ...prev, margins: { ...prev.margins, [side]: value } }));
  }

  // PDF always covers the whole deck, so picking it forces (and locks)
  // the scope toggle to "All" — there's no such thing as a single-card
  // PDF here.
  function handleFormatChange(choice: ExportChoice) {
    setExportChoice(choice);
    if (choice === "pdf") setExportScope("all");
  }

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      if (exportChoice === "pdf") {
        await exportAllCardsAsPdf(cards, pdfSettings.paper, pdfSettings.margins, gutterCm);
      } else if (exportScope === "all") {
        await exportAllCards(cards, exportChoice);
      } else {
        const node = document.querySelector<HTMLElement>(
          `[data-card-id="${activeId}"]`,
        );
        if (node) await exportCard(node, exportChoice, activeCard.characterName);
      }
    } catch (err) {
      console.error(`Failed to export ${exportChoice}`, err);
      alert(`Failed to export ${exportChoice.toUpperCase()}. See console for details.`);
    } finally {
      setExporting(false);
    }
  }, [cards, activeId, activeCard, exportScope, exportChoice, pdfSettings, gutterCm]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col w-72 shrink-0 border-r overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mb-3">
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

          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Fold gutter: {gutterCm.toFixed(1)} cm
            </span>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={gutterCm}
              onChange={(e) => setGutterCm(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <div
            className="mt-3 pt-3 border-t flex flex-col gap-2"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Export As
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={exportChoice}
                onChange={(e) => handleFormatChange(e.target.value as ExportChoice)}
                className="bg-[var(--surface-raised)] border rounded px-1.5 py-1.5 text-xs uppercase"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="svg">SVG</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="pdf">PDF</option>
              </select>
              <div
                className="flex rounded overflow-hidden border flex-1"
                style={{ borderColor: "var(--border)" }}
              >
                {(["current", "all"] as const).map((scope) => {
                  const disabled = scope === "current" && exportChoice === "pdf";
                  return (
                    <button
                      key={scope}
                      onClick={() => !disabled && setExportScope(scope)}
                      disabled={disabled}
                      className="flex-1 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: exportScope === scope ? "var(--accent)" : "transparent",
                        color: exportScope === scope ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {scope === "current" ? "Current" : "All"}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-2.5 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {exporting ? "…" : "Export"}
              </button>
            </div>

            {exportChoice === "pdf" && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <label className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Paper (portrait — card orientation auto-fits)
                  </span>
                  <select
                    value={pdfSettings.paper}
                    onChange={(e) =>
                      setPdfSettings((prev) => ({ ...prev, paper: e.target.value as PaperPreset }))
                    }
                    className="bg-[var(--surface-raised)] border rounded px-1.5 py-1 text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    {(Object.keys(PAPER_LABELS) as PaperPreset[]).map((p) => (
                      <option key={p} value={p}>
                        {PAPER_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </label>
                {MARGIN_SIDES.map(({ side, label }) => (
                  <label key={side} className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      {label} margin (cm)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={pdfSettings.margins[side]}
                      onChange={(e) => setMargin(side, parseFloat(e.target.value) || 0)}
                      className="bg-[var(--surface-raised)] border rounded px-1.5 py-1 text-xs"
                      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <CardList
          cards={cards}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={handleAddCard}
          onDuplicate={handleDuplicateCard}
          onRemove={handleRemoveCard}
        />

        <div className="flex-1 overflow-y-auto">
          <CardEditor card={activeCard} onChange={handleChange} />
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Live Preview
          </p>
          {/* Scale the card up so it's comfortable to review on screen */}
          <div style={{ transform: "scale(1.5)" }}>
            <InitiativeCard card={activeCard} gutterHeightCm={gutterCm} />
          </div>
        </div>
      </main>

      <ExportArea cards={cards} gutterHeightCm={gutterCm} />
    </div>
  );
}
