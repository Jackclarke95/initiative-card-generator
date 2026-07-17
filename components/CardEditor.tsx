"use client";

import { useRef, useState } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { DAMAGE_TYPE_REACT_ICONS } from "@/components/DamageTypeBadge";
import SegmentedToggle from "@/components/SegmentedToggle";
import { createCardUpdater, nextResistanceState } from "@/lib/cardUpdate";
import { useFlipAnimation } from "@/components/useFlipAnimation";
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
  VITAL_FRAME_LABELS,
  VITAL_FRAME_SHAPES,
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
  const [draggedVitalId, setDraggedVitalId] = useState<string | null>(null);
  // Index (0..vitalBoxes.length) the dragged box would land at if dropped
  // right now — i.e. "insert before this position" — drawn as a line
  // between the two rows it'd sit between. Recomputed from the pointer's Y
  // position within whichever row it's currently over.
  const [vitalInsertAt, setVitalInsertAt] = useState<number | null>(null);
  const vitalListRef = useFlipAnimation<HTMLDivElement>();
  // dragenter/dragleave bubble from every nested row (and the insertion-line
  // divs), so a plain "did we leave?" boolean would clear the line while the
  // pointer is still over the list, just crossing from one child to
  // another — see CardFaces.tsx's VitalBox for the same fix. Only once every
  // nested enter has been balanced by a leave has the pointer actually left
  // the list for good (wherever the browser would show "not-allowed"), which
  // is when the line should disappear instead of sitting on stale.
  const vitalDragDepth = useRef(0);

  function commitVitalMove() {
    if (draggedVitalId && vitalInsertAt !== null) {
      const fromIndex = card.vitalBoxes.findIndex(
        (box) => box.id === draggedVitalId,
      );
      // moveVitalBox's `toIndex` applies after the dragged box is already
      // removed from the list — dropping it after its own original spot
      // shifts every following index down by one, so account for that here
      // rather than pushing that adjustment into moveVitalBox itself.
      const toIndex =
        fromIndex !== -1 && fromIndex < vitalInsertAt
          ? vitalInsertAt - 1
          : vitalInsertAt;
      moveVitalBox(draggedVitalId, toIndex);
    }
    vitalDragDepth.current = 0;
    setDraggedVitalId(null);
    setVitalInsertAt(null);
  }

  const {
    set,
    setStat,
    setResistance,
    setToggle,
    setVitalBox,
    setVitalBoxNum,
    addVitalBox,
    removeVitalBox,
    moveVitalBox,
  } = createCardUpdater(card, onChange);

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
      <div
        ref={vitalListRef}
        className="flex flex-col gap-1"
        // Catch-all: the gap between rows (and the insertion-line divs
        // living in it) belongs to no row's own onDragOver, so without this
        // the browser shows its default "not-allowed" cursor there even
        // though dropping in that gap is exactly what places the line.
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => {
          vitalDragDepth.current += 1;
        }}
        onDragLeave={() => {
          vitalDragDepth.current -= 1;
          if (vitalDragDepth.current <= 0) {
            vitalDragDepth.current = 0;
            setVitalInsertAt(null);
          }
        }}
      >
        {card.vitalBoxes.map((box, i) => (
          <div key={box.id} data-flip-id={box.id}>
            <div
              className="rounded-full bg-[var(--accent)]"
              style={{
                height: 2,
                margin: "3px 0",
                visibility: vitalInsertAt === i ? "visible" : "hidden",
              }}
            />
            <div
              className="flex items-center gap-1.5"
              style={{ opacity: draggedVitalId === box.id ? 0.4 : 1 }}
              onDragOver={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const before = e.clientY - rect.top < rect.height / 2;
                setVitalInsertAt(before ? i : i + 1);
              }}
              onDrop={(e) => {
                e.preventDefault();
                commitVitalMove();
              }}
            >
              <span
                className="cursor-grab select-none text-[var(--text-muted)] px-0.5"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedVitalId(box.id);
                }}
                onDragEnd={() => {
                  // Fires after onDrop's commit in a real drop (a no-op by
                  // then) as well as after a drop outside any row, where it's
                  // the only thing that clears the leftover drag state.
                  vitalDragDepth.current = 0;
                  setDraggedVitalId(null);
                  setVitalInsertAt(null);
                }}
                aria-hidden
              >
                ⠿
              </span>
              <input
                className={inputClass + " flex-[2]"}
                placeholder="Label"
                value={box.label}
                onChange={(e) =>
                  setVitalBox(box.id, { label: e.target.value })
                }
              />
              <input
                className={numClass + " flex-1"}
                type="number"
                placeholder="Value"
                value={box.value ?? ""}
                onChange={(e) => setVitalBoxNum(box.id, e.target.value)}
              />
              <select
                className={inputClass + " flex-1"}
                value={box.frame}
                onChange={(e) =>
                  setVitalBox(box.id, {
                    frame: e.target.value as (typeof VITAL_FRAME_SHAPES)[number],
                  })
                }
              >
                {VITAL_FRAME_SHAPES.map((shape) => (
                  <option key={shape} value={shape}>
                    {VITAL_FRAME_LABELS[shape]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Remove vital box"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1"
                onClick={() => removeVitalBox(box.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <div
          className="rounded-full bg-[var(--accent)]"
          style={{
            height: 2,
            margin: "3px 0",
            visibility:
              vitalInsertAt === card.vitalBoxes.length ? "visible" : "hidden",
          }}
        />
        <button
          type="button"
          className={inputClass + " mt-1 text-center normal-case"}
          onClick={addVitalBox}
        >
          + Add Vital Box
        </button>
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
