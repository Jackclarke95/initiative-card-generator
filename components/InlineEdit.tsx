"use client";

// Thin overlay primitives that turn the (otherwise read-only) card preview
// into a click-to-edit surface. They sit ON TOP of the real frame components
// without changing them: the frame keeps painting the genuine value, and the
// overlay just captures keystrokes/clicks and shows a caret.
//
// All three short-circuit to a static render when editing is off (no provider
// → useCardEdit().editable === false), so the export/folded/measurement
// consumers stay byte-identical to before.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCardEdit } from "@/components/CardEditContext";

// ── EditableValue ─────────────────────────────────────────────────────
// A transparent, controlled <input>/<textarea> laid over a value. Its text
// is invisible (color:transparent) so the frame's real, auto-fit text shows
// through; only the caret is visible. Every keystroke commits live, so the
// preview + sidebar update as you type.

interface EditableValueProps {
  /** Current committed value (drives the controlled input). */
  value: string | number | undefined;
  /** Raw string → wherever it belongs (setNum / setStat / set live here). */
  commit: (raw: string) => void;
  /** The frame that renders the real value beneath the overlay. */
  children: React.ReactNode;
  label: string;
  multiline?: boolean;
  numeric?: boolean;
  align?: "center" | "left";
  /** Extra style for the overlay control (font-size, paddingBottom, …). */
  inputStyle?: React.CSSProperties;
  /** Extra style for the position:relative wrapper. */
  wrapperStyle?: React.CSSProperties;
  /** Rendered inside the wrapper, above the input — e.g. a proficiency-dot
   *  hit target that shares this element's relative box. Only shown while
   *  editing. */
  overlay?: React.ReactNode;
}

