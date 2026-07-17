"use client";

// FLIP (First, Last, Invert, Play) reorder animation: when an item marked
// with `data-flip-id` moves to a new position — e.g. a drag-and-drop reorder
// committing a new array order — it slides from its old spot to its new one
// instead of just snapping there, in both the card preview's vitals grid and
// the sidebar form's list. Framework-agnostic (plain DOM offsets + an
// imperative transform), so it works the same whether the reorder came from
// a CSS grid or a flex column.

import { useEffect, useLayoutEffect, useRef } from "react";

/** Attach the returned ref to the list's container; give each direct
 *  reorderable child a stable `data-flip-id` (its item's own id). Call
 *  unconditionally on every render — it only actually animates the renders
 *  where a tracked child's position changed since the last one. */
export function useFlipAnimation<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const prevOffsets = useRef<Map<string, { left: number; top: number }>>(new Map());
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

      if (!armed.current) return;
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
  });

  return containerRef;
}
