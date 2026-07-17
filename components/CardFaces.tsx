"use client";

import { Fragment, useRef, useState } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { PALE_GREY } from "@/components/frames/Frame";
import { Border5e } from "@/components/frames/shared/Border5e";
import { VITAL_FRAME_COMPONENTS } from "@/components/frames/vitals/registry";
import { AbilityScore } from "@/components/frames/ability-scores/AbilityScoreFrame";
import { SCROLL_STYLES } from "@/components/frames/name";
import { NotesFrame } from "@/components/frames/notes/NotesFrame";
import { DamageTypeBadge } from "@/components/DamageTypeBadge";
import { useCardEdit } from "@/components/CardEditContext";
import {
  EditableValue,
  EditableOverlay,
  EditableHit,
  useEditMenu,
  useGroupedEditMenu,
} from "@/components/InlineEdit";
import { nextResistanceState } from "@/lib/cardUpdate";
import {
  PLAYER_BORDER_MARGIN_HEIGHT,
  PLAYER_BORDER_MARGIN_WIDTH,
  scrollHeightFor,
} from "@/lib/cardLayout";
import {
  computeVitalRowLayout,
  maxVitalColumns,
  VITAL_ICON_H,
  vitalBoxMetrics,
  vitalRowGridWidth,
  vitalRowJustifyContent,
} from "@/lib/vitalsLayout";
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
  type ScrollStyle,
  type VitalBoxConfig,
  type VitalFrameShape,
  type VitalsDisplayMode,
} from "@/types/card";

// All class names offered by the inline class-art picker.
const CLASS_OPTIONS = Object.keys(CLASS_LOGO_MAP);

// Right-click display-mode menu options, built from the same lists the
// sidebar's segmented toggles use.
const SCROLL_MENU = SCROLL_STYLE_MODES.map((m) => ({
  value: m,
  label: SCROLL_STYLE_LABELS[m],
}));
const VITALS_MENU = VITALS_MODES.map((m) => ({
  value: m,
  label: VITALS_MODE_LABELS[m],
}));
const ABILITY_MENU = ABILITY_SCORE_MODES.map((m) => ({
  value: m,
  label: ABILITY_SCORE_MODE_LABELS[m],
}));
const DAMAGE_MENU = DAMAGE_DISPLAY_MODES.map((m) => ({
  value: m,
  label: DAMAGE_DISPLAY_LABELS[m],
}));
const NOTES_MENU = NOTES_DISPLAY_MODES.map((m) => ({
  value: m,
  label: NOTES_DISPLAY_LABELS[m],
}));

// Height of the transparent hit strip laid over an AbilityScore's proficiency
// dot, matching its reserved dot zone (dotR*2 + dotTopGap + dotBottomGap =
// 2.6*2 + 2 + 4 ≈ 11.2), rounded up.
const DOT_HIT_H = 12;

// ARIA tri-state for a resistance dot, mirroring CardEditor's checkbox.
function resistanceAriaChecked(state: ResistanceState): boolean | "mixed" {
  return state === "immune" ? true : state === "resistant" ? "mixed" : false;
}

// Vertical position of the straight editable name line within the banner box.
// The styled scrolls (dragon/battle/spell) carry artwork above the ribbon, so
// their ribbon sits lower; the plain scroll is centered.
function nameInputTop(variant: ScrollStyle): string {
  return variant === "scroll" || variant === "none" ? "50%" : "63%";
}

// Reference card face size — 2.5in × 3.5in = 240 × 336 px — used as the
// default when a face isn't given an explicit width/height. Every
// width-derived measurement below (content area, scroll banner width,
// vitals grid) is expressed as a fixed inset from the actual `width` prop
// rather than a proportional scale, preserving the margins this size was
// tuned at as the card grows or shrinks.
export const FACE_W = 240;
export const FACE_H = 336;

// Right-click a vital box to change its frame shape, mirroring the other
// section-level display-mode menus.
const VITAL_FRAME_MENU = VITAL_FRAME_SHAPES.map((shape) => ({
  value: shape,
  label: VITAL_FRAME_LABELS[shape],
}));

