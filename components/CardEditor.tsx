"use client";

import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  type AbilityKey,
  type AbilityStat,
  type CardData,
} from "@/types/card";

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

  function setNum<K extends keyof CardData>(key: K, raw: string) {
    if (raw === "") {
      set(key, undefined as CardData[K]);
      return;
    }
    const parsed = parseInt(raw, 10);
    set(key, (Number.isNaN(parsed) ? undefined : parsed) as CardData[K]);
  }

  function setStat(key: AbilityKey, patch: Partial<AbilityStat>) {
    onChange({
      ...card,
      stats: { ...card.stats, [key]: { ...card.stats[key], ...patch } },
    });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-1 text-[var(--text-primary)]">
      {/* Identity */}
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Name">
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
      <div className="grid gap-2">
        <Field label="AC">
          <input
            className={numClass}
            type="number"
            value={card.ac ?? ""}
            onChange={(e) => setNum("ac", e.target.value)}
          />
        </Field>
        <Field label="Max HP">
          <input
            className={numClass}
            type="number"
            value={card.maxHp ?? ""}
            onChange={(e) => setNum("maxHp", e.target.value)}
          />
        </Field>
        <Field label="Save DC">
          <input
            className={numClass}
            type="number"
            value={card.spellSaveDC ?? ""}
            onChange={(e) => setNum("spellSaveDC", e.target.value)}
          />
        </Field>
        <Field label="Passive Perception">
          <input
            className={numClass}
            type="number"
            value={card.passivePerception ?? ""}
            onChange={(e) => setNum("passivePerception", e.target.value)}
          />
        </Field>
        <Field label="Passive Insight">
          <input
            className={numClass}
            type="number"
            value={card.passiveInsight ?? ""}
            onChange={(e) => setNum("passiveInsight", e.target.value)}
          />
        </Field>
        <Field label="Speed (ft)">
          <input
            className={numClass}
            type="number"
            min={0}
            max={120}
            step={5}
            value={card.speed ?? ""}
            onChange={(e) => setNum("speed", e.target.value)}
          />
        </Field>
      </div>

      {/* Ability scores */}
      <SectionHeading>Ability Scores</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="flex items-end gap-2">
            <Field label={ABILITY_LABELS[key]}>
              <input
                className={inputClass}
                value={card.stats[key].modifier}
                placeholder="+0"
                onChange={(e) => setStat(key, { modifier: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-1 pb-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
              <input
                type="checkbox"
                checked={card.stats[key].proficiency}
                onChange={(e) =>
                  setStat(key, { proficiency: e.target.checked })
                }
              />
              Prof.
            </label>
          </div>
        ))}
      </div>

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
    </div>
  );
}
