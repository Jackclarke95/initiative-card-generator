"use client";

import { useState } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { DAMAGE_TYPE_REACT_ICONS } from "@/components/DamageTypeBadge";
import SegmentedToggle from "@/components/SegmentedToggle";
import { createCardUpdater, nextResistanceState } from "@/lib/cardUpdate";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  ABILITY_SCORE_MODE_LABELS,
  ABILITY_SCORE_MODES,
  ART_MODE_LABELS,
  ART_MODES,
  DAMAGE_DISPLAY_LABELS,
  DAMAGE_DISPLAY_MODES,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  NOTES_DISPLAY_LABELS,
  NOTES_DISPLAY_MODES,
  SCROLL_STYLE_LABELS,
  SCROLL_STYLE_MODES,
  VITALS_MODE_LABELS,
  VITALS_MODES,
  type CardData,
  type ResistanceState,
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
  right,
}: {
  children: React.ReactNode;
  /** Arbitrary content rendered on the right side of the heading — e.g. a
   *  display-mode segmented toggle. */
  right?: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] mt-4 mb-2 border-b border-[var(--border)] pb-1">
      <span>{children}</span>
      {right}
    </h3>
  );
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
  const [draggingArt, setDraggingArt] = useState(false);

  const { set, setNum, setStat, setResistance, setToggle } = createCardUpdater(
    card,
    onChange,
  );

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
        right={
          <SegmentedToggle
            options={VITALS_MODES.map((mode) => ({
              value: mode,
              label: VITALS_MODE_LABELS[mode],
            }))}
            value={card.toggles.vitals}
            onChange={(mode) => setToggle("vitals", mode)}
            size="sm"
          />
        }
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
        right={
          <SegmentedToggle
            options={ABILITY_SCORE_MODES.map((mode) => ({
              value: mode,
              label: ABILITY_SCORE_MODE_LABELS[mode],
            }))}
            value={card.toggles.abilityScores}
            onChange={(mode) => setToggle("abilityScores", mode)}
            size="sm"
          />
        }
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
        right={
          <SegmentedToggle
            options={NOTES_DISPLAY_MODES.map((mode) => ({
              value: mode,
              label: NOTES_DISPLAY_LABELS[mode],
            }))}
            value={card.toggles.notesDisplayMode}
            onChange={(mode) => setToggle("notesDisplayMode", mode)}
          />
        }
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
