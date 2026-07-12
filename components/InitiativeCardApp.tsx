"use client";

import { useCallback, useEffect, useState } from "react";
import { type CardData, type CardType, DEFAULT_CARD, DEFAULT_MONSTER_CARD } from "@/types/card";
import type { Party } from "@/types/party";
import CardEditor from "@/components/CardEditor";
import CardList from "@/components/CardList";
import PartySelector from "@/components/PartySelector";
import ConfirmModal from "@/components/ConfirmModal";
import NamePartyModal from "@/components/NamePartyModal";
import ExportArea from "@/components/ExportArea";
import CardSpread from "@/components/CardSpread";
import FoldedCardPreview from "@/components/FoldedCardPreview";
import {
  exportCard,
  exportAllCards,
  exportAllCardsAsPdf,
  type ExportFormat,
} from "@/lib/exportCard";
import { PAPER_LABELS, type Margins, type PaperPreset } from "@/lib/paperSizes";
import { loadPersistedState, savePersistedState } from "@/lib/partyStorage";

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

const GUTTER_MAX_CM = 3;

function newCard(cardType: CardType = "player"): CardData {
  const base = cardType === "monster" ? DEFAULT_MONSTER_CARD : DEFAULT_CARD;
  return { ...base, id: crypto.randomUUID(), characterName: "" };
}

function newParty(name: string): Party {
  const card = newCard();
  return { id: crypto.randomUUID(), name, cards: [card], activeCardId: card.id };
}

function defaultParties(): Party[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Untitled Party",
      cards: [{ ...DEFAULT_CARD }],
      activeCardId: DEFAULT_CARD.id,
    },
  ];
}