// One box in the vitals row — set, order, labels, values, and frame shapes
// all come from `card.vitalBoxes`; this just renders whichever one it's
// given. A standalone component (rather than inline in a .map) so each
// box's own right-click menu can hold its own hook state regardless of how
// many boxes are in the list at a given moment.
function VitalBox({
  box,
  width,
  height,
  sidePadding,
  showLabel,
  vitalsMode,
  draggedId,
  onDragStart,
  onDragEnd,
  onDropAt,
}: {
  box: VitalBoxConfig;
  width: number;
  height: number;
  sidePadding: number;
  showLabel: boolean;
  vitalsMode: VitalsDisplayMode;
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropAt: () => void;
}) {
  const { editable, update } = useCardEdit();
  const [dragOver, setDragOver] = useState(false);
  // dragenter/dragleave bubble from every nested child (the drag handle,
  // the editable span, its wrapper divs), so moving the pointer between two
  // of this box's own children fires a dragleave here before the matching
  // dragenter — a plain boolean would flip dragOver off mid-hover. A depth
  // counter only clears it once every nested enter has been balanced by a
  // leave, i.e. the pointer has actually left the box itself.
  const dragDepth = useRef(0);
  const Component = VITAL_FRAME_COMPONENTS[box.frame];
  // Two unrelated settings share this one right-click popup: the frame
  // shape is per-box, but compactness is section-wide — right-clicking any
  // single box is the only "right-click a vital" gesture there is, so it
  // has to be the entry point for both, clearly separated by heading so
  // picking one doesn't read as only affecting the box you clicked.
  const frameMenu = useGroupedEditMenu([
    {
      heading: "Section Settings",
      options: VITALS_MENU,
      value: vitalsMode,
      onSelect: (v) => update?.setToggle("vitals", v as VitalsDisplayMode),
    },
    {
      heading: "Frame Icon",
      options: VITAL_FRAME_MENU,
      value: box.frame,
      onSelect: (shape) =>
        update?.setVitalBox(box.id, { frame: shape as VitalFrameShape }),
    },
  ]);

  return (
    <div
      data-flip-id={box.id}
      style={{
        position: "relative",
        opacity: draggedId === box.id ? 0.4 : 1,
        outline: dragOver ? "1.5px dashed var(--accent)" : undefined,
        outlineOffset: 1,
        borderRadius: 3,
      }}
      onContextMenu={frameMenu.onContextMenu}
      onDragOver={
        editable
          ? (e) => {
              e.preventDefault();
            }
          : undefined
      }
      onDragEnter={
        editable
          ? () => {
              dragDepth.current += 1;
              setDragOver(true);
            }
          : undefined
      }
      onDragLeave={
        editable
          ? () => {
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setDragOver(false);
              }
            }
          : undefined
      }
      onDrop={
        editable
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              dragDepth.current = 0;
              setDragOver(false);
              onDropAt();
            }
          : undefined
      }
    >
      <EditableValue
        commit={(raw) => update?.setVitalBoxValue(box.id, raw)}
        label={box.label || "Vital box value"}
        labelCommit={(raw) => update?.setVitalBox(box.id, { label: raw })}
        labelFieldLabel={`${box.label || "Vital box"} label`}
        wheelStep={1}
        forceHighlight={frameMenu.isOpen}
        overlay={
          editable && (
            <span
              className="vital-drag-handle"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                onDragStart(box.id);
              }}
              onDragEnd={onDragEnd}
              aria-hidden
            >
              ⠿
            </span>
          )
        }
      >
        <Component
          value={box.value}
          label={showLabel ? box.label : undefined}
          width={width}
          height={height}
          sidePadding={sidePadding}
        />
      </EditableValue>
      {frameMenu.menu}
    </div>
  );
}

interface DmFaceProps {
  card: CardData;
  /** Card face width/height, px. Default to the reference poker size. */
  width?: number;
  height?: number;
}

