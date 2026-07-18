"use client";

// FLIP (First, Last, Invert, Play) reorder animation: when an item marked
// with `data-flip-id` moves to a new position — e.g. a drag-and-drop reorder
// committing a new array order — it slides from its old spot to its new one
// instead of just snapping there, in both the card preview's vitals grid and
// the sidebar form's list. Framework-agnostic (plain DOM offsets + an
// imperative transform), so it works the same whether the reorder came from
// a CSS grid or a flex column.
//
// A second, independent marker — `data-flip-height-id` — smooths a
// container's own size change instead of its position (e.g. a vitals row's
// bordered box growing or shrinking as boxes are added, removed, or moved
// in or out of it). CSS can't transition to/from `height: auto` directly,
// so this measures the old and new pixel heights itself and animates
// between those two concrete values, releasing back to auto afterward so
// later content changes still size naturally.

import { useEffect, useLayoutEffect, useRef } from "react";

/** Attach the returned ref to the list's container; give each direct
 *  reorderable child a stable `data-flip-id` (its item's own id), and/or
 *  give any descendant whose own size should smooth out a stable
 *  `data-flip-height-id`. Call unconditionally on every render — it only
 *  actually animates the renders where a tracked element's position or
 *  height changed since the last one. */
export function useFlipAnimation<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const prevOffsets = useRef<Map<string, { left: number; top: number }>>(new Map());
  // The DOM order of tracked ids as of the last render — used to tell an
  // actual reorder (this sequence changes) apart from an incidental shift
  // (an unrelated sibling section resizing or toggling, which moves every
  // box's offset without changing their relative order at all). Only the
  // former should slide; the latter should just snap to its new spot.
  const prevOrder = useRef<string[]>([]);
  // Which direct container element each id rendered under last time — a
  // box moving into a different row's own wrapper (e.g. the vitals
  // up/down buttons joining it to the row above/below) doesn't always
  // change the flat id sequence at all: if it's already sitting right at
  // that row's boundary, it can rejoin as the row's new last/first member
  // with no other box's relative order changing either, so the sequence
  // check alone would misread it as an incidental shift. A parent change
  // is never incidental — a resize or toggle elsewhere never reparents
  // anything — so it's an unconditional second signal for "this reordered."
  const prevParents = useRef<Map<string, Element | null>>(new Map());
  // Last measured height of each `data-flip-height-id` element — unlike
  // position, a height change is never incidental (nothing but a real
  // content change resizes a specific element), so this animates
  // unconditionally on any difference, with no sequence/parent gating.
  const prevHeights = useRef<Map<string, number>>(new Map());
  // The persisted-state load (InitiativeCardApp) can swap a placeholder
  // default card for a saved one right after the initial mount, replacing
  // every id in the list at once — a real reorder never does that (ids stay
  // put, only order changes), but without this guard the swap still reads
  // as "everything moved" and plays the same slide. Arming a frame after
  // mount, rather than reacting to the very first layout, gives that swap a
  // chance to land first so it's captured as the new baseline instead.
  const armed = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      armed.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nodes = container.querySelectorAll<HTMLElement>("[data-flip-id]");
    const nextOffsets = new Map<string, { left: number; top: number }>();
    const nextParents = new Map<string, Element | null>();
    const nextOrder: string[] = [];
    let parentChanged = false;
    nodes.forEach((node) => {
      const id = node.dataset.flipId;
      if (!id) return;
      nextOrder.push(id);
      nextParents.set(id, node.parentElement);
      if (
        prevParents.current.has(id) &&
        prevParents.current.get(id) !== node.parentElement
      ) {
        parentChanged = true;
      }
    });
    // Same ids, same sequence, same parents → nothing was actually
    // reordered, whatever moved was pushed around by something else
    // entirely.
    const reordered =
      parentChanged ||
      nextOrder.length !== prevOrder.current.length ||
      nextOrder.some((id, i) => id !== prevOrder.current[i]);

    nodes.forEach((node) => {
      const id = node.dataset.flipId;
      if (!id) return;

      // offsetLeft/offsetTop, not getBoundingClientRect: the live preview
      // renders at a CSS `transform: scale(...)` to fit its pane, and
      // getBoundingClientRect reports post-scale screen pixels. A delta
      // measured in THOSE pixels, then fed back in as this element's own
      // `transform: translate(...)`, gets scaled a SECOND time by that same
      // ancestor — a box moving one grid row was landing ~25% further than
      // it should, i.e. this was the "jumps too high, then slides down"
      // bug. offsetLeft/Top are pure layout metrics, unaffected by any
      // ancestor's (or this element's own) CSS transform, so the delta they
      // give is already in this element's own, unscaled coordinate space.
      const left = node.offsetLeft;
      const top = node.offsetTop;
      nextOffsets.set(id, { left, top });

      if (!armed.current || !reordered) return;
      const prev = prevOffsets.current.get(id);
      if (!prev) return;
      const dx = prev.left - left;
      const dy = prev.top - top;
      if (!dx && !dy) return;

      // Jump it back to where it visually was (no transition), then let the
      // browser paint that before animating the transform away to 0 — the
      // "invert" and "play" steps of FLIP.
      node.style.transition = "none";
      node.style.transform = `translate(${dx}px, ${dy}px)`;
      node.getBoundingClientRect(); // force the reflow the above needs to stick
      requestAnimationFrame(() => {
        node.style.transition = "transform 600ms ease";
        node.style.transform = "";
      });
    });

    prevOffsets.current = nextOffsets;
    prevOrder.current = nextOrder;
    prevParents.current = nextParents;

    const heightNodes =
      container.querySelectorAll<HTMLElement>("[data-flip-height-id]");
    const nextHeights = new Map<string, number>();
    heightNodes.forEach((node) => {
      const id = node.dataset.flipHeightId;
      if (!id) return;
      const height = node.offsetHeight;
      nextHeights.set(id, height);

      if (!armed.current) return;
      const prevHeight = prevHeights.current.get(id);
      if (prevHeight === undefined || prevHeight === height) return;

      // CSS can't transition to/from `auto`, so pin it to the old pixel
      // height (no transition, hidden overflow so the new content isn't
      // visible squeezed into the wrong size for a frame), force the
      // reflow that needs to stick, then transition to the new height and
      // release back to auto once it arrives — so a later change (adding
      // another box, text wrapping, …) still sizes naturally instead of
      // being stuck at this one fixed value.
      node.style.overflow = "hidden";
      node.style.transition = "none";
      node.style.height = `${prevHeight}px`;
      node.getBoundingClientRect();
      requestAnimationFrame(() => {
        node.style.transition = "height 300ms ease";
        node.style.height = `${height}px`;
      });
      const releaseToAuto = (e: TransitionEvent) => {
        if (e.propertyName !== "height") return;
        node.style.height = "";
        node.style.overflow = "";
        node.style.transition = "";
        node.removeEventListener("transitionend", releaseToAuto);
      };
      node.addEventListener("transitionend", releaseToAuto);
    });
    prevHeights.current = nextHeights;
  });

  return containerRef;
}
