import JSZip from "jszip";
import jsPDF from "jspdf";
import { toPng, toJpeg } from "html-to-image";
import type { CardData } from "@/types/card";
import { CM_PER_IN } from "@/lib/cardLayout";
import { PAPER_SIZES, type Margins, type PaperPreset } from "@/lib/paperSizes";

// Card faces are laid out at 96 CSS px/in; this ratio pushes raster
// exports up to ~300 DPI so they stay crisp if printed or zoomed.
const RASTER_PIXEL_RATIO = 3;
const PX_PER_IN = 96;

function slugify(name: string): string {
  const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return trimmed.replace(/^-+|-+$/g, "");
}

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

// The card's layout relies on flexbox, position:absolute and nested
// CSS transforms, which only render correctly inside an SVG
// <foreignObject> in a full browser engine (Chromium, Firefox). Apps
// like Photoshop/Illustrator give foreignObject partial-to-no support
// and fall back to stacking its HTML content in plain document flow.
// To get an .svg that looks right everywhere, we rasterize the card
// (same as the PNG export) and wrap that image in a plain <svg>, which
// every viewer can render without needing HTML/CSS support at all.
function wrapPngAsSvg(pngDataUrl: string, width: number, height: number): string {
  // Photoshop's SVG parser only recognizes the legacy xlink:href
  // attribute (pre-SVG2) on <image>, not the bare href attribute.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<image width="${width}" height="${height}" href="${pngDataUrl}" xlink:href="${pngDataUrl}" /></svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export type ExportFormat = "svg" | "png" | "jpeg";

async function renderCardDataUrl(
  node: HTMLElement,
  format: ExportFormat,
): Promise<string> {
  switch (format) {
    case "svg": {
      const pngDataUrl = await toPng(node, { pixelRatio: RASTER_PIXEL_RATIO });
      return wrapPngAsSvg(pngDataUrl, node.offsetWidth, node.offsetHeight);
    }
    case "png":
      return toPng(node, { pixelRatio: RASTER_PIXEL_RATIO });
    case "jpeg":
      return toJpeg(node, {
        pixelRatio: RASTER_PIXEL_RATIO,
        quality: 0.95,
        backgroundColor: "#ffffff",
      });
  }
}

export async function exportCard(
  node: HTMLElement,
  format: ExportFormat,
  characterName: string,
) {
  const dataUrl = await renderCardDataUrl(node, format);
  download(dataUrl, `${slugify(characterName) || "initiative-card"}.${format}`);
}

function uniqueFilename(characterName: string, index: number, used: Set<string>): string {
  const base = slugify(characterName) || `card-${index + 1}`;
  let name = base;
  let n = 2;
  while (used.has(name)) {
    name = `${base}-${n}`;
    n += 1;
  }
  used.add(name);
  return name;
}

export async function exportAllCards(cards: CardData[], format: ExportFormat) {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const node = document.querySelector<HTMLElement>(
      `[data-card-id="${card.id}"]`,
    );
    if (!node) continue;

    const dataUrl = await renderCardDataUrl(node, format);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const filename = `${uniqueFilename(card.characterName, i, usedNames)}.${format}`;
    zip.file(filename, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  download(url, "initiative-cards.zip");
  URL.revokeObjectURL(url);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Card units are tall (portrait) by nature. When laying flat cards on
// their side fits more of them per page, we rotate the actual bitmap
// 90° ourselves (rather than using jsPDF's own rotation option, whose
// coordinate math varies across versions) so it can be placed like any
// other image at the swapped width/height.
async function rotateImage90(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.height;
  canvas.height = img.width;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas.toDataURL("image/png");
}

interface PageGrid {
  cols: number;
  rows: number;
  perPage: number;
  placedWidthIn: number;
  placedHeightIn: number;
  useRotated: boolean;
}

// Whichever orientation (units drawn upright, or rotated 90°) fits more
// full units into the page's content box.
function computeGrid(
  unitWidthIn: number,
  unitHeightIn: number,
  contentWidthIn: number,
  contentHeightIn: number,
): PageGrid {
  const uprightCols = Math.floor(contentWidthIn / unitWidthIn);
  const uprightRows = Math.floor(contentHeightIn / unitHeightIn);
  const uprightCount = Math.max(0, uprightCols) * Math.max(0, uprightRows);

  const rotatedCols = Math.floor(contentWidthIn / unitHeightIn);
  const rotatedRows = Math.floor(contentHeightIn / unitWidthIn);
  const rotatedCount = Math.max(0, rotatedCols) * Math.max(0, rotatedRows);

  const useRotated = rotatedCount > uprightCount;
  const cols = Math.max(1, useRotated ? rotatedCols : uprightCols);
  const rows = Math.max(1, useRotated ? rotatedRows : uprightRows);
  return {
    cols,
    rows,
    perPage: cols * rows,
    placedWidthIn: useRotated ? unitHeightIn : unitWidthIn,
    placedHeightIn: useRotated ? unitWidthIn : unitHeightIn,
    useRotated,
  };
}

export interface ContentBox {
  pageWidthIn: number;
  pageHeightIn: number;
  contentWidthIn: number;
  contentHeightIn: number;
}

// The page's printable area (paper size minus margins) — shared by the
// actual PDF export below and the oversize-card warning in the export UI,
// so both agree on exactly what "fits" means.
export function contentBoxIn(paper: PaperPreset, margins: Margins): ContentBox {
  const { w: widthCm, h: heightCm } = PAPER_SIZES[paper];
  const pageWidthIn = widthCm / CM_PER_IN;
  const pageHeightIn = heightCm / CM_PER_IN;
  const contentWidthIn =
    pageWidthIn - (margins.left + margins.right) / CM_PER_IN;
  const contentHeightIn =
    pageHeightIn - (margins.top + margins.bottom) / CM_PER_IN;
  return { pageWidthIn, pageHeightIn, contentWidthIn, contentHeightIn };
}

// Whether a unit of this size fits within the content box in either
// orientation — matches computeGrid's own upright-vs-rotated choice below,
// so a "fits" here is a genuine guarantee it'll place, not just a guess.
export function fitsPage(
  unitWidthIn: number,
  unitHeightIn: number,
  contentWidthIn: number,
  contentHeightIn: number,
): boolean {
  const fitsUpright = unitWidthIn <= contentWidthIn && unitHeightIn <= contentHeightIn;
  const fitsRotated = unitHeightIn <= contentWidthIn && unitWidthIn <= contentHeightIn;
  return fitsUpright || fitsRotated;
}

// Generates the multi-page PDF ourselves rather than relying on
// window.print() + @page: Chromium's print pagination doesn't reliably
// fragment flex/grid/inline-block content across pages (overflowing
// rows get crammed onto the same page instead of breaking), so a
// browser print job can't be trusted to tile many cards across pages.
// jsPDF gives us exact, predictable page breaks instead.
//
// The paper is always used portrait.
export async function exportAllCardsAsPdf(
  cards: CardData[],
  paper: PaperPreset,
  margins: Margins,
) {
  const { pageWidthIn, pageHeightIn, contentWidthIn, contentHeightIn } =
    contentBoxIn(paper, margins);
  const marginTopIn = margins.top / CM_PER_IN;
  const marginLeftIn = margins.left / CM_PER_IN;

  // Every card's actual footprint (both faces, the gutter if shown, and
  // any per-card size override) is already sitting in the DOM via
  // ExportArea — measuring it directly, rather than assuming one uniform
  // size, is what lets auto-height sides and per-card overrides "just
  // work" here with no extra plumbing. Cards that measure the same (the
  // common case) are grouped and packed onto shared pages together; a
  // differently-sized card starts packing on its own fresh page instead
  // of corrupting the grid for the rest.
  const entries: { node: HTMLElement; widthIn: number; heightIn: number }[] = [];
  for (const card of cards) {
    const node = document.querySelector<HTMLElement>(
      `[data-card-id="${card.id}"]`,
    );
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    entries.push({
      node,
      widthIn: rect.width / PX_PER_IN,
      heightIn: rect.height / PX_PER_IN,
    });
  }

  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = `${entry.widthIn.toFixed(2)}x${entry.heightIn.toFixed(2)}`;
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }

  const doc = new jsPDF({ unit: "in", format: [pageWidthIn, pageHeightIn] });

  let isFirstImage = true;
  for (const groupEntries of groups.values()) {
    const { widthIn: unitWidthIn, heightIn: unitHeightIn } = groupEntries[0];
    const grid = computeGrid(
      unitWidthIn,
      unitHeightIn,
      contentWidthIn,
      contentHeightIn,
    );

    let placed = 0;
    for (const { node } of groupEntries) {
      const posOnPage = placed % grid.perPage;
      if (!isFirstImage && posOnPage === 0) {
        doc.addPage([pageWidthIn, pageHeightIn]);
      }
      isFirstImage = false;

      const col = posOnPage % grid.cols;
      const row = Math.floor(posOnPage / grid.cols);
      const x = marginLeftIn + col * grid.placedWidthIn;
      const y = marginTopIn + row * grid.placedHeightIn;

      let dataUrl = await renderCardDataUrl(node, "png");
      if (grid.useRotated) dataUrl = await rotateImage90(dataUrl);
      doc.addImage(dataUrl, "PNG", x, y, grid.placedWidthIn, grid.placedHeightIn);
      placed++;
    }
  }

  doc.save("initiative-cards.pdf");
}
