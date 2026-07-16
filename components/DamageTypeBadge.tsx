// Damage type badge — icon, 2-letter code, resistance/immunity mark. Every
// damage type gets a same-size ring so the row never jitters; only its
// color and fill escalate: grey hollow ring (neither), black ring+dot
// (resistant), fully filled circle (immune) — chosen over a half-filled
// "gauge" variant because a centered dot and a full fill are both easy
// pen/pencil marks on a printed blank card, where someone may hand-fill
// this in rather than it always being generated digitally.

import type { IconType } from "react-icons";
import {
  GiAcid,
  GiBroadsword,
  GiDeathSkull,
  GiEnlightenment,
  GiFlame,
  GiPocketBow,
  GiPowerLightning,
  GiPsychicWaves,
  GiRollingEnergy,
  GiSnake,
  GiSnowflake1,
  GiSonicBoom,
  GiThorHammer,
} from "react-icons/gi";
import { INK, PALE_GREY } from "@/components/frames/Frame";
import type {
  DamageDisplayMode,
  DamageTypeKey,
  ResistanceState,
} from "@/types/card";

export const DAMAGE_TYPE_REACT_ICONS: Record<DamageTypeKey, IconType> = {
  bludgeoning: GiThorHammer,
  piercing: GiPocketBow,
  slashing: GiBroadsword,
  acid: GiAcid,
  cold: GiSnowflake1,
  fire: GiFlame,
  force: GiRollingEnergy,
  lightning: GiPowerLightning,
  necrotic: GiDeathSkull,
  poison: GiSnake,
  psychic: GiPsychicWaves,
  radiant: GiEnlightenment,
  thunder: GiSonicBoom,
};

export function DamageTypeBadge({
  label,
  damageType,
  state,
  displayMode = "all",
}: {
  label: string;
  damageType: DamageTypeKey;
  state: ResistanceState;
  displayMode?: DamageDisplayMode;
}) {
  const color = state === "neither" ? PALE_GREY : INK;
  const r = 2.6;
  const cx = r + 1;
  const cy = r + 1;
  const size = r * 2 + 2;
  const ReactIcon = DAMAGE_TYPE_REACT_ICONS[damageType];

  return (
    <div
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        width: 14,
        flexShrink: 0,
      }}
    >
      {(displayMode === "all" || displayMode === "icon") && (
        <ReactIcon size={12} style={{ color: INK, flexShrink: 0 }} />
      )}
      {(displayMode === "all" || displayMode === "initials") && (
        <span
          style={{
            fontSize: 7,
            fontWeight: 600,
            lineHeight: 1,
            color: INK,
            textAlign: "center",
          }}
        >
          {label.slice(0, 2)}
        </span>
      )}
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {state === "immune" ? (
          // Matches the ring's outer edge (r + half its stroke width),
          // so the filled dot reads as the same overall size as the ring
          // rather than looking smaller than it.
          <circle cx={cx} cy={cy} r={r + 0.5} fill={color} />
        ) : (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />
            {state === "resistant" && (
              <circle cx={cx} cy={cy} r={r * 0.5} fill={color} />
            )}
          </>
        )}
      </svg>
    </div>
  );
}
