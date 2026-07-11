"use client";

import { useState, useCallback, useEffect } from "react";
import { type CardData, DEFAULT_CARD } from "@/types/card";
import CardEditor from "@/components/CardEditor";
import CardList from "@/components/CardList";
import PrintArea from "@/components/PrintArea";
import InitiativeCard from "@/components/InitiativeCard";
import { exportCard, exportAllCards, type ExportFormat } from "@/lib/exportCard";

type PrintScope = "current" | "all";
type Orientation = "portrait" | "landscape";
type PaperPreset = "a4" | "a3" | "letter" | "legal";

interface PrintSettings {
  scope: PrintScope;
  paper: PaperPreset;
  orientation: Orientation;
  marginCm: number;
  gutterCm: number;
}

const PAPER_SIZES: Record<PaperPreset, { w: number; h: number }> = {
  a4: { w: 21, h: 29.7 },
  a3: { w: 29.7, h: 42 },
  letter: { w: 21.59, h: 27.94 },
  legal: { w: 21.59, h: 35.56 },
};

const PAPER_LABELS: Record<PaperPreset, string> = {
  a4: "A4",
  a3: "A3",
  letter: "Letter",
  legal: "Legal",
};

function newCard(): CardData {
  return { ...DEFAULT_CARD, id: crypto.randomUUID(), characterName: "" };
}

export default function Home() {
  const [cards, setCards] = useState<CardData[]>(() => [
    { ...DEFAULT_CARD, id: crypto.randomUUID() },
  ]);
  const [activeId, setActiveId] = useState<string>(() => cards[0].id);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    scope: "current",
    paper: "a4",
    orientation: "landscape",
    marginCm: 1,
    gutterCm: 1,
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

  function setPrint<K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) {
    setPrintSettings((prev) => ({ ...prev, [key]: value }));
  }

  // @page reads custom properties from the document root, not from
  // #print-area, so the active print-page dimensions are pushed here.
  useEffect(() => {
    const root = document.documentElement;
    if (printSettings.scope === "current") {
      root.style.setProperty("--print-page-width", "var(--card-width)");
      root.style.setProperty(
        "--print-page-height",
        `calc(var(--card-height) * 2 + ${printSettings.gutterCm}cm)`,
      );
      root.style.setProperty("--print-page-margin", "0");
    } else {
      const { w, h } = PAPER_SIZES[printSettings.paper];
      const landscape = printSettings.orientation === "landscape";
      const width = landscape ? Math.max(w, h) : Math.min(w, h);
      const height = landscape ? Math.min(w, h) : Math.max(w, h);
      root.style.setProperty("--print-page-width", `${width}cm`);
      root.style.setProperty("--print-page-height", `${height}cm`);
      root.style.setProperty("--print-page-margin", `${printSettings.marginCm}cm`);
    }
  }, [printSettings]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(format);
      try {
        if (printSettings.scope === "all") {
          await exportAllCards(cards, format);
        } else {
          const node = document.querySelector<HTMLElement>(
            `[data-card-id="${activeId}"]`,
          );
          if (node) await exportCard(node, format, activeCard.characterName);
        }
      } catch (err) {
        console.error(`Failed to export ${format}`, err);
        alert(`Failed to export ${format.toUpperCase()}. See console for details.`);
      } finally {
        setExporting(null);
      }
    },
    [cards, activeId, activeCard, printSettings.scope],
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
          className="px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
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

          {/* Scope: governs both the Print button and the export buttons above */}
          <div className="flex rounded overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {(["current", "all"] as const).map((scope) => (
              <button
                key={scope}
                onClick={() => setPrint("scope", scope)}
                className="flex-1 py-1 text-xs font-semibold capitalize transition-colors"
                style={{
                  background: printSettings.scope === scope ? "var(--accent)" : "transparent",
                  color: printSettings.scope === scope ? "#fff" : "var(--text-muted)",
                }}
              >
                {scope === "current" ? "Current Card" : "All Cards"}
              </button>
            ))}
          </div>

          {printSettings.scope === "all" && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Paper
                </span>
                <select
                  value={printSettings.paper}
                  onChange={(e) => setPrint("paper", e.target.value as PaperPreset)}
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
              <label className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Orientation
                </span>
                <select
                  value={printSettings.orientation}
                  onChange={(e) => setPrint("orientation", e.target.value as Orientation)}
                  className="bg-[var(--surface-raised)] border rounded px-1.5 py-1 text-xs"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <label className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Margin: {printSettings.marginCm.toFixed(1)} cm
                </span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={printSettings.marginCm}
                  onChange={(e) => setPrint("marginCm", parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </label>
              <label className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Fold gutter: {printSettings.gutterCm.toFixed(1)} cm
                </span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={printSettings.gutterCm}
                  onChange={(e) => setPrint("gutterCm", parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </label>
            </div>
          )}
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
            className="no-print text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Live Preview
          </p>
          {/* Scale the card up so it's comfortable to review on screen */}
          <div className="preview-scale" style={{ transform: "scale(1.5)" }}>
            <InitiativeCard card={activeCard} gutterHeightCm={printSettings.gutterCm} />
          </div>
        </div>
      </main>

      <PrintArea
        cards={cards}
        activeId={activeId}
        scope={printSettings.scope}
        gutterHeightCm={printSettings.gutterCm}
      />
    </div>
  );
}
