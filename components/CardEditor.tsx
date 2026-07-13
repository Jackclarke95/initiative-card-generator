"use client";

import { useState } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { DAMAGE_TYPE_REACT_ICONS } from "@/components/CardFrames";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  emptyCard,
  type AbilityKey,
  type AbilityStat,
  type CardData,
  type DamageDisplayMode,
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

function SectionHeading({
  children,
  checked,
  onToggle,
}: {
  children: React.ReactNode;
  /** When provided, renders a checkbox for showing/hiding this section on
   *  the DM face, alongside the heading text. */
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}) {
  return (
    <h3 className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] mt-4 mb-2 border-b border-[var(--border)] pb-1">
      <span>{children}</span>
      {onToggle && (
        <label className="flex items-center gap-1 normal-case tracking-normal font-normal text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Show on card
        </label>
      )}
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

const DAMAGE_DISPLAY_LABELS: Record<DamageDisplayMode, string> = {
  icon: "Icon",
  initials: "Initials",
  both: "Both",
};

const DAMAGE_DISPLAY_MODES: DamageDisplayMode[] = ["icon", "initials", "both"];

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
  const [confirmingClear, setConfirmingClear] = useState(false);

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

  function setToggle(key: keyof CardData["toggles"], value: boolean) {
    onChange({ ...card, toggles: { ...card.toggles, [key]: value } });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-1 text-[var(--text-primary)]">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setConfirmingClear(true)}
          className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          Clear card
        </button>
      </div>

      {/* Identity */}
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Name">
          <input
            className={inputClass}
            value={card.characterName}
            onChange={(e) => set("characterName", e.target.value)}
          />
          <label className="flex items-center gap-1 mt-0.5 text-xs font-normal normal-case tracking-normal text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={card.toggles.showName}
              onChange={(e) => setToggle("showName", e.target.checked)}
            />
            Show on card
          </label>
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
      <SectionHeading
        checked={card.toggles.showVitals}
        onToggle={(v) => setToggle("showVitals", v)}
      >
        Vitals
      </SectionHeading>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Max HP">
          <input
            className={numClass}
            type="number"
            value={card.maxHp ?? ""}
            onChange={(e) => setNum("maxHp", e.target.value)}
          />
        </Field>
        <Field label="AC">
          <input
            className={numClass}
            type="number"
            value={card.ac ?? ""}
            onChange={(e) => setNum("ac", e.target.value)}
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
        <Field label="Perception">
          <input
            className={numClass}
            type="number"
            value={card.passivePerception ?? ""}
            onChange={(e) => setNum("passivePerception", e.target.value)}
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
        <Field label="Insight">
          <input
            className={numClass}
            type="number"
            value={card.passiveInsight ?? ""}
            onChange={(e) => setNum("passiveInsight", e.target.value)}
          />
        </Field>
      </div>

      {/* Ability scores */}
      <SectionHeading
        checked={card.toggles.showAbilityScores}
        onToggle={(v) => setToggle("showAbilityScores", v)}
      >
        Ability Scores
      </SectionHeading>
      <div className="grid grid-cols-3 gap-2">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-0.5">
            <label className="flex items-center justify-between gap-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              <span>{ABILITY_LABELS[key]}</span>
              <span className="flex items-center gap-1 normal-case font-normal whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={card.stats[key].proficiency}
                  onChange={(e) =>
                    setStat(key, { proficiency: e.target.checked })
                  }
                />
                Proficient
              </span>
            </label>
            <input
              className={inputClass}
              value={card.stats[key].modifier}
              placeholder="+0"
              onChange={(e) => setStat(key, { modifier: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Damage resistances */}
      <SectionHeading
        checked={card.toggles.showDefences}
        onToggle={(v) => setToggle("showDefences", v)}
      >
        Resistances
      </SectionHeading>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Display type
        </span>
        <div
          className="flex rounded overflow-hidden border"
          style={{ borderColor: "var(--border)" }}
        >
          {DAMAGE_DISPLAY_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => set("damageDisplayMode", mode)}
              className="flex-1 px-2.5 py-1 text-xs font-semibold transition-colors"
              style={{
                background:
                  card.damageDisplayMode === mode
                    ? "var(--accent)"
                    : "transparent",
                color:
                  card.damageDisplayMode === mode
                    ? "#fff"
                    : "var(--text-muted)",
              }}
            >
              {DAMAGE_DISPLAY_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {DAMAGE_TYPE_KEYS.map((key) => {
          const state = card.resistances[key];
          const ReactIcon = DAMAGE_TYPE_REACT_ICONS[key];
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
                <ReactIcon size={14} />
                {DAMAGE_TYPE_LABELS[key]}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {RESISTANCE_LABELS[state]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <SectionHeading
        checked={card.toggles.showNotes}
        onToggle={(v) => setToggle("showNotes", v)}
      >
        Notes
      </SectionHeading>
      <Field>
        <textarea
          className={inputClass + " min-h-20 resize-y"}
          placeholder="DM-only notes, printed at the bottom of the DM face"
          value={card.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>

      {confirmingClear && (
        <ConfirmModal
          title="Clear card"
          message="Reset this card to a blank state? This cannot be undone."
          confirmLabel="Clear"
          onConfirm={() => {
            onChange(emptyCard(card.id));
            setConfirmingClear(false);
          }}
          onCancel={() => setConfirmingClear(false)}
        />
      )}
    </div>
  );
}
