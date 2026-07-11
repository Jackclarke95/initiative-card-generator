"use client";

import { type CardData, type LayoutPreset, DEFAULT_CARD } from "@/types/card";

interface CardEditorProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

// ── Small form helpers ────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "bg-[var(--surface-raised)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] w-full";

const numClass =
  inputClass +
  " [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mt-4 mb-2 border-b border-[var(--border)] pb-1">
      {children}
    </h3>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function CardEditor({ card, onChange }: CardEditorProps) {
  function set<K extends keyof CardData>(key: K, value: CardData[K]) {
    onChange({ ...card, [key]: value });
  }

  function setToggle(key: keyof CardData["toggles"], value: boolean) {
    onChange({ ...card, toggles: { ...card.toggles, [key]: value } });
  }

  function applyPreset(preset: LayoutPreset) {
    if (preset === "minimalist") {
      onChange({
        ...card,
        preset,
        toggles: {
          showPassives: false,
          showSpellSaveDC: false,
          showPortrait: true,
        },
      });
    } else {
      onChange({ ...card, preset, toggles: DEFAULT_CARD.toggles });
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-1 text-[var(--text-primary)]">
      {/* Presets */}
      <SectionHeading>Preset</SectionHeading>
      <div className="flex gap-2">
        {(["tactician", "minimalist"] as LayoutPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`flex-1 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
              card.preset === p
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Identity */}
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <input
            className={inputClass}
            value={card.characterName}
            onChange={(e) => set("characterName", e.target.value)}
          />
        </Field>
        <Field label="Class">
          <input
            className={inputClass}
            value={card.characterClass}
            onChange={(e) => set("characterClass", e.target.value)}
          />
        </Field>
      </div>

      {/* Vitals */}
      <SectionHeading>Vitals</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field label="AC">
          <input
            className={numClass}
            type="number"
            min={1}
            max={30}
            value={card.ac}
            onChange={(e) => set("ac", parseInt(e.target.value) || 10)}
          />
        </Field>
        <Field label="Max HP">
          <input
            className={numClass}
            type="number"
            min={1}
            max={999}
            value={card.maxHp}
            onChange={(e) => set("maxHp", parseInt(e.target.value) || 1)}
          />
        </Field>
        <Field label="Speed (ft)">
          <input
            className={numClass}
            type="number"
            min={0}
            max={120}
            step={5}
            value={card.speed}
            onChange={(e) => set("speed", parseInt(e.target.value) || 30)}
          />
        </Field>
      </div>

      {/* Passives */}
      <SectionHeading>Passives</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Pass. Perception">
          <input
            className={numClass}
            type="number"
            min={1}
            max={30}
            value={card.passivePerception}
            onChange={(e) =>
              set("passivePerception", parseInt(e.target.value) || 10)
            }
          />
        </Field>
        <Field label="Pass. Insight">
          <input
            className={numClass}
            type="number"
            min={1}
            max={30}
            value={card.passiveInsight}
            onChange={(e) =>
              set("passiveInsight", parseInt(e.target.value) || 10)
            }
          />
        </Field>
        <Field label="Spell Save DC">
          <input
            className={numClass}
            type="number"
            min={1}
            max={30}
            value={card.spellSaveDC}
            onChange={(e) => set("spellSaveDC", parseInt(e.target.value) || 10)}
          />
        </Field>
      </div>

      {/* Portrait */}
      <SectionHeading>Portrait</SectionHeading>
      <Field label="Image URL">
        <input
          className={inputClass}
          placeholder="https://…"
          value={card.portraitUrl}
          onChange={(e) => set("portraitUrl", e.target.value)}
        />
      </Field>

      {/* Gutter */}
      <SectionHeading>Print Settings</SectionHeading>
      <Field label={`Screen gutter: ${card.gutterHeightCm.toFixed(1)} cm`}>
        <input
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={card.gutterHeightCm}
          onChange={(e) => set("gutterHeightCm", parseFloat(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </Field>

      {/* Toggles */}
      <SectionHeading>Show / Hide Sections</SectionHeading>
      <div className="flex flex-col gap-1.5">
        {(
          [
            ["showPassives", "Passives row"],
            ["showSpellSaveDC", "Spell Save DC"],
            ["showPortrait", "Portrait (player side)"],
          ] as [keyof CardData["toggles"], string][]
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={card.toggles[key]}
              onChange={(e) => setToggle(key, e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-primary)]">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
