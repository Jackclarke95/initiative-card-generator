"use client";

import {
  CARD_SIZE_PRESET_KEYS,
  CARD_SIZE_PRESET_LABELS,
  MIN_SIDE_WIDTH_IN,
  sideLayoutFromPreset,
  type CardSizePresetKey,
  type LayoutConfig,
  type SideLayoutConfig,
} from "@/lib/cardLayout";
import { stepValueOnWheel } from "@/lib/sliderWheel";
import {
  Field,
  SectionHeading,
  inputClass,
  numClass,
} from "@/components/CardEditor";

interface SideLayoutFieldsProps {
  label: string;
  value: SideLayoutConfig;
  onChange: (next: SideLayoutConfig) => void;
}

const WIDTH_STEP = 0.05;
const WIDTH_MAX_IN = 6;
const HEIGHT_STEP = 0.05;
const HEIGHT_MIN_IN = 0.5;
const HEIGHT_MAX_IN = 8;

// One side's worth of physical layout controls — reused for both the
// party-wide defaults (InitiativeCardApp) and a single card's override
// (CardEditor). "At least one side visible" is enforced by whichever
// caller owns `onChange`, not here, since only it knows the other side's
// current effective visibility.
export default function SideLayoutFields({
  label,
  value,
  onChange,
}: SideLayoutFieldsProps) {
  function setWidth(widthIn: number) {
    onChange({ ...value, preset: "custom", widthIn });
  }
  function setHeight(heightIn: number) {
    onChange({ ...value, preset: "custom", heightIn });
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionHeading>{label}</SectionHeading>

      <label className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
        <input
          type="checkbox"
          checked={value.visible}
          onChange={(e) => onChange({ ...value, visible: e.target.checked })}
        />
        Show this side
      </label>

      {value.visible && (
        <>
          <Field label="Size preset">
            <select
              className={inputClass}
              value={value.preset}
              onChange={(e) => {
                const preset = e.target.value as CardSizePresetKey;
                onChange(
                  preset === "custom"
                    ? { ...value, preset }
                    : sideLayoutFromPreset(preset, { visible: value.visible }),
                );
              }}
            >
              {CARD_SIZE_PRESET_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CARD_SIZE_PRESET_LABELS[key]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Width (in)">
              <input
                className={numClass}
                type="number"
                min={MIN_SIDE_WIDTH_IN}
                step={WIDTH_STEP}
                value={value.widthIn}
                onChange={(e) => {
                  const widthIn = parseFloat(e.target.value);
                  if (!Number.isNaN(widthIn)) setWidth(widthIn);
                }}
              />
              <input
                type="range"
                min={MIN_SIDE_WIDTH_IN}
                max={WIDTH_MAX_IN}
                step={WIDTH_STEP}
                value={value.widthIn}
                onChange={(e) => setWidth(parseFloat(e.target.value))}
                onWheel={(e) =>
                  setWidth(
                    stepValueOnWheel(
                      e,
                      value.widthIn,
                      WIDTH_STEP,
                      MIN_SIDE_WIDTH_IN,
                      WIDTH_MAX_IN,
                    ),
                  )
                }
                className="w-full accent-[var(--accent)] mt-1"
              />
            </Field>
            <Field label="Height (in)">
              <input
                className={numClass}
                type="number"
                min={HEIGHT_MIN_IN}
                step={HEIGHT_STEP}
                value={value.heightIn}
                onChange={(e) => {
                  const heightIn = parseFloat(e.target.value);
                  if (!Number.isNaN(heightIn)) setHeight(heightIn);
                }}
              />
              <input
                type="range"
                min={HEIGHT_MIN_IN}
                max={HEIGHT_MAX_IN}
                step={HEIGHT_STEP}
                value={value.heightIn}
                onChange={(e) => setHeight(parseFloat(e.target.value))}
                onWheel={(e) =>
                  setHeight(
                    stepValueOnWheel(
                      e,
                      value.heightIn,
                      HEIGHT_STEP,
                      HEIGHT_MIN_IN,
                      HEIGHT_MAX_IN,
                    ),
                  )
                }
                className="w-full accent-[var(--accent)] mt-1"
              />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

// A mismatched width isn't blocked — you may genuinely want a narrower
// Player strip under a wider DM face — but it does mean the two sides
// won't line up along the same fold when printed, so it's worth flagging.
export function WidthMismatchWarning({ layout }: { layout: LayoutConfig }) {
  if (!layout.player.visible || !layout.dm.visible) return null;
  if (layout.player.widthIn === layout.dm.widthIn) return null;
  return (
    <p className="text-[11px] leading-snug" style={{ color: "var(--accent)" }}>
      ⚠ Player ({layout.player.widthIn}in) and DM ({layout.dm.widthIn}in) widths
      differ — the fold won&apos;t line up cleanly when printed.
    </p>
  );
}