export function EditableValue({
  value,
  commit,
  children,
  label,
  multiline = false,
  numeric = false,
  align = "center",
  inputStyle,
  wrapperStyle,
  overlay,
}: EditableValueProps) {
  const { editable } = useCardEdit();
  // Value at focus-time, so Esc can restore it (edits are applied live).
  const snapshot = useRef("");

  if (!editable) return <>{children}</>;

  const shown = value == null ? "" : String(value);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.nativeEvent.isComposing) return; // let IME finish
    if (e.key === "Escape") {
      e.preventDefault();
      commit(snapshot.current);
      e.currentTarget.blur();
    } else if (e.key === "Enter") {
      // Multiline: plain Enter inserts a newline; Cmd/Ctrl+Enter finishes.
      if (multiline && !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const shared = {
    className: "edit-hit",
    "aria-label": label,
    value: shown,
    onFocus: (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      snapshot.current = e.currentTarget.value;
      e.currentTarget.select();
    },
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => commit(e.currentTarget.value),
    onKeyDown: handleKeyDown,
    style: {
      position: "absolute" as const,
      inset: 0,
      width: "100%",
      height: "100%",
      boxSizing: "border-box" as const,
      margin: 0,
      border: "none",
      outline: "none",
      color: "transparent",
      caretColor: "var(--accent)",
      fontFamily: "inherit",
      fontWeight: "bold" as const,
      textAlign: align,
      cursor: "text",
      ...inputStyle,
    },
  };

  return (
    <div style={{ position: "relative", ...wrapperStyle }}>
      {children}
      {multiline ? (
        <textarea {...shared} style={{ ...shared.style, resize: "none" }} />
      ) : (
        <input
          {...shared}
          inputMode={numeric ? "numeric" : undefined}
          spellCheck={false}
        />
      )}
      {overlay}
    </div>
  );
}

// ── EditableHit ───────────────────────────────────────────────────────
// A transparent click target for the dots (toggle proficiency / cycle a
// resistance). Absolutely positioned by the caller over the dot or badge.

interface EditableHitProps {
  onActivate: () => void;
  label: string;
  style?: React.CSSProperties;
  /** Optional ARIA state, mirroring CardEditor's resistance semantics. */
  role?: string;
  ariaChecked?: boolean | "mixed";
}

export function EditableHit({
  onActivate,
  label,
  style,
  role,
  ariaChecked,
}: EditableHitProps) {
  const { editable } = useCardEdit();
  if (!editable) return null;
  return (
    <button
      type="button"
      className="edit-hit"
      aria-label={label}
      role={role}
      aria-checked={ariaChecked}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      style={{ position: "absolute", cursor: "pointer", ...style }}
    />
  );
}

// ── ClassPicker ───────────────────────────────────────────────────────
// Overlays the class art with a hit target that opens a small inline popover
// of class names. Inline (never portaled) so it stays inside the preview's
// scale transform; sized to fit within the card so overflow:hidden doesn't
// clip it.

interface ClassPickerProps {
  value: string;
  options: string[];
  onPick: (cls: string) => void;
}

export function ClassPicker({ value, options, onPick }: ClassPickerProps) {
  const { editable } = useCardEdit();
  const [open, setOpen] = useState(false);
  if (!editable) return null;

  return (
    <>
      <EditableHit
        label="Change class"
        onActivate={() => setOpen((o) => !o)}
        style={{ inset: 0 }}
      />
      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-label="Close class picker"
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              border: "none",
              cursor: "default",
            }}
          />
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 128,
              maxHeight: 168,
              overflowY: "auto",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              fontFamily: "var(--font-ui)",
              padding: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 10,
            }}
          >
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="edit-menu-item"
                  onClick={() => {
                    onPick(opt);
                    setOpen(false);
                  }}
                  style={{
                    textAlign: "left",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "none",
                    cursor: "pointer",
                    background: selected ? "var(--accent)" : "transparent",
                    color: selected ? "#fff" : "var(--text-primary)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ── Right-click display-mode menu ─────────────────────────────────────
// A section's segmented-toggle options, surfaced as a context menu. Left
// click still edits values / cycles dots (see above); right click on a
// section opens this to change how that section is displayed. Portaled to
// the body at the cursor so it escapes the card's overflow:hidden and the
// preview's scale transform (a UI menu wants to render at 1×, not 2×).

export interface EditMenuOption<T extends string> {
  value: T;
  label: string;
}

/** Wire a section for a right-click display-mode menu. Call unconditionally
 *  (it's a hook); spread the returned `onContextMenu` on the section element
 *  and render `menu` anywhere inside it (it portals out). Inert when not
 *  editable. */
export function useEditMenu<T extends string>(
  options: readonly EditMenuOption<T>[],
  value: T,
  onSelect: (value: T) => void,
): { onContextMenu?: React.MouseEventHandler; menu: React.ReactNode } {
  const { editable } = useCardEdit();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  if (!editable) return { onContextMenu: undefined, menu: null };

  const onContextMenu: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPos({ x: e.clientX, y: e.clientY });
  };

  const menu =
    pos != null ? (
      <EditContextMenu
        pos={pos}
        options={options}
        value={value}
        onSelect={(v) => {
          onSelect(v);
          setPos(null);
        }}
        onClose={() => setPos(null)}
      />
    ) : null;

  return { onContextMenu, menu };
}

function EditContextMenu<T extends string>({
  pos,
  options,
  value,
  onSelect,
  onClose,
}: {
  pos: { x: number; y: number };
  options: readonly EditMenuOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState(pos);

  // Nudge the menu back inside the viewport once its size is known.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let left = pos.x;
    let top = pos.y;
    if (left + r.width > window.innerWidth - 6) left = window.innerWidth - r.width - 6;
    if (top + r.height > window.innerHeight - 6) top = window.innerHeight - r.height - 6;
    setPlace({ x: Math.max(6, left), y: Math.max(6, top) });
  }, [pos.x, pos.y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      // Full-screen backdrop: click or right-click anywhere dismisses.
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 1000 }}
    >
      <div
        ref={ref}
        role="menu"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          left: place.x,
          top: place.y,
          minWidth: 132,
          background: "var(--surface-raised)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          fontFamily: "var(--font-ui)",
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 1001,
        }}
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              className="edit-menu-item"
              onClick={() => onSelect(opt.value)}
              style={{
                textAlign: "left",
                fontSize: 12,
                padding: "5px 10px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                background: selected ? "var(--accent)" : "transparent",
                color: selected ? "#fff" : "var(--text-primary)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
