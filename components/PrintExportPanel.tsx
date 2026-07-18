"use client";

import type { CardData } from "@/types/card";
import type { Party } from "@/types/party";
import FoldedCardPreview from "@/components/FoldedCardPreview";
import InfoTooltip from "@/components/InfoTooltip";
import SegmentedToggle from "@/components/SegmentedToggle";
import SideLayoutFields, {
  WidthMismatchWarning,
} from "@/components/SideLayoutFields";
import ThemeToggle from "@/components/ThemeToggle";
import type { ExportFormat } from "@/lib/exportCard";
import type { LayoutConfig, SideLayoutConfig } from "@/lib/cardLayout";
import { stepValueOnWheel } from "@/lib/sliderWheel";
import { PAPER_LABELS, type Margins, type PaperPreset } from "@/lib/paperSizes";

export type ExportScope = "current" | "all";
export type ExportChoice = ExportFormat | "pdf";
type MarginSide = keyof Margins;

export interface PdfSettings {
  paper: PaperPreset;
  margins: Margins;
}

export const MARGIN_SIDES: { side: MarginSide; label: string }[] = [
  { side: "top", label: "Top" },
  { side: "bottom", label: "Bottom" },
  { side: "left", label: "Left" },
  { side: "right", label: "Right" },
];

export const GUTTER_MAX_CM = 3;

interface PrintExportPanelProps {
  activeParty: Party;
  activeCard: CardData;
  effectiveLayout: LayoutConfig;
  bothSidesVisible: boolean;
  oversizedCardCount: number;
  exportChoice: ExportChoice;
  exportScope: ExportScope;
  exporting: boolean;
  pdfSettings: PdfSettings;
  onFormatChange: (choice: ExportChoice) => void;
  onExportScopeChange: (scope: ExportScope) => void;
  onExport: () => void;
  onSetMargin: (side: MarginSide, value: number) => void;
  onSetPaper: (paper: PaperPreset) => void;
  onUpdateLayoutSide: (side: "player" | "dm", next: SideLayoutConfig) => void;
  onUpdateGutterCm: (gutterCm: number) => void;
}

// The full "Print & Export" panel — file output options and the per-side
// layout + fold controls. Shared verbatim by the desktop right-hand rail
// and the mobile "Print & Export" tab; the caller owns the outer
// width/border/scroll chrome so this only ever renders its own content.
// Party/card selection lives at the top of CardEditor instead (see there).
export default function PrintExportPanel({
  activeParty,
  activeCard,
  effectiveLayout,
  bothSidesVisible,
  oversizedCardCount,
  exportChoice,
  exportScope,
  exporting,
  pdfSettings,
  onFormatChange,
  onExportScopeChange,
  onExport,
  onSetMargin,
  onSetPaper,
  onUpdateLayoutSide,
  onUpdateGutterCm,
}: PrintExportPanelProps) {
  return (
    <>
      <div
        className="px-4 py-3 border-b shrink-0 flex items-start justify-between gap-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h2
            className="text-sm font-bold tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            Print & Export
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Fold layout, paper, and file output
          </p>
        </div>
        <ThemeToggle />
      </div>

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
              onChange={(e) => onFormatChange(e.target.value as ExportChoice)}
              className="bg-[var(--surface-raised)] border rounded px-1.5 py-1.5 text-xs uppercase"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="pdf">PDF</option>
              <option value="svg">SVG</option>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
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
              onChange={onExportScopeChange}
            />
            <button
              onClick={onExport}
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
                    onChange={(e) => onSetPaper(e.target.value as PaperPreset)}
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
                        onSetMargin(side, parseFloat(e.target.value) || 0)
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
                  {oversizedCardCount > 1 ? "s" : ""} won&apos;t fit within this
                  page size and margins, even rotated. Increase the page size,
                  shrink the margins, or reduce the card&apos;s own size.
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
            onChange={(next) => onUpdateLayoutSide("player", next)}
          />
          <SideLayoutFields
            label="DM side"
            value={activeParty.layout.dm}
            onChange={(next) => onUpdateLayoutSide("dm", next)}
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
                  onChange={(e) => onUpdateGutterCm(parseFloat(e.target.value))}
                  onWheel={(e) =>
                    onUpdateGutterCm(
                      stepValueOnWheel(
                        e,
                        activeParty.layout.gutterCm,
                        0.1,
                        0,
                        GUTTER_MAX_CM,
                      ),
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

        {/* Required notice under Wizards of the Coast's Fan Content Policy
         *  (company.wizards.com/en/legal/fancontentpolicy) — this tool uses
         *  official class/monster art under that policy. */}
        <p className="mt-4 text-[10px] leading-snug text-[var(--text-muted)]">
          Initiative Card Generator is unofficial Fan Content permitted under
          the{" "}
          <a
            href="https://company.wizards.com/en/legal/fancontentpolicy"
            className="underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fan Content Policy
          </a>
          . Not approved/endorsed by Wizards. Portions of the materials used are
          property of Wizards of the Coast. © Wizards of the Coast LLC.
        </p>
      </div>
    </>
  );
}
