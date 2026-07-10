"use client";

import Image from "next/image";
import { ShieldIcon, HalfShieldIcon, DamageTypeIcon } from "@/components/Icons";
import { getClassLogo } from "@/components/ClassLogos";
import {
  type CardData,
  type DamageType,
  abilityModifier,
  formatModifier,
} from "@/types/card";

interface InitiativeCardProps {
  card: CardData;
}

// ── Small helpers ─────────────────────────────────────────────────────

function InitBox({ value, small }: { value: number; small?: boolean }) {
  return (
    <div
      style={{
        background: "var(--card-initiative-bg)",
        color: "var(--card-initiative-text)",
        border: "1px solid var(--card-header-text)",
        padding: small ? "2px 6px" : "4px 10px",
        fontWeight: 900,
        fontSize: small ? "0.85rem" : "1.4rem",
        lineHeight: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        minWidth: small ? 32 : 44,
      }}
    >
      <span style={{ fontSize: small ? "0.45rem" : "0.5rem", letterSpacing: 1, opacity: 0.85 }}>
        INIT
      </span>
      <span>{value >= 0 ? `+${value}` : value}</span>
    </div>
  );
}

/**
 * A stat box with angular L-bracket decorations in each corner —
 * the signature look of the reference aesthetic.
 */
function BracketBox({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const corner = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: 6,
    height: 6,
    borderColor: "var(--card-ink)",
    borderStyle: "solid",
    borderWidth: 0,
    ...pos,
  });

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 2px",
        minWidth: 0,
        ...style,
      }}
    >
      <span style={corner({ top: 1, left: 1, borderTopWidth: 1.5, borderLeftWidth: 1.5 })} />
      <span style={corner({ top: 1, right: 1, borderTopWidth: 1.5, borderRightWidth: 1.5 })} />
      <span style={corner({ bottom: 1, left: 1, borderBottomWidth: 1.5, borderLeftWidth: 1.5 })} />
      <span style={corner({ bottom: 1, right: 1, borderBottomWidth: 1.5, borderRightWidth: 1.5 })} />
      {children}
    </div>
  );
}

