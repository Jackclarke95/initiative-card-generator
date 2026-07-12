"use client";

import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { MONSTER_TYPE_LOGO_MAP } from "@/components/MonsterLogos";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  type AbilityKey,
  type AbilityStat,
  type CardData,
  type CardType,
  type DamageTypeKey,
  type ResistanceState,
} from "@/types/card";

const CLASS_OPTIONS = Object.keys(CLASS_LOGO_MAP);
const MONSTER_TYPE_OPTIONS = Object.keys(MONSTER_TYPE_LOGO_MAP);

/** Case-insensitive match against a known option list; undefined means
 *  the card's value isn't one of them, i.e. the "Custom" option applies. */
function knownOptionFor(options: string[], value: string) {
  return options.find((o) => o.toLowerCase() === value.trim().toLowerCase());
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

const RESISTANCE_CYCLE: ResistanceState[] = ["neither", "resistant", "immune"];

function nextResistanceState(state: ResistanceState): ResistanceState {
  return RESISTANCE_CYCLE[
    (RESISTANCE_CYCLE.indexOf(state) + 1) % RESISTANCE_CYCLE.length
  ];
}

const RESISTANCE_LABELS: Record<ResistanceState, string> = {
  neither: "None",
  resistant: "Resistant",
  immune: "Immune",
};

function TriStateResistanceBox({ state }: { state: ResistanceState }) {
  return (
    <span
      aria-hidden
      className="flex h-4 w-4 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent)] leading-none"
    >
      {state === "resistant" && "–"}
      {state === "immune" && "✓"}
    </span>
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

  const isMonster = card.cardType === "monster";
  const typeOptions = isMonster ? MONSTER_TYPE_OPTIONS : CLASS_OPTIONS;
  const knownType = knownOptionFor(typeOptions, card.characterClass);

  function setCardType(cardType: CardType) {
    onChange({ ...card, cardType, characterClass: "" });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-1 text-[var(--text-primary)]">
      {/* Identity */}
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Type">
          <div
            className="flex rounded overflow-hidden border"
            style={{ borderColor: "var(--border)" }}
          >
            {(["player", "monster"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCardType(t)}
                className="flex-1 py-1 text-xs font-semibold transition-colors"
                style={{
                  background: card.cardType === t ? "var(--accent)" : "transparent",
                  color: card.cardType === t ? "#fff" : "var(--text-muted)",
                }}
              >
                {t === "player" ? "Player" : "Monster"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Name">
          <input
            className={inputClass}
            value={card.characterName}
            onChange={(e) => set("characterName", e.target.value)}
          />
        </Field>
        <Field label={isMonster ? "Creature Type" : "Class"}>
          <select
            className={inputClass}
            value={knownType ?? "Custom"}
            onChange={(e) =>
              set(
                "characterClass",
                e.target.value === "Custom" ? "" : e.target.value,
              )
            }
          >
            {typeOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
          {!knownType && (
            <input
              className={inputClass + " mt-1"}
              placeholder={isMonster ? "Creature type" : "Class name"}
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
        {!isMonster && (
          <Field label="Save DC">
            <input
              className={numClass}
              type="number"
              value={card.spellSaveDC ?? ""}
              onChange={(e) => setNum("spellSaveDC", e.target.value)}
            />
          </Field>
        )}
        <Field label="Passive Perception">
          <input
            className={numClass}
            type="number"
            value={card.passivePerception ?? ""}
            onChange={(e) => setNum("passivePerception", e.target.value)}
          />
        </Field>
        {!isMonster && (
          <Field label="Passive Insight">
            <input
              className={numClass}
              type="number"
              value={card.passiveInsight ?? ""}
              onChange={(e) => setNum("passiveInsight", e.target.value)}
            />
          </Field>
        )}
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

      {/* Ability scores — DM face for monsters skips this block, so
          there's nothing to edit here for them. */}
      {!isMonster && (
        <>
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
        </>
      )}

      {/* Damage resistances */}
      <SectionHeading>Resistances</SectionHeading>
      <div className="flex flex-col gap-1">
        {DAMAGE_TYPE_KEYS.map((key) => {
          const state = card.resistances[key];
          return (
            <button
              key={key}
              type="button"
              role="checkbox"
              aria-checked={
                state === "neither"
                  ? "false"
                  : state === "immune"
                    ? "true"
                    : "mixed"
              }
              onClick={() => setResistance(key, nextResistanceState(state))}
              className="flex items-center justify-between gap-2 text-sm text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2">
                <TriStateResistanceBox state={state} />
                {DAMAGE_TYPE_LABELS[key]}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {RESISTANCE_LABELS[state]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