export function DmFace({ card, width = FACE_W, height = FACE_H }: DmFaceProps) {
  const { editable, update } = useCardEdit();
  const CONTENT_W = width - 2 - 16;
  const DM_SCROLL_W = CONTENT_W; // Name banner on the DM side — full row width
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = { shW: 52, gap: 2 };
  // All six stat badges share one height so both rows read as one
  // consistent size — back to the original (pre-unification) size.
  const iconH = VITAL_ICON_H;
  // Every vitals badge shares one identical box — same height (iconH) and
  // same width, so a shape whose art is naturally narrower isn't stretched
  // to fill it (it just centers within the shared box, same as the
  // value/label overlay does, keeping every column's frames aligned on
  // one shared centerline) — the art is the only thing that varies. How
  // many columns actually fit at this width, and the shared box size that
  // gives them (rounded to whole pixels — fractional CSS dimensions are
  // subject to subpixel rounding that can get re-snapped differently
  // across repaints, which is exactly the kind of instability that showed
  // up as vitals badges' values shifting on edit while whole-pixel-sized
  // Ability Scores never did), both live in lib/vitalsLayout.ts so the
  // sidebar form can offer the same column-count ceiling.
  const maxVitalCols = maxVitalColumns(CONTENT_W, iconH);
  const { vitalW, vitalGap } = vitalBoxMetrics(CONTENT_W, iconH, maxVitalCols);
  // The value's own available width doesn't need to track the box's full
  // (now wider) width — it only needs to be wide enough that a 3-digit
  // value (e.g. a high max HP) still renders at the full cap size;
  // anything longer than that shrinking below the cap is fine (that's
  // just Frame's own width-fit clamp doing its job). Solving
  // maxW*1.5/text.length = cap for text.length=3 gives maxW = cap*2;
  // whatever's left of vitalW beyond that becomes side padding instead.
  // A little extra on top of that: free-text values ("12/15", "40*") are
  // wider per character than a bare number reads, and butt up against the
  // frame's own edge right at the cap size before the length-based shrink
  // has kicked in — this trims the available width a bit further so it
  // shrinks sooner, without needing to pad the text with spaces by hand.
  const vitalMaxValueSize = 26; // matches VitalsFrame's own default cap
  const VITAL_VALUE_EXTRA_INSET = 3;
  const vitalSidePadding =
    Math.max(0, Math.round((vitalW - vitalMaxValueSize * 2) / 2)) +
    VITAL_VALUE_EXTRA_INSET;
  // How card.vitalRows' explicit per-row counts actually render right now —
  // clamped by however many columns actually fit at this width, splitting a
  // row into extra chunks if it's currently too wide to show in one.
  const vitalRowLayout = computeVitalRowLayout(card.vitalRows, maxVitalCols);

  const statGap = 4;

  // Each of the five DM-face sections is independently optional. When
  // Notes stays on, it keeps eating whatever space the hidden sections
  // free up (its wrapper is flex:1, same as before). When Notes is off
  // there's no elastic filler left, so the remaining sections switch to
  // justify-content: space-between instead, spreading themselves across
  // the full height with the first flush to the top and the last flush
  // to the bottom — with only one section left, there's nothing to
  // spread it against, so it's centered instead.
  const toggles = card.toggles;
  const notesMode = toggles.notesDisplayMode;
  const showNotes = notesMode !== "none";

  const dmScrollVariant = toggles.nameScrollDm;
  const showNameOnDm = dmScrollVariant !== "none";
  const DmNameScroll =
    dmScrollVariant === "none"
      ? undefined
      : SCROLL_STYLES[dmScrollVariant].Component;
  // The dragon and battle ribbons are noticeably taller than the plain one
  // at the same width — rather than let that squeeze the fixed-size
  // sections below (vitals, abilities, etc.), each of those gets
  // flexShrink: 0 so Notes (flex: 1) is the only thing that gives up
  // space, and the gap between sections tightens up to help it along.
  const dmScrollTall =
    dmScrollVariant !== "scroll" && dmScrollVariant !== "none";
  const sectionGap = dmScrollTall ? Math.max(1, S.gap - 1) : S.gap;

  const abilityMode = toggles.abilityScores;
  const vitalsMode = toggles.vitals;
  const showVitalsLabels = vitalsMode === "full";

  // Right-click display-mode menus (inert unless editing). Each mirrors the
  // matching segmented toggle in the sidebar form.
  const nameMenu = useEditMenu(SCROLL_MENU, dmScrollVariant, (v) =>
    update?.setToggle("nameScrollDm", v),
  );
  const vitalsMenu = useEditMenu(VITALS_MENU, vitalsMode, (v) =>
    update?.setToggle("vitals", v),
  );
  const abilitiesMenu = useEditMenu(ABILITY_MENU, abilityMode, (v) =>
    update?.setToggle("abilityScores", v),
  );
  const resistMenu = useEditMenu(DAMAGE_MENU, card.damageDisplayMode, (v) =>
    update?.set("damageDisplayMode", v),
  );
  const notesMenu = useEditMenu(NOTES_MENU, notesMode, (v) =>
    update?.setToggle("notesDisplayMode", v),
  );

  // Drag-and-drop reordering of the vitals row — a box's own little handle
  // (see VitalBox) starts the drag; dropping onto another box moves it there.
  const [draggedVitalId, setDraggedVitalId] = useState<string | null>(null);
  const vitalsGridRef = useFlipAnimation<HTMLDivElement>();

  const sections = [
    showNameOnDm && (
      <div
        key="name"
        className={editable ? `edit-section${nameMenu.menuOpenClass}` : undefined}
        style={{ flexShrink: 0 }}
        onContextMenu={nameMenu.onContextMenu}
      >
        <EditableOverlay
          value={card.characterName}
          commit={(raw) => update?.set("characterName", raw)}
          label="Character name"
          inputStyle={{ fontSize: 15, top: nameInputTop(dmScrollVariant) }}
        >
          {DmNameScroll && (
            <DmNameScroll
              value={card.characterName}
              width={DM_SCROLL_W}
              height={scrollHeightFor(dmScrollVariant, DM_SCROLL_W)}
            />
          )}
        </EditableOverlay>
        {nameMenu.menu}
      </div>
    ),
    vitalsMode !== "none" && (
      <div
        key="vitals"
        ref={vitalsGridRef}
        className={editable ? `edit-section${vitalsMenu.menuOpenClass}` : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: vitalGap,
          flexShrink: 0,
        }}
        onContextMenu={vitalsMenu.onContextMenu}
      >
        {vitalRowLayout.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            style={{
              display: "flex",
              // Every row's alignment grid spans the same full width — the
              // card's own maxVitalCols, not this row's (possibly smaller)
              // configured column count — so a "2 per row" row on a wider
              // card still stretches (and its badges still grow) along with
              // the card, instead of staying pinned to a fixed, narrow span.
              width: vitalRowGridWidth(maxVitalCols, vitalW, vitalGap),
              justifyContent: vitalRowJustifyContent(chunk.align),
              gap: vitalGap,
            }}
            onDragOver={editable ? (e) => e.preventDefault() : undefined}
            onDrop={
              editable
                ? (e) => {
                    e.preventDefault();
                    if (draggedVitalId) {
                      update?.moveVitalBox(
                        draggedVitalId,
                        chunk.rowIndex,
                        chunk.rowOffset + chunk.count,
                      );
                    }
                    setDraggedVitalId(null);
                  }
                : undefined
            }
          >
            {card.vitalBoxes
              .slice(chunk.start, chunk.start + chunk.count)
              .map((box, i) => (
                <VitalBox
                  key={box.id}
                  box={box}
                  width={vitalW}
                  height={iconH}
                  sidePadding={vitalSidePadding}
                  showLabel={showVitalsLabels}
                  vitalsMode={vitalsMode}
                  draggedId={draggedVitalId}
                  onDragStart={setDraggedVitalId}
                  onDragEnd={() => setDraggedVitalId(null)}
                  onDropAt={() => {
                    if (draggedVitalId) {
                      update?.moveVitalBox(
                        draggedVitalId,
                        chunk.rowIndex,
                        chunk.rowOffset + i,
                      );
                    }
                    setDraggedVitalId(null);
                  }}
                />
              ))}
          </div>
        ))}
        {vitalsMenu.menu}
      </div>
    ),
    abilityMode !== "none" && (
      <div
        key="abilities"
        className={editable ? `edit-section${abilitiesMenu.menuOpenClass}` : undefined}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: statGap,
          flexShrink: 0,
        }}
        onContextMenu={abilitiesMenu.onContextMenu}
      >
        {ABILITY_KEYS.map((key) => (
          <EditableValue
            key={key}
            commit={(raw) => update?.setStat(key, { modifier: raw })}
            label={`${ABILITY_LABELS[key]} modifier`}
            wheelStep={1}
            overlay={
              <EditableHit
                label={`${ABILITY_LABELS[key]} proficiency`}
                role="checkbox"
                ariaChecked={card.stats[key].proficiency}
                onActivate={() =>
                  update?.setStat(key, {
                    proficiency: !card.stats[key].proficiency,
                  })
                }
                style={{
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: DOT_HIT_H,
                  zIndex: 2,
                }}
              />
            }
          >
            <AbilityScore
              label={abilityMode === "full" ? ABILITY_LABELS[key] : undefined}
              value={card.stats[key].modifier}
              proficiency={card.stats[key].proficiency}
            />
          </EditableValue>
        ))}
        {abilitiesMenu.menu}
      </div>
    ),
    // Damage types — resistant/immune, dashed dividers between entries
    // rather than an outer box.
    card.damageDisplayMode !== "none" && (
      <div
        key="defences"
        className={editable ? `edit-section${resistMenu.menuOpenClass}` : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          marginTop: showNotes ? 4 : 0,
          flexShrink: 0,
        }}
        onContextMenu={resistMenu.onContextMenu}
      >
        {DAMAGE_TYPE_KEYS.map((key, i) => {
          const badge = (
            <DamageTypeBadge
              label={DAMAGE_TYPE_LABELS[key]}
              damageType={key}
              state={card.resistances[key]}
              displayMode={card.damageDisplayMode}
            />
          );
          return (
            <Fragment key={key}>
              {i > 0 && (
                <div
                  style={{
                    alignSelf: "stretch",
                    borderLeft: `1px dashed ${PALE_GREY}`,
                  }}
                />
              )}
              {editable ? (
                <div style={{ position: "relative", display: "inline-flex" }}>
                  {badge}
                  <EditableHit
                    label={`Cycle ${DAMAGE_TYPE_LABELS[key]} resistance`}
                    role="checkbox"
                    ariaChecked={resistanceAriaChecked(card.resistances[key])}
                    onActivate={() =>
                      update?.setResistance(
                        key,
                        nextResistanceState(card.resistances[key]),
                      )
                    }
                    style={{ inset: 0, zIndex: 1 }}
                  />
                </div>
              ) : (
                badge
              )}
            </Fragment>
          );
        })}
        {resistMenu.menu}
      </div>
    ),
  ].filter(Boolean);

  // Total optional sections above Notes; how many of those are currently
  // hidden decides how much extra breathing room the rest get once Notes
  // itself is off (see below).
  const SPREADABLE_SECTION_COUNT = 4;
  const hiddenSectionCount = SPREADABLE_SECTION_COUNT - sections.length;

  return (
    <div
      className="card-face"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 8,
        width,
        height,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ...(showNotes
            ? { gap: sectionGap * (1 + hiddenSectionCount) }
            : {
                // No elastic Notes filler left, so the remaining sections
                // spread across the full height instead: justify-content
                // keeps the first section flush to the top and the last
                // flush to the bottom (or centers a lone survivor), while
                // the explicit gap below sets a growing minimum between
                // them — doubling per extra hidden section — so the more
                // sections are removed, the more deliberate space shows up
                // between what's left, on top of whatever space-between
                // adds automatically.
                justifyContent:
                  sections.length > 1 ? "space-between" : "center",
                gap: sectionGap,
              }),
        }}
      >
        {sections}

        {/* Notes — eats whatever vertical space is left at the bottom */}
        {showNotes && (
          <div
            className={editable ? `edit-section${notesMenu.menuOpenClass}` : undefined}
            style={{
              flex: 1,
              minHeight: 0,
              marginTop: sections.length > 0 ? 4 : 0,
            }}
            onContextMenu={notesMenu.onContextMenu}
          >
            <EditableValue
              commit={(raw) => update?.set("notes", raw)}
              label="DM notes"
              multiline
              wrapperStyle={{ height: "100%" }}
            >
              <NotesFrame
                value={card.notes}
                label={notesMode !== "unlabeled" ? "Notes" : undefined}
              />
            </EditableValue>
            {notesMenu.menu}
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerFaceProps {
  card: CardData;
  /** The fold-ready layout prints the player face upside down (relative
   *  to the DM face) so folding the sheet in half lines the two faces
   *  up back-to-back. Preview contexts that show both faces side by
   *  side want it right-side up instead. */
  rotated?: boolean;
  /** Card face width/height, px. Default to the reference poker size. */
  width?: number;
  height?: number;
}

export function PlayerFace({
  card,
  rotated = true,
  width = FACE_W,
  height = FACE_H,
}: PlayerFaceProps) {
  const { editable, update } = useCardEdit();
  const playerScrollVariant = card.toggles.nameScrollPlayer;
  const showNameOnPlayer = playerScrollVariant !== "none";
  const PlayerNameScroll =
    playerScrollVariant === "none"
      ? undefined
      : SCROLL_STYLES[playerScrollVariant].Component;
  const SCROLL_W = width - 40;

  // Right-click the player-side scroll to switch its style (mirrors the
  // sidebar's "Player Scroll" toggle).
  const nameMenu = useEditMenu(SCROLL_MENU, playerScrollVariant, (v) =>
    update?.setToggle("nameScrollPlayer", v),
  );
  const scrollH =
    playerScrollVariant !== "none"
      ? scrollHeightFor(playerScrollVariant, SCROLL_W)
      : 0;

  // Right-click the art to switch art style (mirrors the sidebar's "Card
  // Art" toggle). "Class Art" carries a second-level submenu for picking the
  // specific class, which sets the mode and class together.
  const artMenu = useEditMenu(
    ART_MODES.map((m) =>
      m === "class"
        ? {
            value: m,
            label: ART_MODE_LABELS[m],
            submenu: CLASS_OPTIONS.map((c) => ({
              label: c,
              selected: c === card.characterClass,
              onSelect: () =>
                update?.patch({ artMode: "class", characterClass: c }),
            })),
          }
        : { value: m, label: ART_MODE_LABELS[m] },
    ),
    card.artMode,
    (v) => update?.set("artMode", v),
  );

  const classKey = Object.keys(CLASS_LOGO_MAP).find(
    (k) => k.toLowerCase() === card.characterClass.trim().toLowerCase(),
  );
  const Logo =
    card.artMode === "class" && classKey ? CLASS_LOGO_MAP[classKey] : undefined;
  const useCustomArt =
    (card.artMode === "upload" || card.artMode === "link") &&
    !!card.portraitUrl;

  const contentW = width - 2 - PLAYER_BORDER_MARGIN_WIDTH * 2;
  const contentH = height - 2 - PLAYER_BORDER_MARGIN_HEIGHT * 2;
  const ART_BOTTOM_MARGIN = 8;
  // The ornate Border5e frame's ink sits a bit inside the content box's own
  // edges (it's drawn right up to contentW/contentH, but the art within it
  // isn't) — without this, art sized to the full content width visually
  // overlaps the border art on the sides.
  const ART_SIDE_MARGIN = 16;

  return (
    <div
      className={rotated ? "card-face card-player-face" : "card-face"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width,
        height,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: PLAYER_BORDER_MARGIN_HEIGHT,
          left: PLAYER_BORDER_MARGIN_WIDTH,
          width: contentW,
          height: contentH,
        }}
      >
        <Border5e width={contentW} height={contentH} />
      </div>
      <div
        style={{
          position: "absolute",
          top: PLAYER_BORDER_MARGIN_HEIGHT,
          left: PLAYER_BORDER_MARGIN_WIDTH,
          width: contentW,
          height: contentH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {showNameOnPlayer && (
          <div
            className={editable ? `edit-section${nameMenu.menuOpenClass}` : undefined}
            style={{ flexShrink: 0, marginTop: 4 }}
            onContextMenu={nameMenu.onContextMenu}
          >
            <EditableOverlay
              value={card.characterName}
              commit={(raw) => update?.set("characterName", raw)}
              label="Character name"
              inputStyle={{
                fontSize: 15,
                top: nameInputTop(playerScrollVariant),
              }}
            >
              {PlayerNameScroll && (
                <PlayerNameScroll
                  width={SCROLL_W}
                  height={scrollH}
                  value={card.characterName}
                />
              )}
            </EditableOverlay>
            {nameMenu.menu}
          </div>
        )}
        <div
          className={editable ? `edit-section${artMenu.menuOpenClass}` : undefined}
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: ART_BOTTOM_MARGIN,
            paddingLeft: ART_SIDE_MARGIN,
            paddingRight: ART_SIDE_MARGIN,
            color: "#111",
          }}
          onContextMenu={artMenu.onContextMenu}
        >
          {useCustomArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.portraitUrl}
              alt=""
              crossOrigin="anonymous"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            // Same fit as the uploaded/linked image above: a size big
            // enough to never be the limiting factor, then CSS max-width/
            // max-height shrink it to whatever room is actually left,
            // uniformly (the logo's own square viewBox keeps it from
            // distorting even when that leftover space isn't square).
            Logo && <Logo size={contentH} className="max-w-full max-h-full" />
          )}
          {/* Right-click anywhere in the art area to switch art style, or
              hover "Class Art" for the class submenu (inert unless editing). */}
          {artMenu.menu}
        </div>
      </div>
    </div>
  );
}
