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
import ConfirmModal from "@/components/ConfirmModal";
import NamePartyModal from "@/components/NamePartyModal";
import ExportArea from "@/components/ExportArea";
import CardSpread from "@/components/CardSpread";
import { PlayerFace, DmFace } from "@/components/CardFaces";
import { CardEditProvider } from "@/components/CardEditContext";
import PrintExportPanel, {
  type ExportChoice,
  type ExportScope,
  type PdfSettings,
} from "@/components/PrintExportPanel";
import MobileTabBar, { type MobileTab } from "@/components/MobileTabBar";
import {
  contentBoxIn,
  exportCard,
  exportAllCards,
  exportAllCardsAsPdf,
  fitsPage,
} from "@/lib/exportCard";
import {
  defaultLayoutConfig,
  inToPx,
  resolveLayout,
  unitFootprintIn,
  type SideLayoutConfig,
} from "@/lib/cardLayout";
import type { Margins, PaperPreset } from "@/lib/paperSizes";
import {
  loadPersistedState,
  savePersistedState,
  type PersistedState,
} from "@/lib/partyStorage";
import defaultPartyData from "@/lib/data/defaultParty.json";

type MarginSide = keyof Margins;

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
  (prev, next) =>
    prev.direction === next.direction && prev.layout === next.layout,
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

// A pre-filled sample party (see lib/data/defaultParty.json) rather than a
// blank card — gives a fresh, first-visit session something to look at.
function defaultParties(): Party[] {
  return (defaultPartyData as unknown as PersistedState).parties;
}

// Sessions persisted before per-side layout config existed won't have a
// `layout` field — fill in the default rather than discarding the party.
function normalizeParty(party: Party): Party {
  return party.layout ? party : { ...party, layout: defaultLayoutConfig() };
}

// Mobile "Player Face"/"DM Face" tabs — a single face scaled to exactly
// fill the viewport's width, whichever way that goes: shrinking a card
// that's wider than the screen, but also growing one that's narrower,
// rather than leaving it stranded at true size with empty margin on
// either side. Growing can make a card taller than the screen, which is
// fine — it just scrolls vertically. Rendered outside any CardEditProvider
// (the default context is `{ editable: false }`), so unlike the desktop
// center preview it's read-only — purely a reflection of the form's
// current state.
function MobileFacePreview({
  card,
  layout,
  face,
}: {
  card: CardData;
  layout: SideLayoutConfig;
  face: "player" | "dm";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const width = inToPx(layout.widthIn);
  const height = inToPx(layout.heightIn);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !layout.visible) return;

    const recompute = () => {
      // clientWidth includes this element's own left/right padding (the
      // "small margin" around the card) — subtract it back out so the
      // card is sized to the space actually left over, not the padding
      // along with it.
      const style = getComputedStyle(el);
      const availW =
        el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (!availW) return;
      setScale(availW / width);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, layout.visible]);

  if (!layout.visible) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          The {face === "player" ? "player" : "DM"} side is hidden. Enable it
          under the &quot;{face === "player" ? "Player" : "DM"} side&quot;
          layout controls on the Print &amp; Export tab.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto flex justify-center p-4"
    >
      {/* Outer box is sized to the scaled-down footprint so the flex
          container's centering and scroll height are computed against
          what's actually visible — a bare CSS transform leaves the
          pre-transform (full) size in the layout, which would center
          against a box wider than the screen and clip the result. */}
      <div style={{ width: width * scale, height: height * scale }}>
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {face === "player" ? (
            <PlayerFace card={card} rotated={false} width={width} height={height} />
          ) : (
            <DmFace card={card} width={width} height={height} />
          )}
        </div>
      </div>
    </div>
  );
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

  // Mobile (<lg) layout only: which of the four panes desktop shows side
  // by side is currently on screen.
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");

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

  const [exportScope, setExportScope] = useState<ExportScope>("all");
  const [exportChoice, setExportChoice] = useState<ExportChoice>("pdf");
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
  }, [activeParty.cards, activeCard, exportScope, exportChoice, pdfSettings]);

  // Party/card selection lives at the top of the form now — shared by the
  // desktop left rail's CardEditor and the mobile "Character" tab's.
  const cardEditorProps = {
    card: activeCard,
    onChange: handleChange,
    effectiveLayout,
    parties,
    activeParty,
    onSelectParty: setActivePartyId,
    onAddParty: handleAddParty,
    onRenameParty: handleRenameParty,
    onRequestDeleteParty: (id: string) => {
      const party = parties.find((p) => p.id === id);
      if (party) setPartyPendingDelete(party);
    },
    onSelectCard: handleSelectCard,
    onAddCard: handleAddCard,
    onRemoveCard: handleRemoveCard,
    onResetCard: () => setConfirmingResetCard(true),
  };

  // Print & Export panel props are identical for the desktop rail and the
  // mobile tab — built once and spread into both.
  const printExportPanelProps = {
    activeParty,
    activeCard,
    effectiveLayout,
    bothSidesVisible,
    oversizedCardCount,
    exportChoice,
    exportScope,
    exporting,
    pdfSettings,
    onFormatChange: handleFormatChange,
    onExportScopeChange: setExportScope,
    onExport: handleExport,
    onSetMargin: setMargin,
    onSetPaper: (paper: PaperPreset) =>
      setPdfSettings((prev) => ({ ...prev, paper })),
    onUpdateLayoutSide: updatePartyLayoutSide,
    onUpdateGutterCm: updatePartyGutterCm,
  };

  return (
    <>
      {/* Desktop (lg and up): three panes side by side, unchanged. */}
      <div
        className="hidden lg:flex h-screen overflow-hidden"
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
            <CardEditor {...cardEditorProps} />
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
              <MeasureSpread
                card={activeCard}
                layout={effectiveLayout}
                direction="row"
              />
            </div>
            <div ref={columnMeasureRef} style={{ width: "max-content" }}>
              <MeasureSpread
                card={activeCard}
                layout={effectiveLayout}
                direction="column"
              />
            </div>
          </div>
        </main>

        {/* Right: page & export configuration */}
        <aside
          className="flex flex-col w-[23.4rem] shrink-0 border-l overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <PrintExportPanel {...printExportPanelProps} />
        </aside>
      </div>

      {/* Mobile (below lg): one pane at a time, switched via tabs — the
          preview tabs are read-only (rendered outside CardEditProvider)
          and just reflect whatever the two form tabs currently hold. Each
          face renders at true size and is bound by the viewport's width;
          taller cards scroll rather than shrink. */}
      <div
        className="flex lg:hidden flex-col h-screen overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        <MobileTabBar active={mobileTab} onChange={setMobileTab} />

        {mobileTab === "edit" && (
          <div className="flex-1 overflow-y-auto">
            <CardEditor {...cardEditorProps} />
          </div>
        )}

        {mobileTab === "player" && (
          <MobileFacePreview
            card={activeCard}
            layout={effectiveLayout.player}
            face="player"
          />
        )}

        {mobileTab === "dm" && (
          <MobileFacePreview
            card={activeCard}
            layout={effectiveLayout.dm}
            face="dm"
          />
        )}

        {mobileTab === "export" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <PrintExportPanel {...printExportPanelProps} />
          </div>
        )}
      </div>

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
    </>
  );
}
