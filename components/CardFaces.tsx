"use client";

import { Fragment } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { PALE_GREY } from "@/components/FrameText";
import {
  PlayerFrame,
  SaveBox,
  Chevron,
  Shield,
  Heart,
  Star,
  Orb,
  NameScroll,
  SCROLL_DRAGON_BOX,
  SCROLL_NODRAGON_BOX,
  StatBox,
  DamageTypeBadge,
} from "@/components/CardFrames";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  type CardData,
} from "@/types/card";

// Card face: 2.5in × 3.5in = 240 × 336 px. Minus 1px borders and 8px padding.
export const FACE_W = 240;
export const FACE_H = 336;
const CONTENT_W = FACE_W - 2 - 16;

// The dragon scroll always keeps the artwork's natural aspect ratio.
const scrollHeight = (w: number) =>
  Math.round((SCROLL_DRAGON_BOX.h / SCROLL_DRAGON_BOX.w) * w);
const SCROLL_W = 200; // player face
const SCROLL_H = scrollHeight(SCROLL_W);
const DM_SCROLL_W = CONTENT_W; // Name banner on the DM side — full row width
const DM_SCROLL_H = Math.round(
  (SCROLL_NODRAGON_BOX.h / SCROLL_NODRAGON_BOX.w) * DM_SCROLL_W,
);
// Inset of the player-side border from the card edge — even on all sides.
const PLAYER_BORDER_MARGIN_WIDTH = 4;
const PLAYER_BORDER_MARGIN_HEIGHT = 6;

/** Fixed-width centering slot: lets two badges with different natural
 *  widths (e.g. Heart vs. Star) share one alignment axis between rows,
 *  by centering each inside the same-width box rather than relying on
 *  their raw widths to match. */
function Slot({
  width,
  children,
}: {
  width: number;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ width, display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  );
}

export function DmFace({ card }: { card: CardData }) {
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = { shW: 52, shH: 60, gap: 10 };
  // All six stat badges share one height so both rows read as one
  // consistent size — back to the original (pre-unification) size.
  const iconH = S.shH;
  const badgeW = Math.round(S.shW * 1.2);
  // The hearts (HP, Save) are drawn 1.2× wider than the shield.
  const heartW = Math.round(badgeW * 1.2);
  const saveW = heartW;
  // Chevron/Star/Orb widths each follow that shape's own viewBox aspect
  // ratio at the shared height, so nothing gets stretched or letterboxed.
  const chevronW = Math.round(iconH * (55 / 48));
  const starW = Math.round(iconH * (56.8 / 49.83));
  const orbW = iconH; // Orb's viewBox is a 1:1 square.
  // HP/Perception share a slot, and DC/Insight share a slot — each
  // shape centers inside its slot, so the two rows' differing natural
  // widths still align on the same vertical axis. Using one slot width
  // for both sides also keeps AC/Speed centered exactly between them.
  const slotW = Math.max(heartW, starW, saveW, orbW);

  const statGap = 4;

  return (
    <div
      className="card-face"
      style={{ display: "flex", flexDirection: "column", padding: 8 }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: S.gap,
        }}
      >
        {/* Identity rows — scroll for the name, then the vital stack */}
        <NameScroll
          value={card.characterName}
          width={DM_SCROLL_W}
          height={DM_SCROLL_H}
        />

        {/* Stat shapes — pushed to the bottom */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Slot width={slotW}>
              <Heart
                value={card.maxHp}
                label={"HP"}
                width={heartW}
                height={iconH}
              />
            </Slot>
            <Shield
              value={card.ac}
              label={"AC"}
              width={badgeW}
              height={iconH * 1.1}
            />
            <Slot width={slotW}>
              <SaveBox
                value={card.spellSaveDC}
                label="DC"
                width={saveW}
                height={iconH}
              />
            </Slot>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Slot width={slotW}>
              <Star
                value={card.passivePerception}
                label="P. P."
                width={starW}
                height={iconH}
              />
            </Slot>
            <Chevron
              value={card.speed}
              label="Speed"
              width={chevronW}
              height={iconH * 0.9}
            />
            <Slot width={slotW}>
              <Orb
                value={card.passiveInsight}
                label="Insight"
                width={orbW}
                height={iconH * 1}
              />
            </Slot>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: statGap,
          }}
        >
          {ABILITY_KEYS.map((key) => (
            <StatBox
              key={key}
              label={ABILITY_LABELS[key]}
              value={card.stats[key].modifier}
              proficiency={card.stats[key].proficiency}
            />
          ))}
        </div>

        {/* Damage types — resistant/immune, dashed dividers between
            entries rather than an outer box. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          {DAMAGE_TYPE_KEYS.map((key, i) => (
            <Fragment key={key}>
              {i > 0 && (
                <div
                  style={{
                    alignSelf: "stretch",
                    borderLeft: `1px dashed ${PALE_GREY}`,
                  }}
                />
              )}
              <DamageTypeBadge
                label={DAMAGE_TYPE_LABELS[key]}
                damageType={key}
                state={card.resistances[key]}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlayerFaceProps {
  card: CardData;
  /** The fold-ready layout prints the player face upside down (relative
   *  to the DM face) so folding the sheet in half lines the two faces
   *  up back-to-back. Preview contexts that show both faces side by
   *  side want it right-side up instead. */
  rotated?: boolean;
}

export function PlayerFace({ card, rotated = true }: PlayerFaceProps) {
  const classKey = Object.keys(CLASS_LOGO_MAP).find(
    (k) => k.toLowerCase() === card.characterClass.trim().toLowerCase(),
  );
  const Logo = classKey ? CLASS_LOGO_MAP[classKey] : undefined;

  return (
    <div
      className={rotated ? "card-face card-player-face" : "card-face"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <>
        <div
          style={{
            position: "absolute",
            top: PLAYER_BORDER_MARGIN_HEIGHT,
            left: PLAYER_BORDER_MARGIN_WIDTH,
            width: FACE_W - 2 - PLAYER_BORDER_MARGIN_WIDTH * 2,
            height: FACE_H - 2 - PLAYER_BORDER_MARGIN_HEIGHT * 2,
          }}
        >
          <PlayerFrame
            width={FACE_W - 2 - PLAYER_BORDER_MARGIN_WIDTH * 2}
            height={FACE_H - 2 - PLAYER_BORDER_MARGIN_HEIGHT * 2}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111",
            paddingTop: SCROLL_H - 14,
          }}
        >
          {Logo && <Logo size={220} />}
        </div>
      </>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: (FACE_W - 2 - SCROLL_W) / 2,
          width: SCROLL_W,
          height: SCROLL_H,
        }}
      >
        <NameScroll
          dragon
          width={SCROLL_W}
          height={SCROLL_H}
          value={card.characterName || "—"}
        />
      </div>
    </div>
  );
}
