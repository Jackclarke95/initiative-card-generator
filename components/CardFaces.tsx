"use client";

import { Fragment } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { PALE_GREY } from "@/components/frames/Frame";
import { Border5e } from "@/components/frames/shared/Border5e";
import { Chevron, Heart, Hexagon, Orb, SaveBox, Shield } from "@/components/frames/vitals";
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
} from "@/components/InlineEdit";
import { nextResistanceState } from "@/lib/cardUpdate";
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
  type ScrollStyle,
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
// The styled scrolls (dragon/party/spell) carry artwork above the ribbon, so
// their ribbon sits lower; the plain scroll is centered.
function nameInputTop(variant: ScrollStyle): string {
  return variant === "scroll" || variant === "none" ? "50%" : "63%";
}

// Card face: 2.5in × 3.5in = 240 × 336 px. Minus 1px borders and 8px padding.
export const FACE_W = 240;
export const FACE_H = 336;
const CONTENT_W = FACE_W - 2 - 16;

// Each scroll variant crops its own source box at its own aspect ratio
// (see SCROLL_STYLES) — a banner rendered at width `w` needs its own
// height to match, or the SVG (preserveAspectRatio="none") stretches to
// whatever box it's given instead of scaling uniformly.
function scrollHeightFor(variant: Exclude<ScrollStyle, "none">, w: number) {
  const box = SCROLL_STYLES[variant].box;
  return Math.round((box.h / box.w) * w);
}
const SCROLL_W = 200; // player face banner width
const DM_SCROLL_W = CONTENT_W; // Name banner on the DM side — full row width
// Inset of the player-side border from the card edge — even on all sides.
const PLAYER_BORDER_MARGIN_WIDTH = 4;
const PLAYER_BORDER_MARGIN_HEIGHT = 6;

/** Fixed-width centering slot: lets two badges with different natural
 *  widths (e.g. Heart vs. Hexagon) share one alignment axis between rows,
 *  by centering each inside the same-width box rather than relying on
 *  their raw widths to match. */
function Slot({
  width,
  children,
}: {
  width: number;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ width, display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  );
}

type VitalField =
  | "maxHp"
  | "ac"
  | "spellSaveDC"
  | "passivePerception"
  | "speed"
  | "passiveInsight";

