export type PaperPreset = "a4" | "a3" | "letter" | "legal";

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Portrait dimensions in cm — paper is always used portrait; card units
// are the ones rotated (or not) to whichever fits more per page.
export const PAPER_SIZES: Record<PaperPreset, { w: number; h: number }> = {
  a4: { w: 21, h: 29.7 },
  a3: { w: 29.7, h: 42 },
  letter: { w: 21.59, h: 27.94 },
  legal: { w: 21.59, h: 35.56 },
};

export const PAPER_LABELS: Record<PaperPreset, string> = {
  a4: "A4",
  a3: "A3",
  letter: "Letter",
  legal: "Legal",
};
