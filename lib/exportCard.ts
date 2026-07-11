import JSZip from "jszip";
import { toPng, toJpeg } from "html-to-image";
import type { CardData } from "@/types/card";

// Card faces are laid out at 96 CSS px/in; this ratio pushes raster
// exports up to ~300 DPI so they stay crisp if printed or zoomed.
const RASTER_PIXEL_RATIO = 3;

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
