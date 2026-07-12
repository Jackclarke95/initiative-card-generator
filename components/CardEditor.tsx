"use client";

import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  type AbilityKey,
  type AbilityStat,
  type CardData,
  type DamageTypeKey,
  type ResistanceState,
} from "@/types/card";

const CLASS_OPTIONS = Object.keys(CLASS_LOGO_MAP);

/** Case-insensitive match against the known class list; undefined means
 *  the card's class isn't one of them, i.e. the "Custom" option applies. */
function knownClassFor(characterClass: string) {
  return CLASS_OPTIONS.find(
    (c) => c.toLowerCase() === characterClass.trim().toLowerCase(),
  );
}

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

  function setResistance(key: DamageTypeKey, state: ResistanceState) {
    onChange({
      ...card,
      resistances: { ...card.resistances, [key]: state },
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
          <select
            className={inputClass}
            value={knownClassFor(card.characterClass) ?? "Custom"}
            onChange={(e) =>
              set(
                "characterClass",
                e.target.value === "Custom" ? "" : e.target.value,
              )
            }
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
          {!knownClassFor(card.characterClass) && (
            <input
              className={inputClass + " mt-1"}
              placeholder="Class name"
              value={card.characterClass}
              onChange={(e) => set("characterClass", e.target.value)}
            />
          )}
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

      {/* Damage resistances */}
      <SectionHeading>Damage Types</SectionHeading>
      <div className="flex flex-col gap-1">
        {DAMAGE_TYPE_KEYS.map((key) => {
          const state = card.resistances[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 text-sm text-[var(--text-primary)]"
            >
              <span>{DAMAGE_TYPE_LABELS[key]}</span>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={state === "resistant"}
                    onChange={(e) =>
                      setResistance(
                        key,
                        e.target.checked ? "resistant" : "neither",
                      )
                    }
                  />
                  Resist
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={state === "immune"}
                    onChange={(e) =>
                      setResistance(
                        key,
                        e.target.checked ? "immune" : "neither",
                      )
                    }
                  />
                  Immune
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
