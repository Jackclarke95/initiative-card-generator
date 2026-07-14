"use client";

import { Fragment } from "react";
import { CLASS_LOGO_MAP } from "@/components/ClassLogos";
import { PALE_GREY } from "@/components/FrameText";
import {
  PlayerFrame,
  SaveBox,
  Chevron,
  Shield,
  Heart,
  Hexagon,
  Orb,
  NameScroll,
  scrollBox,
  StatBox,
  DamageTypeBadge,
  NotesBox,
} from "@/components/CardFrames";
import { useCardEdit } from "@/components/CardEditContext";
import {
  EditableValue,
  EditableHit,
  ClassPicker,
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
const ART_MENU = ART_MODES.map((m) => ({
  value: m,
  label: ART_MODE_LABELS[m],
}));

// Height of the transparent hit strip laid over a StatBox's proficiency dot,
// matching VitalBox's reserved dot zone (dotR*2 + dotTopGap + dotBottomGap =
// 2.6*2 + 2 + 4 ≈ 11.2), rounded up.
const DOT_HIT_H = 12;

// ARIA tri-state for a resistance dot, mirroring CardEditor's checkbox.
function resistanceAriaChecked(state: ResistanceState): boolean | "mixed" {
  return state === "immune" ? true : state === "resistant" ? "mixed" : false;
}

// Card face: 2.5in × 3.5in = 240 × 336 px. Minus 1px borders and 8px padding.
export const FACE_W = 240;
export const FACE_H = 336;
const CONTENT_W = FACE_W - 2 - 16;

// Each scroll variant crops its own source box at its own aspect ratio
// (see CardFrames' scrollBox) — a banner rendered at width `w` needs its
// own height to match, or the SVG (preserveAspectRatio="none") stretches
// to whatever box it's given instead of scaling uniformly.
function scrollHeightFor(variant: Exclude<ScrollStyle, "none">, w: number) {
  const box = scrollBox(variant);
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
  const badgeW = Math.round(S.shW * 1.2);
  // The hearts (HP, Save) are drawn 1.2× wider than the shield.
  const heartW = Math.round(badgeW * 1.2);
  const saveW = heartW;
  // Chevron/Hexagon/Orb widths each follow that shape's own viewBox aspect
  // ratio at the shared height, so nothing gets stretched or letterboxed.
  const chevronW = Math.round(iconH * (55 / 48));
  const hexW = Math.round(iconH * (56.8 / 49.83));
  const orbW = iconH; // Orb's viewBox is a 1:1 square.
  // HP/Perception share a slot, and DC/Insight share a slot — each
  // shape centers inside its slot, so the two rows' differing natural
  // widths still align on the same vertical axis. Using one slot width
  // for both sides also keeps AC/Speed centered exactly between them.
  const slotW = Math.max(heartW, hexW, saveW, orbW);

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

  // Wraps a vitals badge in a transparent, click-to-edit number overlay
  // (inert unless the face is inside CardEditProvider).
  const editVital = (
    field: VitalField,
    label: string,
    node: React.ReactNode,
  ) => (
    <EditableValue
      value={card[field]}
      numeric
      commit={(raw) => update?.setNum(field, raw)}
      label={label}
      inputStyle={{ fontSize: 18 }}
    >
      {node}
    </EditableValue>
  );

  const sections = [
    showNameOnDm && (
      <div
        key="name"
        style={{ flexShrink: 0 }}
        onContextMenu={nameMenu.onContextMenu}
      >
        <EditableValue
          value={card.characterName}
          commit={(raw) => update?.set("characterName", raw)}
          label="Character name"
          inputStyle={{ fontSize: 15 }}
        >
          <NameScroll
            value={card.characterName}
            variant={dmScrollVariant}
            width={DM_SCROLL_W}
            height={scrollHeightFor(dmScrollVariant, DM_SCROLL_W)}
          />
        </EditableValue>
        {nameMenu.menu}
      </div>
    ),
    vitalsMode !== "none" && (
      <div
        key="vitals"
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
          <Slot width={slotW}>
            {editVital(
              "maxHp",
              "Max HP",
              <Heart
                value={card.maxHp}
                label={"HP"}
                width={heartW}
                height={iconH}
                showLabel={showVitalsLabels}
              />,
            )}
          </Slot>
          {editVital(
            "ac",
            "AC",
            <Shield
              value={card.ac}
              label={"AC"}
              width={badgeW}
              height={iconH * 1.1}
              showLabel={showVitalsLabels}
            />,
          )}
          <Slot width={slotW}>
            {editVital(
              "spellSaveDC",
              "Spell save DC",
              <SaveBox
                value={card.spellSaveDC}
                label="DC"
                width={saveW}
                height={iconH}
                showLabel={showVitalsLabels}
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
          <Slot width={slotW}>
            {editVital(
              "passivePerception",
              "Passive Perception",
              <Hexagon
                value={card.passivePerception}
                label="PP"
                width={hexW}
                height={iconH}
                showLabel={showVitalsLabels}
              />,
            )}
          </Slot>
          {editVital(
            "speed",
            "Speed",
            <Chevron
              value={card.speed}
              label="Speed"
              width={chevronW}
              height={iconH * 0.9}
              showLabel={showVitalsLabels}
            />,
          )}
          <Slot width={slotW}>
            {editVital(
              "passiveInsight",
              "Passive Insight",
              <Orb
                value={card.passiveInsight}
                label="Insight"
                width={orbW}
                height={iconH * 1}
                showLabel={showVitalsLabels}
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
            value={card.stats[key].modifier}
            commit={(raw) => update?.setStat(key, { modifier: raw })}
            label={`${ABILITY_LABELS[key]} modifier`}
            inputStyle={{ fontSize: 13, paddingBottom: DOT_HIT_H }}
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
            <StatBox
              label={ABILITY_LABELS[key]}
              value={card.stats[key].modifier}
              proficiency={card.stats[key].proficiency}
              showLabel={abilityMode === "full"}
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
            style={{
              flex: 1,
              minHeight: 0,
              marginTop: sections.length > 0 ? 4 : 0,
            }}
            onContextMenu={notesMenu.onContextMenu}
          >
            <EditableValue
              value={card.notes}
              commit={(raw) => update?.set("notes", raw)}
              label="DM notes"
              multiline
              align="left"
              inputStyle={{
                fontSize: 8,
                lineHeight: 1.35,
                padding: "8px 12px 18px",
              }}
              wrapperStyle={{ height: "100%" }}
            >
              <NotesBox
                value={card.notes}
                showLabel={notesMode !== "unlabeled"}
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
  const { update } = useCardEdit();
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

  // Right-click the player-side scroll to switch its style (mirrors the
  // sidebar's "Player Scroll" toggle).
  const nameMenu = useEditMenu(SCROLL_MENU, playerScrollVariant, (v) =>
    update?.setToggle("nameScrollPlayer", v),
  );
  // Right-click the art to switch art style (mirrors the sidebar's "Card
  // Art" toggle). Picking a specific class stays a left-click (ClassPicker).
  const artMenu = useEditMenu(ART_MENU, card.artMode, (v) =>
    update?.set("artMode", v),
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
        <PlayerFrame width={contentW} height={contentH} />
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
            style={{ flexShrink: 0, marginTop: 4 }}
            onContextMenu={nameMenu.onContextMenu}
          >
            <EditableValue
              value={card.characterName}
              commit={(raw) => update?.set("characterName", raw)}
              label="Character name"
              inputStyle={{ fontSize: 15 }}
            >
              <NameScroll
                variant={playerScrollVariant}
                width={SCROLL_W}
                height={scrollH}
                value={card.characterName}
              />
            </EditableValue>
            {nameMenu.menu}
          </div>
        )}
        <div
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
          {/* Left-click the class art to pick a class; right-click anywhere
              in the art area to switch art style (both inert unless editing).
              Class picker is class-mode only; uploaded/linked images stay a
              sidebar-only concern. */}
          {card.artMode === "class" && (
            <ClassPicker
              value={card.characterClass}
              options={CLASS_OPTIONS}
              onPick={(cls) => update?.set("characterClass", cls)}
            />
          )}
          {artMenu.menu}
        </div>
      </div>
    </div>
  );
}
