"use client";

import { useState } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { DAMAGE_TYPE_REACT_ICONS } from "@/components/CardFrames";
import SegmentedToggle from "@/components/SegmentedToggle";
import VisibilityToggle from "@/components/VisibilityToggle";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  type AbilityKey,
  type AbilityStat,
  type ArtMode,
  type CardData,
  type DamageDisplayMode,
  type DamageTypeKey,
  type ResistanceState,
  type ScrollStyle,
} from "@/types/card";

const CLASS_OPTIONS = Object.keys(CLASS_LOGO_MAP);

interface CardEditorProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

// ── Small form helpers ────────────────────────────────────────────────

function Field({
  label,
  labelExtra,
  children,
}: {
  label?: string;
  /** Optional content rendered inline with the label, right-aligned — e.g.
   *  a visibility toggle. */
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
        <span>{label}</span>
        {labelExtra}
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
  right,
}: {
  children: React.ReactNode;
  /** When provided, renders a show/hide toggle for this section on the
   *  DM face, alongside the heading text. */
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  /** Arbitrary content rendered on the right side of the heading instead
   *  of the show/hide toggle — e.g. the resistances display-type toggle. */
  right?: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] mt-4 mb-2 border-b border-[var(--border)] pb-1">
      <span>{children}</span>
      {right ??
        (onToggle && (
          <VisibilityToggle checked={checked ?? false} onChange={onToggle} />
        ))}
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
  all: "All",
  icon: "Icons",
  initials: "Initials",
  none: "None",
};

const DAMAGE_DISPLAY_MODES: DamageDisplayMode[] = [
  "all",
  "icon",
  "initials",
  "none",
];

const ART_MODE_LABELS: Record<ArtMode, string> = {
  class: "Class Art",
  upload: "Upload Image",
  link: "Image URL",
  none: "No Art",
};

const ART_MODES: ArtMode[] = ["class", "upload", "link", "none"];

const SCROLL_STYLE_LABELS: Record<ScrollStyle, string> = {
  scroll: "Scroll",
  dragon: "Dragon",
  party: "Party",
  none: "None",
};

const SCROLL_STYLE_MODES: ScrollStyle[] = ["scroll", "dragon", "party", "none"];

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
  const [draggingArt, setDraggingArt] = useState(false);

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

  function setToggle<K extends keyof CardData["toggles"]>(
    key: K,
    value: CardData["toggles"][K],
  ) {
    onChange({ ...card, toggles: { ...card.toggles, [key]: value } });
  }

  function handleArtUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("portraitUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-1 text-[var(--text-primary)]">
      {/* Identity */}
      <SectionHeading>Identity</SectionHeading>
      <Field label="Name">
        <input
          className={inputClass}
          value={card.characterName}
          onChange={(e) => set("characterName", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Player Scroll">
          <SegmentedToggle
            options={SCROLL_STYLE_MODES.map((mode) => ({
              value: mode,
              label: SCROLL_STYLE_LABELS[mode],
            }))}
            value={card.toggles.nameScrollPlayer}
            onChange={(mode) => setToggle("nameScrollPlayer", mode)}
            size="xs"
          />
        </Field>
        <Field label="DM Scroll">
          <SegmentedToggle
            options={SCROLL_STYLE_MODES.map((mode) => ({
              value: mode,
              label: SCROLL_STYLE_LABELS[mode],
            }))}
            value={card.toggles.nameScrollDm}
            onChange={(mode) => setToggle("nameScrollDm", mode)}
            size="xs"
          />
        </Field>
      </div>

      {/* Not a Field (<label>): a <label> wrapping a button group makes
       *  clicking the heading text activate the first button, silently
       *  overriding whichever mode was selected. */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Card Art
        </span>
        <SegmentedToggle
          options={ART_MODES.map((mode) => ({
            value: mode,
            label: ART_MODE_LABELS[mode],
          }))}
          value={card.artMode}
          onChange={(mode) => set("artMode", mode)}
        />
        {card.artMode === "class" && (
          <select
            className={inputClass + " mt-1"}
            value={card.characterClass}
            onChange={(e) => set("characterClass", e.target.value)}
          >
            <option value="">Select a class…</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {card.artMode === "link" && (
          <input
            className={inputClass + " mt-1"}
            type="url"
            placeholder="Image URL"
            value={card.portraitUrl}
            onChange={(e) => set("portraitUrl", e.target.value)}
          />
        )}
        {card.artMode === "upload" && (
          <label
            className={
              inputClass +
              " mt-1 text-center cursor-pointer normal-case transition-colors"
            }
            style={{
              borderColor: draggingArt ? "var(--accent)" : "var(--border)",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingArt(true);
            }}
            onDragLeave={() => setDraggingArt(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingArt(false);
              handleArtUpload(e.dataTransfer.files?.[0]);
            }}
          >
            {draggingArt ? "Drop image…" : "Upload or drop image…"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleArtUpload(e.target.files?.[0])}
            />
          </label>
        )}
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
        right={
          <SegmentedToggle
            options={DAMAGE_DISPLAY_MODES.map((mode) => ({
              value: mode,
              label: DAMAGE_DISPLAY_LABELS[mode],
            }))}
            value={card.damageDisplayMode}
            onChange={(mode) => set("damageDisplayMode", mode)}
          />
        }
      >
        Resistances
      </SectionHeading>
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-1"
        style={{
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(${Math.ceil(DAMAGE_TYPE_KEYS.length / 2)}, auto)`,
        }}
      >
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
    </div>
  );
}