export function DmFace({ card }: { card: CardData }) {
  const { editable, update } = useCardEdit();
  // The AC shield keeps its official 48:55 aspect ratio; sizes leave room
  // for the full-aspect Name scroll above.
  const S = { shW: 52, shH: 60, gap: 2 };
  // All six stat badges share one height so both rows read as one
  // consistent size — back to the original (pre-unification) size.
  const iconH = S.shH;
  // Each shape keeps its own height (Shield/Chevron are nudged so all six
  // read as the same visual size), but every badge shares one *width* —
  // wide enough for the widest of the six at its own height, so a shape
  // whose viewBox is naturally narrower than that isn't stretched to fill
  // it (it just centers within the shared box, same as the value/label
  // overlay does), and nothing wider gets clipped or squeezed down.
  const shieldH = iconH * 1.1;
  const chevronH = iconH * 0.9;
  const vitalW = Math.ceil(
    Math.max(
      shieldH * (50 / 57.08), // Shield
      iconH * (57.6 / 55.08), // Heart / SaveBox
      iconH * (56.8 / 49.83), // Hexagon — currently the widest
      chevronH * (55 / 48), // Chevron
      iconH, // Orb — 1:1 viewBox
    ),
  );

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
    dmScrollVariant === "none" ? undefined : SCROLL_STYLES[dmScrollVariant].Component;
  // The dragon and party ribbons are noticeably taller than the plain one
  // at the same width — rather than let that squeeze the fixed-size
  // sections below (vitals, abilities, etc.), each of those gets
  // flexShrink: 0 so Notes (flex: 1) is the only thing that gives up
  // space, and the gap between sections tightens up to help it along.
  const dmScrollTall = dmScrollVariant !== "scroll" && dmScrollVariant !== "none";
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

  // Makes a vitals badge's number editable in place (inert unless the face
  // is inside CardEditProvider).
  const editVital = (
    field: VitalField,
    label: string,
    node: React.ReactNode,
  ) => (
    <EditableValue commit={(raw) => update?.setNum(field, raw)} label={label}>
      {node}
    </EditableValue>
  );

  const sections = [
    showNameOnDm && (
      <div
        key="name"
        className={editable ? "edit-section" : undefined}
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
        className={editable ? "edit-section" : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flexShrink: 0,
        }}
        onContextMenu={vitalsMenu.onContextMenu}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Slot width={vitalW}>
            {editVital(
              "maxHp",
              "Max HP",
              <Heart
                value={card.maxHp}
                label={showVitalsLabels ? "HP" : undefined}
                width={vitalW}
                height={iconH}
              />,
            )}
          </Slot>
          {editVital(
            "ac",
            "AC",
            <Shield
              value={card.ac}
              label={showVitalsLabels ? "AC" : undefined}
              width={vitalW}
              height={shieldH}
            />,
          )}
          <Slot width={vitalW}>
            {editVital(
              "spellSaveDC",
              "Spell save DC",
              <SaveBox
                value={card.spellSaveDC}
                label={showVitalsLabels ? "DC" : undefined}
                width={vitalW}
                height={iconH}
              />,
            )}
          </Slot>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Slot width={vitalW}>
            {editVital(
              "passivePerception",
              "Passive Perception",
              <Hexagon
                value={card.passivePerception}
                label={showVitalsLabels ? "PP" : undefined}
                width={vitalW}
                height={iconH}
              />,
            )}
          </Slot>
          {editVital(
            "speed",
            "Speed",
            <Chevron
              value={card.speed}
              label={showVitalsLabels ? "Speed" : undefined}
              width={vitalW}
              height={chevronH}
            />,
          )}
          <Slot width={vitalW}>
            {editVital(
              "passiveInsight",
              "Passive Insight",
              <Orb
                value={card.passiveInsight}
                label={showVitalsLabels ? "Insight" : undefined}
                width={vitalW}
                height={iconH * 1}
              />,
            )}
          </Slot>
        </div>
        {vitalsMenu.menu}
      </div>
    ),
    abilityMode !== "none" && (
      <div
        key="abilities"
        className={editable ? "edit-section" : undefined}
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
        className={editable ? "edit-section" : undefined}
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
      style={{ display: "flex", flexDirection: "column", padding: 8 }}
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
            className={editable ? "edit-section" : undefined}
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
}

export function PlayerFace({ card, rotated = true }: PlayerFaceProps) {
  const { editable, update } = useCardEdit();
  const classKey = Object.keys(CLASS_LOGO_MAP).find(
    (k) => k.toLowerCase() === card.characterClass.trim().toLowerCase(),
  );
  const Logo =
    card.artMode === "class" && classKey ? CLASS_LOGO_MAP[classKey] : undefined;
  const useCustomArt =
    (card.artMode === "upload" || card.artMode === "link") &&
    !!card.portraitUrl;
  const playerScrollVariant = card.toggles.nameScrollPlayer;
  const showNameOnPlayer = playerScrollVariant !== "none";
  const PlayerNameScroll =
    playerScrollVariant === "none" ? undefined : SCROLL_STYLES[playerScrollVariant].Component;

  // Right-click the player-side scroll to switch its style (mirrors the
  // sidebar's "Player Scroll" toggle).
  const nameMenu = useEditMenu(SCROLL_MENU, playerScrollVariant, (v) =>
    update?.setToggle("nameScrollPlayer", v),
  );
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

  const contentW = FACE_W - 2 - PLAYER_BORDER_MARGIN_WIDTH * 2;
  const contentH = FACE_H - 2 - PLAYER_BORDER_MARGIN_HEIGHT * 2;
  const scrollH =
    playerScrollVariant !== "none"
      ? scrollHeightFor(playerScrollVariant, SCROLL_W)
      : 0;
  const ART_BOTTOM_MARGIN = 8;

  return (
    <div
      className={rotated ? "card-face card-player-face" : "card-face"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
            className={editable ? "edit-section" : undefined}
            style={{ flexShrink: 0, marginTop: 4 }}
            onContextMenu={nameMenu.onContextMenu}
          >
            <EditableOverlay
              value={card.characterName}
              commit={(raw) => update?.set("characterName", raw)}
              label="Character name"
              inputStyle={{ fontSize: 15, top: nameInputTop(playerScrollVariant) }}
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
          className={editable ? "edit-section" : undefined}
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: ART_BOTTOM_MARGIN,
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
