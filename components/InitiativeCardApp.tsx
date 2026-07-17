"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type CardData, emptyCard } from "@/types/card";
import type { Party } from "@/types/party";
import CardEditor from "@/components/CardEditor";
import CardList from "@/components/CardList";
import PartySelector from "@/components/PartySelector";
import ConfirmModal from "@/components/ConfirmModal";
import NamePartyModal from "@/components/NamePartyModal";
import ExportArea from "@/components/ExportArea";
import CardSpread from "@/components/CardSpread";
import { CardEditProvider } from "@/components/CardEditContext";
import FoldedCardPreview from "@/components/FoldedCardPreview";
import InfoTooltip from "@/components/InfoTooltip";
import SegmentedToggle from "@/components/SegmentedToggle";
import SideLayoutFields, { WidthMismatchWarning } from "@/components/SideLayoutFields";
import ThemeToggle from "@/components/ThemeToggle";
import {
  contentBoxIn,
  exportCard,
  exportAllCards,
  exportAllCardsAsPdf,
  fitsPage,
  type ExportFormat,
} from "@/lib/exportCard";
import {
  defaultLayoutConfig,
  resolveLayout,
  unitFootprintIn,
  type SideLayoutConfig,
} from "@/lib/cardLayout";
import { stepValueOnWheel } from "@/lib/sliderWheel";
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

// The center preview scales the whole card spread up or down to fill
// whatever space is available: never bigger than the original
// "comfortable to review" 2x, never smaller than true size (1x) —
// below that the cards read as tiny rather than just compact.
const PREVIEW_MAX_SCALE = 2;
const PREVIEW_MIN_SCALE = 1;

// The two off-screen CardSpreads below exist only to measure the spread's
// natural footprint (see the ResizeObserver effect) — every card face
// renders into a fixed FACE_W×FACE_H box regardless of its content (that's
// the whole point of a print-ready fixed-size card), so that footprint
// never actually changes on a field edit, a vitals reorder, or a display
// toggle, only on `direction`. Without this memo they still re-rendered
// (and re-ran every child's own effects, including the vitals FLIP
// animation's) on every keystroke or drag, which is where the perceptible
// lag on those interactions was actually coming from — not the animation
// itself. The visible, on-screen CardSpread a few lines down is left
// unmemoized; it has to reflect every edit immediately.
const MeasureSpread = memo(
  CardSpread,
  (prev, next) => prev.direction === next.direction && prev.layout === next.layout,
);

function newCard(): CardData {
  return emptyCard(crypto.randomUUID());
}

function newParty(name: string): Party {
  const card = newCard();
  return {
    id: crypto.randomUUID(),
    name,
    cards: [card],
    activeCardId: card.id,
    layout: defaultLayoutConfig(),
  };
}

function defaultParties(): Party[] {
  const card = newCard();
  return [
    {
      id: crypto.randomUUID(),
      name: "Untitled Party",
      cards: [card],
      activeCardId: card.id,
      layout: defaultLayoutConfig(),
    },
  ];
}

// Sessions persisted before per-side layout config existed won't have a
// `layout` field — fill in the default rather than discarding the party.
function normalizeParty(party: Party): Party {
  return party.layout ? party : { ...party, layout: defaultLayoutConfig() };
}