export default function InitiativeCardApp() {
  const [parties, setParties] = useState<Party[]>(() => {
    const persisted = loadPersistedState();
    return persisted?.parties ?? defaultParties();
  });
  const [activePartyId, setActivePartyId] = useState<string>(() => {
    const persisted = loadPersistedState();
    if (persisted?.parties.some((p) => p.id === persisted.activePartyId)) {
      return persisted.activePartyId;
    }
    return persisted?.parties[0]?.id ?? parties[0].id;
  });

  const [gutterCm, setGutterCm] = useState(1);

  const [exportScope, setExportScope] = useState<ExportScope>("current");
  const [exportChoice, setExportChoice] = useState<ExportChoice>("png");
  const [exporting, setExporting] = useState(false);

  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    paper: "a4",
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  });

  const [partyPendingDelete, setPartyPendingDelete] = useState<Party | null>(
    null,
  );
  const [namingPartyId, setNamingPartyId] = useState<string | null>(null);

  useEffect(() => {
    savePersistedState({ parties, activePartyId });
  }, [parties, activePartyId]);

  const activeParty = parties.find((p) => p.id === activePartyId) ?? parties[0];
  const activeCard =
    activeParty.cards.find((c) => c.id === activeParty.activeCardId) ??
    activeParty.cards[0];

  const handleChange = useCallback(
    (updated: CardData) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id !== activeParty.id
            ? p
            : { ...p, cards: p.cards.map((c) => (c.id === updated.id ? updated : c)) },
        ),
      );
    },
    [activeParty.id],
  );

  const handleAddCard = useCallback(
    (cardType: CardType) => {
      const card = newCard(cardType);
      setParties((prev) =>
        prev.map((p) =>
          p.id !== activeParty.id
            ? p
            : { ...p, cards: [...p.cards, card], activeCardId: card.id },
        ),
      );
    },
    [activeParty.id],
  );

  const handleRemoveCard = useCallback(
    (id: string) => {
      setParties((prev) =>
        prev.map((p) => {
          if (p.id !== activeParty.id) return p;
          if (p.cards.length <= 1) return p;
          const cards = p.cards.filter((c) => c.id !== id);
          const activeCardId =
            id === p.activeCardId ? cards[0].id : p.activeCardId;
          return { ...p, cards, activeCardId };
        }),
      );
    },
    [activeParty.id],
  );

  const handleSelectCard = useCallback(
    (id: string) => {
      setParties((prev) =>
        prev.map((p) => (p.id !== activeParty.id ? p : { ...p, activeCardId: id })),
      );
    },
    [activeParty.id],
  );

  const handleAddParty = useCallback(() => {
    const party = newParty("Untitled Party");
    setParties((prev) => [...prev, party]);
    setActivePartyId(party.id);
    setNamingPartyId(party.id);
  }, []);

  const handleRenameParty = useCallback((id: string, name: string) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name || "Untitled Party" } : p)),
    );
  }, []);

  const handleConfirmDeleteParty = useCallback(() => {
    if (!partyPendingDelete) return;
    const deletedId = partyPendingDelete.id;
    setParties((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((p) => p.id !== deletedId);
      if (deletedId === activePartyId) setActivePartyId(next[0].id);
      return next;
    });
    setPartyPendingDelete(null);
  }, [partyPendingDelete, activePartyId]);

  function setMargin(side: MarginSide, value: number) {
    setPdfSettings((prev) => ({
      ...prev,
      margins: { ...prev.margins, [side]: value },
    }));
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
        await exportAllCardsAsPdf(
          activeParty.cards,
          pdfSettings.paper,
          pdfSettings.margins,
          gutterCm,
        );
      } else if (exportScope === "all") {
        await exportAllCards(activeParty.cards, exportChoice);
      } else {
        const node = document.querySelector<HTMLElement>(
          `[data-card-id="${activeCard.id}"]`,
        );
        if (node)
          await exportCard(node, exportChoice, activeCard.characterName);
      }
    } catch (err) {
      console.error(`Failed to export ${exportChoice}`, err);
      alert(
        `Failed to export ${exportChoice.toUpperCase()}. See console for details.`,
      );
    } finally {
      setExporting(false);
    }
  }, [
    activeParty.cards,
    activeCard,
    exportScope,
    exportChoice,
    pdfSettings,
    gutterCm,
  ]);

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
            <span
              className="text-[10px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Fold gutter: {gutterCm.toFixed(1)} cm
            </span>
            <input
              type="range"
              min={0}
              max={GUTTER_MAX_CM}
              step={0.1}
              value={gutterCm}
              onChange={(e) => setGutterCm(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
          <div className="flex justify-center items-start gap-10 mt-2">
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Player side
              </span>
              <FoldedCardPreview
                card={activeCard}
                gutterHeightCm={gutterCm}
                maxGutterHeightCm={GUTTER_MAX_CM}
                face="player"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                DM side
              </span>
              <FoldedCardPreview
                card={activeCard}
                gutterHeightCm={gutterCm}
                maxGutterHeightCm={GUTTER_MAX_CM}
                face="dm"
                mirrored
              />
            </div>
          </div>

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
                onChange={(e) =>
                  handleFormatChange(e.target.value as ExportChoice)
                }
                className="bg-[var(--surface-raised)] border rounded px-1.5 py-1.5 text-xs uppercase"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
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
                  const disabled =
                    scope === "current" && exportChoice === "pdf";
                  return (
                    <button
                      key={scope}
                      onClick={() => !disabled && setExportScope(scope)}
                      disabled={disabled}
                      className="flex-1 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background:
                          exportScope === scope
                            ? "var(--accent)"
                            : "transparent",
                        color:
                          exportScope === scope ? "#fff" : "var(--text-muted)",
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
                  <span
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Paper (portrait — card orientation auto-fits)
                  </span>
                  <select
                    value={pdfSettings.paper}
                    onChange={(e) =>
                      setPdfSettings((prev) => ({
                        ...prev,
                        paper: e.target.value as PaperPreset,
                      }))
                    }
                    className="bg-[var(--surface-raised)] border rounded px-1.5 py-1 text-xs"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
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
                    <span
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {label} margin (cm)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={pdfSettings.margins[side]}
                      onChange={(e) =>
                        setMargin(side, parseFloat(e.target.value) || 0)
                      }
                      className="bg-[var(--surface-raised)] border rounded px-1.5 py-1 text-xs"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <PartySelector
          parties={parties}
          activePartyId={activeParty.id}
          onSelect={setActivePartyId}
          onAdd={handleAddParty}
          onRename={handleRenameParty}
          onRequestDelete={(id) => {
            const party = parties.find((p) => p.id === id);
            if (party) setPartyPendingDelete(party);
          }}
        />

        <CardList
          cards={activeParty.cards}
          activeId={activeCard.id}
          onSelect={handleSelectCard}
          onAdd={handleAddCard}
          onRemove={handleRemoveCard}
        />

        <div className="flex-1 overflow-y-auto">
          <CardEditor card={activeCard} onChange={handleChange} />
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-8">
        {/* Scale the spread up so it's comfortable to review on screen */}
        <div style={{ transform: "scale(1.5)" }}>
          <CardSpread card={activeCard} />
        </div>
      </main>

      <ExportArea cards={activeParty.cards} gutterHeightCm={gutterCm} />

      {partyPendingDelete && (
        <ConfirmModal
          title="Delete party"
          message={`Delete "${partyPendingDelete.name}"? This will remove all ${partyPendingDelete.cards.length} card(s) in it. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDeleteParty}
          onCancel={() => setPartyPendingDelete(null)}
        />
      )}

      {namingPartyId && (
        <NamePartyModal
          onConfirm={(name) => {
            handleRenameParty(namingPartyId, name);
            setNamingPartyId(null);
          }}
          onCancel={() => setNamingPartyId(null)}
        />
      )}
    </div>
  );
}
