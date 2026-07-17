"use client";

import { memo } from "react";
import { PlayerFace, DmFace } from "@/components/CardFaces";
import { inToPx, layoutRenderEqual, type LayoutConfig } from "@/lib/cardLayout";
import type { CardData } from "@/types/card";

interface InitiativeCardProps {
  card: CardData;
  layout: LayoutConfig;
}

// The print/export-ready layout: the player face upside down, a fold
// gutter, then the DM face — folding the sheet in half along the
// gutter lines the two faces up back-to-back into one physical card.
// When only one side is visible there's nothing to fold against, so
// the gutter drops out and that one face renders right-side up.
// Memoized: ExportArea keeps one of these mounted per card in the party at
// all times (so export can find any card's DOM immediately), but editing
// one card creates a new object only for that card — every other card's
// reference is unchanged, so this skips re-rendering the ones you aren't
// touching instead of redoing every card in the party on every keystroke.
function InitiativeCard({ card, layout }: InitiativeCardProps) {
  const { player, dm, gutterCm } = layout;
  const bothVisible = player.visible && dm.visible;
  const gutterWidthPx = Math.max(inToPx(player.widthIn), inToPx(dm.widthIn));
  const gutterStyle = {
    height: `${gutterCm}cm`,
    width: gutterWidthPx,
    "--gutter-height": `${gutterCm}cm`,
  } as React.CSSProperties;

  return (
    <div
      className="card-unit"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {player.visible && (
        <PlayerFace
          card={card}
          rotated={bothVisible}
          width={inToPx(player.widthIn)}
          height={inToPx(player.heightIn)}
        />
      )}
      {bothVisible && <div className="card-gutter" style={gutterStyle} />}
      {dm.visible && (
        <DmFace card={card} width={inToPx(dm.widthIn)} height={inToPx(dm.heightIn)} />
      )}
    </div>
  );
}

export default memo(
  InitiativeCard,
  (prev, next) => prev.card === next.card && layoutRenderEqual(prev.layout, next.layout),
);
