"use client";

import Image from "next/image";
import { DamageTypeIcon } from "@/components/Icons";
import { getClassLogo } from "@/components/ClassLogos";
import {
  PlayerFrame,
  VitalBoxFrame,
  VitalStackFrame,
  SpellHeadFrame,
  ShieldFrame,
  ScrollFrame,
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

/** Full-width row: value centred over a small grey label, on a frame. */
function IdentityRow({
  value,
  name,
  h,
  frame,
}: {
  value: string;
  name: string;
  h: number;
  frame: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: CONTENT_W,
        height: h,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {frame}
      {value && (
        <span
          style={{
            position: "relative",
            fontWeight: 700,
            fontSize: 10.5,
            maxWidth: CONTENT_W - 32,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </span>
      )}
      <span style={label(6.5)}>{name}</span>
    </div>
  );
}

/** The Name banner: dragon scroll at its natural aspect ratio, with the
 *  value and label positioned over the scroll body (right of the dragon). */
function NameScrollRow({
  value,
  w,
  h,
}: {
  value: string;
  w: number;
  h: number;
}) {
  return (
    <div
      style={{ position: "relative", width: w, height: h, alignSelf: "center" }}
    >
      <ScrollFrame w={w} h={h} dragon={false} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          maxWidth: "62%",
        }}
      >
        {value && (
          <span
            style={{
              fontWeight: 700,
              fontSize: 10.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {value}
          </span>
        )}
        <span style={label(6.5)}>Name</span>
      </div>
    </div>
  );
}

/** A stat shape (frame prop) with a bold value and black caps label. */
function StatShape({
  frame,
  value,
  name,
  w,
  h,
  padBottom = 0,
}: {
  frame: React.ReactNode;
  value: React.ReactNode;
  name: string;
  w: number;
  h: number;
  padBottom?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        paddingBottom: padBottom,
      }}
    >
      {frame}
      <span
        style={{
          position: "relative",
          fontWeight: 800,
          fontSize: 15,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={label(6.5, "#111")}>{name}</span>
    </div>
  );
}

function DmFace({ card }: { card: CardData }) {
  const { abilityScores, toggles } = card;
  const compact = toggles.showStats || toggles.showDefenses;

  // Sizes shrink slightly when the optional stat/defense strips are shown.
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = compact
    ? { row: 26, sqH: 48, shW: 54, shH: 62, gap: 4 }
    : { row: 28, sqH: 52, shW: 52, shH: 60, gap: 4 };

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
        <NameScrollRow
          value={card.characterName}
          w={DM_SCROLL_W}
          h={DM_SCROLL_H}
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
            <StatShape
              frame={<VitalBoxFrame w={68} h={S.sqH} />}
              value={card.maxHp}
              name="Max HP"
              w={68}
              h={S.sqH}
            />
            <StatShape
              frame={<ShieldFrame w={S.shW} h={S.shH} />}
              value={card.ac}
              name={"Armor\nClass"}
              w={S.shW}
              h={S.shH}
              padBottom={12}
            />
            {toggles.showSpellSaveDC ? (
              <StatShape
                frame={<VitalBoxFrame w={68} h={S.sqH} />}
                value={card.spellSaveDC}
                name="Spell Save"
                w={68}
                h={S.sqH}
              />
            ) : (
              <div style={{ width: 68 }} />
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
              <StatShape
                frame={<VitalBoxFrame w={68} h={S.sqH} />}
                value={card.passivePerception}
                name="Perception"
                w={68}
                h={S.sqH}
              />
            ) : (
              <div style={{ width: 68 }} />
            )}
            <StatShape
              frame={<SpellHeadFrame w={68} h={S.sqH} />}
              value={card.speed}
              name="Speed"
              w={68}
              h={S.sqH}
            />
            {toggles.showPassives ? (
              <StatShape
                frame={<VitalBoxFrame w={68} h={S.sqH} />}
                value={card.passiveInsight}
                name="Insight"
                w={68}
                h={S.sqH}
              />
            ) : (
              <div style={{ width: 68 }} />
            )}
          </div>
        </div>

        <IdentityRow
          name="Race"
          value={card.race}
          h={S.row}
          frame={<VitalStackFrame w={CONTENT_W} h={S.row} part="top" />}
        />
        <IdentityRow
          name="Class"
          value={classLine}
          h={S.row}
          frame={<VitalStackFrame w={CONTENT_W} h={S.row} part="mid" />}
        />
        <IdentityRow
          name="Player"
          value={card.playerName}
          h={S.row}
          frame={<VitalStackFrame w={CONTENT_W} h={S.row} part="bottom" />}
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
          <PlayerFrame w={FACE_W - 2} h={FACE_H - 2} />
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
        <ScrollFrame w={SCROLL_W} h={SCROLL_H} />
        <span
          style={{
            position: "absolute",
            left: "64%",
            top: "62%",
            transform: "translate(-50%, -50%)",
            fontWeight: 800,
            fontSize: 13,
            whiteSpace: "nowrap",
            maxWidth: "62%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "#111",
          }}
        >
          {card.characterName || "—"}
        </span>
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