export default function InitiativeCardApp() {
  const [parties, setParties] = useState<Party[]>(() => {
    const persisted = loadPersistedState();
    return (persisted?.parties ?? defaultParties()).map(normalizeParty);
  });
  const [activePartyId, setActivePartyId] = useState<string>(() => {
    const persisted = loadPersistedState();
    if (persisted?.parties.some((p) => p.id === persisted.activePartyId)) {
      return persisted.activePartyId;
    }
    return persisted?.parties[0]?.id ?? parties[0].id;
  });

  // Live preview sizing: measure the available box in the center pane
  // against the spread's natural (unscaled) footprint in both a
  // side-by-side and a stacked arrangement, then pick whichever
  // direction lets the cards render biggest, clamped to a sensible
  // scale range.
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const rowMeasureRef = useRef<HTMLDivElement>(null);
  const columnMeasureRef = useRef<HTMLDivElement>(null);
  const [previewLayout, setPreviewLayout] = useState<{
    scale: number;
    direction: "row" | "column";
  }>({ scale: PREVIEW_MAX_SCALE, direction: "row" });

  useLayoutEffect(() => {
    const box = previewBoxRef.current;
    const rowEl = rowMeasureRef.current;
    const columnEl = columnMeasureRef.current;
    if (!box || !rowEl || !columnEl) return;

    const recompute = () => {
      const availW = box.clientWidth;
      const availH = box.clientHeight;
      const rowW = rowEl.scrollWidth;
      const rowH = rowEl.scrollHeight;
      const columnW = columnEl.scrollWidth;
      const columnH = columnEl.scrollHeight;
      if (!availW || !availH || !rowW || !rowH || !columnW || !columnH) return;

      const rowScale = Math.min(availW / rowW, availH / rowH);
      const columnScale = Math.min(availW / columnW, availH / columnH);
      const direction = columnScale > rowScale ? "column" : "row";
      const rawScale = direction === "column" ? columnScale : rowScale;

      setPreviewLayout({
        scale: Math.min(
          PREVIEW_MAX_SCALE,
          Math.max(PREVIEW_MIN_SCALE, rawScale),
        ),
        direction,
      });
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

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
  const [confirmingResetCard, setConfirmingResetCard] = useState(false);

  useEffect(() => {
    savePersistedState({ parties, activePartyId });
  }, [parties, activePartyId]);

  const activeParty = parties.find((p) => p.id === activePartyId) ?? parties[0];
  const activeCard =
    activeParty.cards.find((c) => c.id === activeParty.activeCardId) ??
    activeParty.cards[0];

  // Stable unless the party's shared layout or this card's own override
  // actually changes — unrelated field edits (name, vitals, …) leave both
  // references untouched, so this doesn't defeat CardSpread/InitiativeCard's
  // own memoization on every keystroke. Deps are deliberately narrower than
  // `activeParty`/`activeCard` themselves — resolveLayout only ever reads
  // these two nested fields.
  const effectiveLayout = useMemo(
    () => resolveLayout(activeParty, activeCard),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeParty.layout, activeCard.layoutOverride],
  );
  const bothSidesVisible =
    effectiveLayout.player.visible && effectiveLayout.dm.visible;

  // How many cards in the party won't fit the current PDF page size and
  // margins, even rotated — computed from each card's own configured
  // size (not a DOM measurement, so it updates live as paper/margins
  // change, before any export actually runs).
  const oversizedCardCount = useMemo(() => {
    const { contentWidthIn, contentHeightIn } = contentBoxIn(
      pdfSettings.paper,
      pdfSettings.margins,
    );
    return activeParty.cards.reduce((count, card) => {
      const { widthIn, heightIn } = unitFootprintIn(
        resolveLayout(activeParty, card),
      );
      return fitsPage(widthIn, heightIn, contentWidthIn, contentHeightIn)
        ? count
        : count + 1;
    }, 0);
  }, [activeParty, pdfSettings]);

  const updatePartyLayoutSide = useCallback(
    (side: "player" | "dm", next: SideLayoutConfig) => {
      setParties((prev) =>
        prev.map((p) => {
          if (p.id !== activeParty.id) return p;
          // At least one side must stay visible.
          const otherVisible =
            side === "player" ? p.layout.dm.visible : p.layout.player.visible;
          if (!next.visible && !otherVisible) return p;
          return { ...p, layout: { ...p.layout, [side]: next } };
        }),
      );
    },
    [activeParty.id],
  );

  const updatePartyGutterCm = useCallback(
    (gutterCm: number) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id !== activeParty.id
            ? p
            : { ...p, layout: { ...p.layout, gutterCm } },
        ),
      );
    },
    [activeParty.id],
  );

  const handleChange = useCallback(
    (updated: CardData) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id !== activeParty.id
            ? p
            : {
                ...p,
                cards: p.cards.map((c) => (c.id === updated.id ? updated : c)),
              },
        ),
      );
    },
    [activeParty.id],
  );

  const handleAddCard = useCallback(() => {
    const card = newCard();
    setParties((prev) =>
      prev.map((p) =>
        p.id !== activeParty.id
          ? p
          : { ...p, cards: [...p.cards, card], activeCardId: card.id },
      ),
    );
  }, [activeParty.id]);

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

  const handleConfirmResetCard = useCallback(() => {
    setParties((prev) =>
      prev.map((p) =>
        p.id !== activeParty.id
          ? p
          : {
              ...p,
              cards: p.cards.map((c) =>
                c.id === activeCard.id ? emptyCard(c.id) : c,
              ),
            },
      ),
    );
    setConfirmingResetCard(false);
  }, [activeParty.id, activeCard.id]);

  const handleSelectCard = useCallback(
    (id: string) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id !== activeParty.id ? p : { ...p, activeCardId: id },
        ),
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
      prev.map((p) =>
        p.id === id ? { ...p, name: name || "Untitled Party" } : p,
      ),
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
  ]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Left: card configuration */}
      <aside
        className="flex flex-col w-[28.6rem] shrink-0 border-r overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
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

        <div className="flex-1 overflow-y-auto">
          <CardEditor
            card={activeCard}
            onChange={handleChange}
            effectiveLayout={effectiveLayout}
          />
        </div>
      </aside>

      {/* Center: live preview — scaled to fill whatever space is
          available, side by side or stacked, whichever renders bigger. */}
      <main className="flex-1 overflow-auto p-8">
        <div
          ref={previewBoxRef}
          className="w-full h-full flex items-center justify-center"
        >
          <div style={{ transform: `scale(${previewLayout.scale})` }}>
            <CardEditProvider card={activeCard} onChange={handleChange}>
              <CardSpread
                card={activeCard}
                layout={effectiveLayout}
                direction={previewLayout.direction}
              />
            </CardEditProvider>
          </div>
        </div>

        {/* Off-screen, unscaled copies used only to measure the
            spread's natural footprint in each direction. The wrapper is
            pinned to zero size with overflow hidden so it can never
            grow the page's scrollable area; each measured child gets an
            explicit max-content width so it reports its true natural
            size instead of being squeezed to fit the zero-width
            wrapper. */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <div ref={rowMeasureRef} style={{ width: "max-content" }}>
            <MeasureSpread card={activeCard} layout={effectiveLayout} direction="row" />
          </div>
          <div ref={columnMeasureRef} style={{ width: "max-content" }}>
            <MeasureSpread card={activeCard} layout={effectiveLayout} direction="column" />
          </div>
        </div>
      </main>

      {/* Right: page & export configuration */}
      <aside
        className="flex flex-col w-[23.4rem] shrink-0 border-l overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-3 border-b shrink-0 flex items-start justify-between gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              className="text-sm font-bold tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              Print &amp; Export
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Fold layout, paper, and file output
            </p>
          </div>
          <ThemeToggle />
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
          onReset={() => setConfirmingResetCard(true)}
        />

        <div className="px-4 py-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
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
              <SegmentedToggle
                className="flex-1"
                options={[
                  {
                    value: "current",
                    label: "Current Card",
                    disabled: exportChoice === "pdf",
                  },
                  { value: "all", label: "All Cards" },
                ]}
                value={exportScope}
                onChange={setExportScope}
              />
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
              <>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <label className="flex flex-col gap-0.5 col-span-2">
                    <span
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Page size
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
                {oversizedCardCount > 0 && (
                  <p
                    className="text-[11px] leading-snug"
                    style={{ color: "var(--accent)" }}
                  >
                    ⚠ {oversizedCardCount} card
                    {oversizedCardCount > 1 ? "s" : ""} won&apos;t fit within
                    this page size and margins, even rotated. Increase the
                    page size, shrink the margins, or reduce the card&apos;s
                    own size.
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className="pt-3 border-t flex flex-col gap-4"
            style={{ borderColor: "var(--border)" }}
          >
            <SideLayoutFields
              label="Player side"
              value={activeParty.layout.player}
              onChange={(next) => updatePartyLayoutSide("player", next)}
            />
            <SideLayoutFields
              label="DM side"
              value={activeParty.layout.dm}
              onChange={(next) => updatePartyLayoutSide("dm", next)}
            />

            {/* The fold and its gutter only mean anything once both sides
                are actually present — a single visible side just *is* the
                card, with nothing to fold against. */}
            {bothSidesVisible && (
              <>
                <label className="flex flex-col gap-0.5">
                  <span
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Fold gutter: {activeParty.layout.gutterCm.toFixed(1)} cm
                    <InfoTooltip text="Sets the blank strip between the two faces so the printed sheet folds around the thickness of your DM screen. Leave at 0 for a flat, two-sided card with no gap." />
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={GUTTER_MAX_CM}
                    step={0.1}
                    value={activeParty.layout.gutterCm}
                    onChange={(e) => updatePartyGutterCm(parseFloat(e.target.value))}
                    onWheel={(e) =>
                      updatePartyGutterCm(
                        stepValueOnWheel(e, activeParty.layout.gutterCm, 0.1, 0, GUTTER_MAX_CM),
                      )
                    }
                    className="w-full accent-[var(--accent)]"
                  />
                </label>
                <div className="flex justify-center items-start gap-10">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Player side
                    </span>
                    <FoldedCardPreview
                      card={activeCard}
                      gutterHeightCm={effectiveLayout.gutterCm}
                      maxGutterHeightCm={GUTTER_MAX_CM}
                      widthIn={effectiveLayout.player.widthIn}
                      heightIn={effectiveLayout.player.heightIn}
                      backWidthIn={effectiveLayout.dm.widthIn}
                      backHeightIn={effectiveLayout.dm.heightIn}
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
                      gutterHeightCm={effectiveLayout.gutterCm}
                      maxGutterHeightCm={GUTTER_MAX_CM}
                      widthIn={effectiveLayout.dm.widthIn}
                      heightIn={effectiveLayout.dm.heightIn}
                      backWidthIn={effectiveLayout.player.widthIn}
                      backHeightIn={effectiveLayout.player.heightIn}
                      face="dm"
                      mirrored
                    />
                  </div>
                </div>
                <WidthMismatchWarning layout={activeParty.layout} />
              </>
            )}
          </div>
        </div>
      </aside>

      <ExportArea cards={activeParty.cards} party={activeParty} />

      {partyPendingDelete && (
        <ConfirmModal
          title="Delete party"
          message={`Delete "${partyPendingDelete.name}"? This will remove all ${partyPendingDelete.cards.length} card(s) in it. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDeleteParty}
          onCancel={() => setPartyPendingDelete(null)}
        />
      )}

      {confirmingResetCard && (
        <ConfirmModal
          title="Reset card"
          message="Reset this card to a blank state? This cannot be undone."
          confirmLabel="Reset"
          onConfirm={handleConfirmResetCard}
          onCancel={() => setConfirmingResetCard(false)}
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
