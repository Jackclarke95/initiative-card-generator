"use client";

import Image from "next/image";
import { DamageTypeIcon } from "@/components/Icons";
import { getClassLogo } from "@/components/ClassLogos";
import {
  PlayerFrame,
  SaveBox,
  VitalStackRow,
  Chevron,
  Shield,
  Heart,
  Star,
  Orb,
  NameScroll,
  DragonScroll,
  SCROLL_DRAGON_BOX,
  SCROLL_NODRAGON_BOX,
} from "@/components/CardFrames";
import {
  type CardData,
  type DamageType,
  abilityModifier,
  formatModifier,
} from "@/types/card";

interface InitiativeCardProps {
  card: CardData;
}

// Card face: 2.5in × 3.5in = 240 × 336 px. Minus 1px borders and 8px padding.
const FACE_W = 240;
const FACE_H = 336;
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

const label = (size: number, color = "#a3a3a3"): React.CSSProperties => ({
  position: "relative",
  fontSize: size,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color,
  fontWeight: 600,
  whiteSpace: "pre-line",
  textAlign: "center",
  lineHeight: 1.3,
});

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

// ── DM-facing side ────────────────────────────────────────────────────

function DmFace({ card }: { card: CardData }) {
  const { abilityScores, toggles } = card;
  const compact = toggles.showStats || toggles.showDefenses;

  // Sizes shrink slightly when the optional stat/defense strips are shown.
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = compact
    ? { row: 26, shW: 54, shH: 62, gap: 4 }
    : { row: 28, shW: 52, shH: 60, gap: 4 };
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

  const classLine = [
    card.characterClass,
    card.subclass,
    card.level && `Lvl ${card.level}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const stats = [
    { name: "STR", score: abilityScores.str },
    { name: "DEX", score: abilityScores.dex },
    { name: "CON", score: abilityScores.con },
    { name: "INT", score: abilityScores.int },
    { name: "WIS", score: abilityScores.wis },
    { name: "CHA", score: abilityScores.cha },
  ];

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
          label="Name"
          width={DM_SCROLL_W}
          height={DM_SCROLL_H}
        />

        {toggles.showStats && (
          <div style={{ display: "flex", gap: 3 }}>
            {stats.map(({ name, score }) => (
              <div
                key={name}
                style={{
                  flex: 1,
                  border: "1px solid #111",
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "2px 0",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 9 }}>
                  {formatModifier(abilityModifier(score))}
                </span>
                <span style={label(5.5)}>{name}</span>
              </div>
            ))}
          </div>
        )}

        {toggles.showDefenses && (
          <div style={{ display: "flex", gap: 4 }}>
            <DefenseStrip name="Resist" types={card.resistances} />
            <DefenseStrip name="Immune" types={card.immunities} />
          </div>
        )}

        {/* Stat shapes — pushed to the bottom */}
        <div
          style={{
            marginTop: "auto",
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
              {toggles.showSpellSaveDC && (
                <SaveBox
                  value={card.spellSaveDC}
                  label="DC"
                  width={saveW}
                  height={iconH}
                />
              )}
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
              {toggles.showPassives && (
                <Star
                  value={card.passivePerception}
                  label="P. P."
                  width={starW}
                  height={iconH}
                />
              )}
            </Slot>
            <Chevron
              value={card.speed}
              label="Speed"
              width={chevronW}
              height={iconH * 0.9}
            />
            <Slot width={slotW}>
              {toggles.showPassives && (
                <Orb
                  value={card.passiveInsight}
                  label="Insight"
                  width={orbW}
                  height={iconH * 1}
                />
              )}
            </Slot>
          </div>
        </div>

        <VitalStackRow
          part="top"
          value={card.race}
          label="Race"
          width={CONTENT_W}
          height={S.row}
        />
        <VitalStackRow
          part="mid"
          value={classLine}
          label="Class"
          width={CONTENT_W}
          height={S.row}
        />
        <VitalStackRow
          part="bottom"
          value={card.playerName}
          label="Player"
          width={CONTENT_W}
          height={S.row}
        />
      </div>
    </div>
  );
}

function DefenseStrip({ name, types }: { name: string; types: DamageType[] }) {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #111",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 6px",
        minHeight: 18,
      }}
    >
      <span style={label(5.5)}>{name}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {types.length === 0 ? (
          <span style={{ fontSize: 7, opacity: 0.35 }}>—</span>
        ) : (
          types.map((t) => <DamageTypeIcon key={t} type={t} size={9} />)
        )}
      </div>
    </div>
  );
}

// ── Player-facing side ────────────────────────────────────────────────

function PlayerFace({ card }: { card: CardData }) {
  const hasPortrait = card.toggles.showPortrait && card.portraitUrl;
  const Logo = getClassLogo(card.characterClass);

  return (
    <div
      className="card-face card-player-face"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {hasPortrait ? (
        <Image
          src={card.portraitUrl}
          alt={card.characterName}
          width={FACE_W}
          height={FACE_H}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          unoptimized
        />
      ) : (
        <>
          <PlayerFrame width={FACE_W - 2} height={FACE_H - 2} />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#111",
              paddingBottom: SCROLL_H - 14,
            }}
          >
            {Logo ? (
              <Logo size={220} />
            ) : (
              <ClassInitial characterClass={card.characterClass} />
            )}
          </div>
        </>
      )}

      {/* Name scroll (dragon variant) along the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: (FACE_W - 2 - SCROLL_W) / 2,
          width: SCROLL_W,
          height: SCROLL_H,
        }}
      >
        <DragonScroll
          width={SCROLL_W}
          height={SCROLL_H}
          value={card.characterName || "—"}
        />
      </div>
    </div>
  );
}

/** Fallback for class names we don't have a logo for. */
function ClassInitial({ characterClass }: { characterClass: string }) {
  const initial = (characterClass || "?")[0].toUpperCase();
  return (
    <div
      style={{
        width: 110,
        height: 110,
        border: "3px solid #111",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "3.4rem", fontWeight: 900, lineHeight: 1 }}>
        {initial}
      </span>
    </div>
  );
}

// ── Assembled card ────────────────────────────────────────────────────

export default function InitiativeCard({ card }: InitiativeCardProps) {
  const gutterStyle = {
    height: `${card.gutterHeightCm}cm`,
    "--gutter-height": `${card.gutterHeightCm}cm`,
  } as React.CSSProperties;

  return (
    <div
      id="print-area"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <PlayerFace card={card} />
      <div className="card-gutter" style={gutterStyle} />
      <DmFace card={card} />
    </div>
  );
}