/** Big value with a small ALL-CAPS label underneath. */
function StatValue({
  value,
  label,
  big,
}: {
  value: React.ReactNode;
  label: string;
  big?: boolean;
}) {
  return (
    <>
      <span
        style={{
          fontWeight: 800,
          fontSize: big ? "0.85rem" : "0.62rem",
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.36rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.55,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </>
  );
}

// ── DM-facing side ────────────────────────────────────────────────────

function DmFace({ card }: { card: CardData }) {
  const { abilityScores, toggles } = card;
  const stats = [
    { label: "STR", score: abilityScores.str },
    { label: "DEX", score: abilityScores.dex },
    { label: "CON", score: abilityScores.con },
    { label: "INT", score: abilityScores.int },
    { label: "WIS", score: abilityScores.wis },
    { label: "CHA", score: abilityScores.cha },
  ];

  const classLine = [card.characterClass, card.subclass, card.level && `Lvl ${card.level}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="card-face" style={{ display: "flex", flexDirection: "column" }}>
      {/* Header — dark navy bar with name + initiative */}
      <div
        style={{
          background: "var(--card-header-bg)",
          color: "var(--card-header-text)",
          padding: "5px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.characterName || "—"}
        </div>
        <InitBox value={card.initiative} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, padding: 5 }}>
        {/* Full-width identity rows */}
        <BracketBox>
          <StatValue value={card.playerName || "—"} label="Player" />
        </BracketBox>
        <BracketBox>
          <StatValue value={card.race || "—"} label="Race" />
        </BracketBox>
        <BracketBox>
          <StatValue value={classLine || "—"} label="Class" />
        </BracketBox>

        {/* HP / AC / Spell save */}
        <div style={{ display: "flex", gap: 3 }}>
          <BracketBox style={{ flex: 1 }}>
            <StatValue big value={card.maxHp} label="Max HP" />
          </BracketBox>
          <BracketBox style={{ flex: 1 }}>
            <StatValue big value={card.ac} label="AC" />
          </BracketBox>
          {toggles.showSpellSaveDC && (
            <BracketBox style={{ flex: 1 }}>
              <StatValue big value={card.spellSaveDC} label="Spell Save" />
            </BracketBox>
          )}
        </div>

        {/* Perception / Speed / Insight */}
        <div style={{ display: "flex", gap: 3 }}>
          {toggles.showPassives && (
            <BracketBox style={{ flex: 1.2 }}>
              <StatValue big value={card.passivePerception} label="Perception" />
            </BracketBox>
          )}
          <BracketBox style={{ flex: 1 }}>
            <StatValue big value={`${card.speed}`} label="Speed" />
          </BracketBox>
          {toggles.showPassives && (
            <BracketBox style={{ flex: 1.2 }}>
              <StatValue big value={card.passiveInsight} label="Insight" />
            </BracketBox>
          )}
        </div>

        {/* Ability modifiers */}
        {toggles.showStats && (
          <div style={{ display: "flex", gap: 3 }}>
            {stats.map(({ label, score }) => (
              <BracketBox key={label} style={{ flex: 1, padding: "2px 0" }}>
                <StatValue value={formatModifier(abilityModifier(score))} label={label} />
              </BracketBox>
            ))}
          </div>
        )}

        {/* Defenses */}
        {toggles.showDefenses && (
          <div style={{ flex: 1, display: "flex", gap: 3 }}>
            <DefenseZone
              icon={<HalfShieldIcon size={8} color="var(--card-accent)" />}
              label="Resist"
              types={card.resistances}
            />
            <DefenseZone
              icon={<ShieldIcon size={8} color="var(--card-accent)" />}
              label="Immune"
              types={card.immunities}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DefenseZone({
  icon,
  label,
  types,
}: {
  icon: React.ReactNode;
  label: string;
  types: DamageType[];
}) {
  return (
    <BracketBox style={{ flex: 1, justifyContent: "flex-start", padding: "3px 6px", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        <span
          style={{
            fontSize: "0.36rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
        {types.length === 0 ? (
          <span style={{ fontSize: "0.4rem", opacity: 0.35 }}>—</span>
        ) : (
          types.map((t) => <DamageTypeIcon key={t} type={t} size={10} />)
        )}
      </div>
    </BracketBox>
  );
}

// ── Player-facing side ────────────────────────────────────────────────

function PlayerFace({ card }: { card: CardData }) {
  const hasPortrait = card.toggles.showPortrait && card.portraitUrl;
  const Logo = getClassLogo(card.characterClass);

  return (
    <div
      className="card-face card-player-face"
      style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
    >
      {/* Header bar — class name + initiative top-right */}
      <div
        style={{
          background: "var(--card-header-bg)",
          color: "var(--card-header-text)",
          padding: "5px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.48rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          {card.characterClass}
        </span>
        <InitBox value={card.initiative} small />
      </div>

      {/* Portrait or class logo */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          overflow: "hidden",
        }}
      >
        {hasPortrait ? (
          <Image
            src={card.portraitUrl}
            alt={card.characterName}
            width={180}
            height={220}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            unoptimized
          />
        ) : (
          <>
            <div style={{ color: "var(--card-accent)" }}>
              {Logo ? <Logo size={80} /> : <ClassInitial characterClass={card.characterClass} />}
            </div>
            <span
              style={{
                fontSize: "0.36rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                opacity: 0.45,
              }}
            >
              Character Appearance
            </span>
          </>
        )}
      </div>

      {/* Footer — character name */}
      <div
        style={{
          background: "var(--card-header-bg)",
          color: "var(--card-header-text)",
          padding: "6px 8px",
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
          {card.characterName || "—"}
        </div>
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
        width: 80,
        height: 80,
        border: "3px solid var(--card-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1 }}>{initial}</span>
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
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
    >
      <PlayerFace card={card} />
      <div className="card-gutter" style={gutterStyle} />
      <DmFace card={card} />
    </div>
  );
}
