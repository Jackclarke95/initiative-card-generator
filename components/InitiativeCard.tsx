"use client";

import Image from "next/image";
import { DamageTypeIcon } from "@/components/Icons";
import { getClassLogo } from "@/components/ClassLogos";
import {
  PlayerFrame,
  VitalBox,
  SaveBox,
  VitalStackRow,
  Chevron,
  Shield,
  Heart,
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
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color,
  fontWeight: 600,
  whiteSpace: "pre-line",
  textAlign: "center",
  lineHeight: 1.3,
});

// ── DM-facing side ────────────────────────────────────────────────────

function DmFace({ card }: { card: CardData }) {
  const { abilityScores, toggles } = card;
  const compact = toggles.showStats || toggles.showDefenses;

  // Sizes shrink slightly when the optional stat/defense strips are shown.
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = compact
    ? { row: 26, sqH: 48, shW: 54, shH: 62, gap: 4 }
    : { row: 28, sqH: 52, shW: 52, shH: 60, gap: 4 };
  // The hearts (HP, Save) are drawn 1.2× wider than the shield.
  const heartW = Math.round(S.shW * 1.2);
  const saveW = heartW;

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
            <Heart
              value={card.maxHp}
              label={"HP"}
              width={heartW}
              height={S.shH}
            />
            <Shield value={card.ac} label={"AC"} width={S.shW} height={S.shH} />
            {toggles.showSpellSaveDC ? (
              <SaveBox
                value={card.spellSaveDC}
                label="DC"
                width={saveW}
                height={S.shH}
              />
            ) : (
              <div style={{ width: saveW }} />
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {toggles.showPassives ? (
              <VitalBox
                value={card.passivePerception}
                label="Perception"
                width={68}
                height={S.sqH}
              />
            ) : (
              <div style={{ width: 68 }} />
            )}
            <Chevron
              value={card.speed}
              label="Speed"
              width={63}
              height={S.shH}
            />
            {toggles.showPassives ? (
              <VitalBox
                value={card.passiveInsight}
                label="Insight"
                width={68}
                height={S.sqH}
              />
            ) : (
              <div style={{ width: 68 }} />
            )}
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
