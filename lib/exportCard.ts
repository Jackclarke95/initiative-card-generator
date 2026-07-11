import { toSvg, toPng, toJpeg } from "html-to-image";

// Card faces are laid out at 96 CSS px/in; this ratio pushes raster
// exports up to ~300 DPI so they stay crisp if printed or zoomed.
const RASTER_PIXEL_RATIO = 3;

function slugify(name: string): string {
  const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return trimmed.replace(/^-+|-+$/g, "") || "initiative-card";
}

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export type ExportFormat = "svg" | "png" | "jpeg";

export async function exportCard(
  node: HTMLElement,
  format: ExportFormat,
  characterName: string,
) {
  const filename = `${slugify(characterName)}.${format}`;

  switch (format) {
    case "svg": {
      const dataUrl = await toSvg(node);
      download(dataUrl, filename);
      break;
    }
    case "png": {
      const dataUrl = await toPng(node, { pixelRatio: RASTER_PIXEL_RATIO });
      download(dataUrl, filename);
      break;
    }
    case "jpeg": {
      const dataUrl = await toJpeg(node, {
        pixelRatio: RASTER_PIXEL_RATIO,
        quality: 0.95,
        backgroundColor: "#ffffff",
      });
      download(dataUrl, filename);
      break;
    }
  }
}
