# Multi-card support: batch create, export, and print

## Context

The app currently holds exactly one `CardData` in `page.tsx` state and renders one `InitiativeCard`. Users want to build a whole deck of characters in one session, then either export/print a single selected card (today's behavior) or export/print the entire deck at once. Export-all should produce one .zip of images; print-all should tile as many complete card units (front face + fold gutter + back face, the same physical layout used today) onto a real paper size as will geometrically fit, using the browser's native print dialog — no custom PDF/canvas print pipeline.

Two design decisions were confirmed with the user up front:
- The fold gutter becomes a single **global** print setting (not per-card), so batch-printed cards tile into a clean, uniform grid.
- "Export All" bundles every card into a **single .zip** (via the `jszip` package) rather than firing N sequential file downloads, which Chromium blocks/prompts after ~2 automatic downloads.

No PDF export format is added: the existing Print button already opens the native print dialog, and "Save as PDF" is just a destination choice inside that same dialog (confirmed working in Edge) — a dedicated PDF export button would just call the identical `window.print()` code path, so it would be pure duplication. Export stays svg/png/jpeg only; PDF output is Print's job (single or all, once the "print all" grid layout below exists).

## Data model changes — `types/card.ts`

- Add `id: string` to `CardData` (stable key for list rendering / duplicate / remove). Generate with `crypto.randomUUID()` when creating cards.
- Remove `gutterHeightCm` from `CardData` — it moves to a new app-level, global setting (see below).
- `DEFAULT_CARD` loses `gutterHeightCm`; gains an `id`.

## Global print/export settings — new state in `app/page.tsx`

```ts
type PrintScope = "current" | "all";
type Orientation = "portrait" | "landscape";
type PaperPreset = "a4" | "a3" | "letter" | "legal";

interface PrintSettings {
  scope: PrintScope;        // shared by both the Print button and the export buttons
  paper: PaperPreset;       // only relevant when scope === "all"
  orientation: Orientation;
  marginCm: number;         // default 1
  gutterCm: number;         // default 1 — replaces the old per-card slider
}
```

`page.tsx` state becomes `cards: CardData[]`, `activeId: string`, `printSettings: PrintSettings`. A `PAPER_SIZES` table gives base portrait W×H in cm for each preset (a4: 21×29.7, a3: 29.7×42, letter: 21.59×27.94, legal: 21.59×35.56); orientation just swaps which value maps to width vs height — no separate code path per orientation.

## Sidebar UI changes

**Card list** (new `components/CardList.tsx`, rendered above `CardEditor`): one row per card (shows `characterName` or "Untitled"), click to select (sets `activeId`), a duplicate icon-button (deep-clones the card with a new `id`) and a delete icon-button (disabled when it's the last remaining card) per row, plus an "+ Add Card" button that appends a copy of `DEFAULT_CARD` with a fresh `id`. `CardEditor` keeps editing whichever card matches `activeId`, unchanged otherwise except **removing the "Print Settings" gutter slider** (that setting is now global).

**Print/export header**: add a small "Current / All" segmented toggle that drives `printSettings.scope`, sitting above the existing Print + SVG/PNG/JPEG buttons (those buttons stay as-is, no new format, but now act on the whole deck when scope is "All"). When scope is "All", reveal a compact print-setup row (paper preset select, orientation select, margin slider, gutter slider) — hidden entirely for "Current" scope since that path keeps today's exact zero-config behavior. Printing with scope "All" and destination "Save as PDF" in the OS dialog is how a user gets a multi-card PDF — no separate export path needed for that.

## Rendering architecture — new `components/PrintArea.tsx`

Today `InitiativeCard`'s own root div carries `id="print-area"` and is the same node shown in the on-screen "Live Preview". That breaks once N cards need to exist in the DOM for grid printing/export (duplicate ids, and we don't want N full-size cards cluttering the visible layout). Split these concerns:

- `InitiativeCard.tsx`: root div loses `id="print-area"`, becomes a plain `className="card-unit"` wrapper. Add an optional `gutterHeightCm` prop that overrides `card.gutterHeightCm`-style sizing (since the field no longer lives on `CardData`, `InitiativeCard` now takes gutter as a required prop, sourced from `printSettings.gutterCm` for print/export and also for the live preview).
- `app/page.tsx`'s visible "Live Preview" pane keeps its own separate `<InitiativeCard card={activeCard} gutterHeightCm={printSettings.gutterCm} />` inside `.preview-scale`, exactly as today — just cosmetic, for editing feedback.
- New `PrintArea` component owns the single `#print-area` id and always renders **every** card (each in a `.card-unit` wrapper with `data-card-id={c.id}`), but is kept off-screen during normal use:
  ```css
  #print-area { position: fixed; top: 0; left: -99999px; }
  ```
  This differs from `display:none` deliberately — canvas-based export (`html-to-image`) needs the node actually laid out to rasterize it, so it must stay off-canvas rather than unrendered. The existing `@media print` block already repositions `#print-area` to `left: 0` and drives visibility via `body * { visibility: hidden }` / `#print-area, #print-area * { visibility: visible }` — unchanged, since that mechanism only cares about the id, not how many cards are inside.
  - Add a `mode` prop/class: `.mode-current` shows only the `.card-unit` matching `activeId` (others `display:none`, fine since it's a leaf toggle, not an ancestor); `.mode-all` shows all of them in a wrapping flex layout (see CSS below).
- Both the live preview and this hidden `PrintArea` tree exist simultaneously; the active card is rendered twice (once visibly, once off-screen) which is cheap and keeps the two concerns from fighting over one DOM node.

## Print CSS — `app/globals.css`

Keep the existing single-card `@page` rule's *shape*, but generalize its inputs so both modes share one rule (named `@page` contexts aren't needed — only one mode is ever active in the DOM at print time):

```css
@page {
  size: var(--print-page-width) var(--print-page-height);
  margin: var(--print-page-margin);
}
```

`page.tsx` sets `--print-page-width/-height/-margin` on `document.documentElement` (via a small `useEffect` keyed on `printSettings`), because `@page` reads custom properties from the document root, not from `#print-area`:
- scope "current": `--print-page-width: var(--card-width)`, `--print-page-height: calc(var(--card-height) * 2 + var(--gutter-height))`, `--print-page-margin: 0` (identical to today's fixed values, just routed through the same variable names).
- scope "all": width/height from the chosen `PAPER_SIZES` entry + orientation swap (in cm), margin from `printSettings.marginCm`.

Add the grid layout rule, additive to the existing `@media print` block:

```css
@media print {
  #print-area.mode-all {
    display: flex !important;
    flex-wrap: wrap;
    align-content: flex-start;
  }
  #print-area.mode-all .card-unit {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

No manual row/column math needed: once `@page { size; margin }` is correct, the browser's print engine already constrains `#print-area`'s content box to the printable region, so plain `flex-wrap` naturally fits as many fixed-size `.card-unit`s per row/page as geometrically possible and flows the remainder onto subsequent pages. `.card-face`'s existing fixed pixel dimensions (240×336) are unaffected — orientation and paper size only change the *page* box, not the card unit itself.

## Export changes — `lib/exportCard.ts`

`ExportFormat` stays `"svg" | "png" | "jpeg"` — no PDF format (see above).

- Extract the existing per-format rasterization branches (png/jpeg/svg-wrap) out of `exportCard` into a shared `renderCardDataUrl(node, format): Promise<string>` helper; `exportCard` becomes a thin wrapper that calls it and downloads one file (unchanged behavior for scope "current").
- Add `exportAllCards(cards: CardData[], format: ExportFormat): Promise<void>`:
  - Reads each card's already-rendered `.card-unit` node from the hidden `PrintArea` tree via `document.querySelector('[data-card-id="..."]')` (reuses the same off-screen nodes `PrintArea` already maintains — no separate offscreen render container needed).
  - Calls `renderCardDataUrl` per node, converts each data URL to a `Blob`, and adds it to a `new JSZip()`.
  - Filename per card: `slugify(characterName) || `card-${index + 1}``, with a `Set`-based collision counter appending `-2`, `-3`, … for duplicates.
  - Triggers one `.zip` download (name like `initiative-cards.zip`) via the existing `download()` helper.
- Add `jszip` as a dependency (`npm install jszip`).

## Files touched

- `types/card.ts` — `id` field, drop `gutterHeightCm`.
- `app/page.tsx` — `cards[]`/`activeId`/`printSettings` state, scope toggle + print-setup controls, `useEffect` to push `--print-page-*` vars onto `documentElement`, renders `CardList` + `PrintArea`.
- `components/CardList.tsx` — new.
- `components/PrintArea.tsx` — new.
- `components/InitiativeCard.tsx` — drop hardcoded id, accept `gutterHeightCm` prop.
- `components/CardEditor.tsx` — remove the per-card gutter slider.
- `app/globals.css` — generalize `@page` variables, add `.mode-all` grid print rules, add off-screen positioning for `#print-area`.
- `lib/exportCard.ts` — extract `renderCardDataUrl`, add `exportAllCards`.
- `package.json` — add `jszip`.

## Verification

- `npx tsc --noEmit` after each major step (matches how the export-button changes were verified earlier in this session).
- Manually (user-driven, per their standing preference not to have me self-verify visually): add 2-3 cards, confirm current-card print/export still matches today's output exactly; switch scope to "All", try each paper preset/orientation, confirm the print preview tiles multiple card units and overflows to a second page when there are more cards than fit (including confirming "Save as PDF" as the print destination produces a correctly multi-paged PDF); confirm "Export All" downloads a single .zip with correctly named, correctly rendered images per card.
