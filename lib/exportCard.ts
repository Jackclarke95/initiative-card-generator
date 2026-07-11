import JSZip from "jszip";
import jsPDF from "jspdf";
import { toPng, toJpeg } from "html-to-image";
import type { CardData } from "@/types/card";
import { PAPER_SIZES, type Margins, type PaperPreset } from "@/lib/paperSizes";

// Card faces are laid out at 96 CSS px/in; this ratio pushes raster
// exports up to ~300 DPI so they stay crisp if printed or zoomed.
const RASTER_PIXEL_RATIO = 3;

// Matches InitiativeCard's FACE_W/FACE_H (240x336px at 96 css px/in).
const FACE_WIDTH_IN = 2.5;
const FACE_HEIGHT_IN = 3.5;
const CM_PER_IN = 2.54;

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

// Generates the multi-page PDF ourselves rather than relying on
// window.print() + @page: Chromium's print pagination doesn't reliably
// fragment flex/grid/inline-block content across pages (overflowing
// rows get crammed onto the same page instead of breaking), so a
// browser print job can't be trusted to tile many cards across pages.
// jsPDF gives us exact, predictable page breaks instead.
//
// The paper is always used portrait; whether the CARD units are drawn
// upright or rotated 90° is decided automatically, whichever orientation
// fits more full units into the page's content box.
export async function exportAllCardsAsPdf(
  cards: CardData[],
  paper: PaperPreset,
  margins: Margins,
  gutterCm: number,
) {
  const { w: widthCm, h: heightCm } = PAPER_SIZES[paper];
  const pageWidthIn = widthCm / CM_PER_IN;
  const pageHeightIn = heightCm / CM_PER_IN;
  const marginTopIn = margins.top / CM_PER_IN;
  const marginBottomIn = margins.bottom / CM_PER_IN;
  const marginLeftIn = margins.left / CM_PER_IN;
  const marginRightIn = margins.right / CM_PER_IN;

  const contentWidthIn = pageWidthIn - marginLeftIn - marginRightIn;
  const contentHeightIn = pageHeightIn - marginTopIn - marginBottomIn;

  const unitWidthIn = FACE_WIDTH_IN;
  const unitHeightIn = FACE_HEIGHT_IN * 2 + gutterCm / CM_PER_IN;

  const uprightCols = Math.floor(contentWidthIn / unitWidthIn);
  const uprightRows = Math.floor(contentHeightIn / unitHeightIn);
  const uprightCount = Math.max(0, uprightCols) * Math.max(0, uprightRows);

  const rotatedCols = Math.floor(contentWidthIn / unitHeightIn);
  const rotatedRows = Math.floor(contentHeightIn / unitWidthIn);
  const rotatedCount = Math.max(0, rotatedCols) * Math.max(0, rotatedRows);

  const useRotated = rotatedCount > uprightCount;
  const cols = Math.max(1, useRotated ? rotatedCols : uprightCols);
  const rows = Math.max(1, useRotated ? rotatedRows : uprightRows);
  const perPage = cols * rows;

  const placedWidthIn = useRotated ? unitHeightIn : unitWidthIn;
  const placedHeightIn = useRotated ? unitWidthIn : unitHeightIn;

  const doc = new jsPDF({ unit: "in", format: [pageWidthIn, pageHeightIn] });

  for (let i = 0; i < cards.length; i++) {
    const node = document.querySelector<HTMLElement>(
      `[data-card-id="${cards[i].id}"]`,
    );
    if (!node) continue;

    const posOnPage = i % perPage;
    if (i > 0 && posOnPage === 0) doc.addPage([pageWidthIn, pageHeightIn]);

    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);
    const x = marginLeftIn + col * placedWidthIn;
    const y = marginTopIn + row * placedHeightIn;

    let dataUrl = await renderCardDataUrl(node, "png");
    if (useRotated) dataUrl = await rotateImage90(dataUrl);
    doc.addImage(dataUrl, "PNG", x, y, placedWidthIn, placedHeightIn);
  }

  doc.save("initiative-cards.pdf");
}
