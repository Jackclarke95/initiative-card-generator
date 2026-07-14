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
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  DAMAGE_TYPE_KEYS,
  DAMAGE_TYPE_LABELS,
  type CardData,
  type ScrollStyle,
} from "@/types/card";

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

export function DmFace({ card }: { card: CardData }) {
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

  const sections = [
    showNameOnDm && (
      <div key="name" style={{ flexShrink: 0 }}>
        <NameScroll
          value={card.characterName}
          variant={dmScrollVariant}
          width={DM_SCROLL_W}
          height={scrollHeightFor(dmScrollVariant, DM_SCROLL_W)}
        />
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
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Slot width={slotW}>
            <Heart
              value={card.maxHp}
              label={"HP"}
              width={heartW}
              height={iconH}
              showLabel={showVitalsLabels}
            />
          </Slot>
          <Shield
            value={card.ac}
            label={"AC"}
            width={badgeW}
            height={iconH * 1.1}
            showLabel={showVitalsLabels}
          />
          <Slot width={slotW}>
            <SaveBox
              value={card.spellSaveDC}
              label="DC"
              width={saveW}
              height={iconH}
              showLabel={showVitalsLabels}
            />
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
            <Hexagon
              value={card.passivePerception}
              label="PP"
              width={hexW}
              height={iconH}
              showLabel={showVitalsLabels}
            />
          </Slot>
          <Chevron
            value={card.speed}
            label="Speed"
            width={chevronW}
            height={iconH * 0.9}
            showLabel={showVitalsLabels}
          />
          <Slot width={slotW}>
            <Orb
              value={card.passiveInsight}
              label="Insight"
              width={orbW}
              height={iconH * 1}
              showLabel={showVitalsLabels}
            />
          </Slot>
        </div>
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
      >
        {ABILITY_KEYS.map((key) => (
          <StatBox
            key={key}
            label={ABILITY_LABELS[key]}
            value={card.stats[key].modifier}
            proficiency={card.stats[key].proficiency}
            showLabel={abilityMode === "full"}
          />
        ))}
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
      >
        {DAMAGE_TYPE_KEYS.map((key, i) => (
          <Fragment key={key}>
            {i > 0 && (
              <div
                style={{
                  alignSelf: "stretch",
                  borderLeft: `1px dashed ${PALE_GREY}`,
                }}
              />
            )}
            <DamageTypeBadge
              label={DAMAGE_TYPE_LABELS[key]}
              damageType={key}
              state={card.resistances[key]}
              displayMode={card.damageDisplayMode}
            />
          </Fragment>
        ))}
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
          >
            <NotesBox
              value={card.notes}
              showLabel={notesMode !== "unlabeled"}
            />
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
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <NameScroll
              variant={playerScrollVariant}
              width={SCROLL_W}
              height={scrollH}
              value={card.characterName}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: ART_BOTTOM_MARGIN,
            color: "#111",
          }}
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
        </div>
      </div>
    </div>
  );
}
