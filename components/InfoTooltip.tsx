"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  text: string;
}

const WIDTH = 192; // px, matches w-48
const EST_HEIGHT = 60; // rough estimate, used only to decide flip direction
const MARGIN = 8;

// Positioned via getBoundingClientRect + a fixed-position portal (rather
// than CSS absolute) so it stays anchored to the icon and clamped inside
// the viewport even though ancestor panes use overflow-hidden.
export default function InfoTooltip({ text }: InfoTooltipProps) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    above: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - WIDTH / 2;
    left = Math.min(
      Math.max(left, MARGIN),
      window.innerWidth - WIDTH - MARGIN,
    );

    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < EST_HEIGHT + MARGIN && rect.top > spaceBelow;
    const top = above ? rect.top - MARGIN : rect.bottom + MARGIN;

    setPos({ top, left, above });
  }, [open]);

  return (
    <>
      <span
        ref={iconRef}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] cursor-help shrink-0"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--text-muted)",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        ?
      </span>
      {open &&
        pos &&
        createPortal(
          <span
            role="tooltip"
            className="fixed pointer-events-none rounded px-2.5 py-1.5 text-xs normal-case leading-snug z-50"
            style={{
              top: pos.top,
              left: pos.left,
              width: WIDTH,
              transform: pos.above ? "translateY(-100%)" : undefined,
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}
