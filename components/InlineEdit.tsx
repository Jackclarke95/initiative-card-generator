"use client";

// Primitives that turn the (otherwise read-only) card preview into a
// click-to-edit surface:
//   • EditableValue  — the value text edits IN PLACE (the frame renders its
//                      real value as a contentEditable element; see fieldEdit).
//   • EditableOverlay — a transparent caret input for values that can't be
//                      contentEditable (the curved-SVG character name).
//   • EditableHit    — a transparent click target for the dots.
//   • ClassPicker / useEditMenu — the art picker and right-click menus.
//
// All short-circuit to a static render when editing is off (no provider →
// useCardEdit().editable === false), so the export/folded/measurement
// consumers stay byte-identical to before.

import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useCardEdit } from "@/components/CardEditContext";
import { FieldEditProvider } from "@/components/fieldEdit";
import { INK } from "@/components/frames/Frame";

// ── EditableValue ─────────────────────────────────────────────────────
// Marks a frame's value as editable in place: it provides a FieldBinding via
// context, and the text-rendering frame (Frame / NotesFrame) picks that up
// to turn its own real value element into a contentEditable field. There's no
// overlay input — you type directly into the displayed glyphs. Inert (renders
// just the frame) when not in the editable preview.

interface EditableValueProps {
  /** Latest text → the right updater (setNum / setStat / set live here). */
  commit: (raw: string) => void;
  label: string;
  multiline?: boolean;
  /** The frame that renders — and, while editing, hosts the caret in — the value. */
  children: React.ReactNode;
  /** Rendered alongside the frame in a relative wrapper — e.g. a
   *  proficiency-dot hit target. */
  overlay?: React.ReactNode;
  /** Extra style for the wrapper (e.g. height:100% so notes fills its box). */
  wrapperStyle?: React.CSSProperties;
}

export function EditableValue({
  commit,
  label,
  multiline = false,
  children,
  overlay,
  wrapperStyle,
}: EditableValueProps) {
  const { editable } = useCardEdit();
  if (!editable) return <>{children}</>;

  // The wrapper carries the whole-frame hover/focus highlight (.edit-frame)
  // and hosts any overlay (the proficiency dot). It shrink-wraps the frame,
  // so layout is unchanged.
  return (
    <div className="edit-frame" style={{ position: "relative", ...wrapperStyle }}>
      <FieldEditProvider binding={{ commit, label, multiline }}>
        {children}
      </FieldEditProvider>
      {overlay}
    </div>
  );
}

// ── EditableOverlay ───────────────────────────────────────────────────
// A transparent <input> laid over a value whose text can't be made directly
// editable — currently just the character name, which rides a curved SVG
// path. The input's text is invisible (color:transparent); the frame's real
// (curved) text shows through and updates live, and only the caret shows.

interface EditableOverlayProps {
  value: string | number | undefined;
  commit: (raw: string) => void;
  children: React.ReactNode;
  label: string;
  align?: "center" | "left";
  numeric?: boolean;
  inputStyle?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}

export function EditableOverlay({
  value,
  commit,
  children,
  label,
  align = "center",
  numeric = false,
  inputStyle,
  wrapperStyle,
}: EditableOverlayProps) {
  const { editable } = useCardEdit();
  // Value at focus-time, so Esc can restore it (edits are applied live).
  const snapshot = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  if (!editable) return <>{children}</>;

  const shown = value == null ? "" : String(value);

  // While focused, hide the curved SVG text and show a straight, real,
  // selectable editable line in its place (same editing feel as the other
  // fields). The curve returns on blur. This is why the input's own text is
  // visible only while focused — otherwise it would ghost over the curve.
  const framed = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{ hideValue?: boolean }>,
        { hideValue: focused },
      )
    : children;

  return (
    <div
      className="edit-frame"
      style={{ position: "relative", ...wrapperStyle }}
      // Clicking the banner outside the text line still starts editing —
      // focus the input and drop the caret at the end. The text line itself
      // (the input) handles its own clicks natively.
      onMouseDown={(e) => {
        const el = inputRef.current;
        if (e.button === 0 && el && e.target !== el) {
          e.preventDefault();
          el.focus();
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }}
    >
      {framed}
      <input
        ref={inputRef}
        aria-label={label}
        value={shown}
        inputMode={numeric ? "numeric" : undefined}
        spellCheck={false}
        onFocus={(e) => {
          snapshot.current = e.currentTarget.value;
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => commit(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return; // let IME finish
          if (e.key === "Escape") {
            e.preventDefault();
            commit(snapshot.current);
            e.currentTarget.blur();
          } else if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        style={{
          // A full-width, one-line-tall band at the text's vertical position
          // (not the whole box) so the text cursor only shows over the text
          // line; the banner around it keeps the frame's pointer cursor.
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          margin: 0,
          padding: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          color: focused ? INK : "transparent",
          caretColor: "var(--accent)",
          fontFamily: "inherit",
          fontWeight: "bold",
          textAlign: align,
          cursor: "text",
          ...inputStyle,
        }}
      />
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

// ── Right-click display-mode menu ─────────────────────────────────────
// A section's segmented-toggle options, surfaced as a context menu. Left
// click still edits values / cycles dots (see above); right click on a
// section opens this to change how that section is displayed. Portaled to
// the body at the cursor so it escapes the card's overflow:hidden and the
// preview's scale transform (a UI menu wants to render at 1×, not 2×).

export interface EditSubOption {
  label: string;
  selected?: boolean;
  onSelect: () => void;
}

export interface EditMenuOption<T extends string> {
  value: T;
  label: string;
  /** When present, hovering this row opens a second-level menu of these
   *  choices (e.g. the specific class under "Class Art"). Clicking the row
   *  itself still fires the top-level onSelect. */
  submenu?: EditSubOption[];
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
  const [openSub, setOpenSub] = useState<number | null>(null);

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
    // Close when the page scrolls out from under the (fixed) menu — but not
    // when the scroll happens inside the menu itself (e.g. a long class
    // submenu).
    const onScroll = (e: Event) => {
      const el = ref.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    };
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
        {options.map((opt, i) => {
          const selected = opt.value === value;
          const hasSub = !!opt.submenu?.length;
          return (
            <div
              key={opt.value}
              style={{ position: "relative" }}
              onMouseEnter={() => setOpenSub(hasSub ? i : null)}
            >
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                aria-haspopup={hasSub || undefined}
                aria-expanded={hasSub ? openSub === i : undefined}
                className="edit-menu-item"
                onClick={() => onSelect(opt.value)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
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
                <span>{opt.label}</span>
                {hasSub && <span aria-hidden>▸</span>}
              </button>
              {hasSub && openSub === i && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    left: "100%",
                    top: -5,
                    maxHeight: 220,
                    overflowY: "auto",
                    minWidth: 132,
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    zIndex: 1002,
                  }}
                >
                  {opt.submenu!.map((sub) => (
                    <button
                      key={sub.label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={!!sub.selected}
                      className="edit-menu-item"
                      onClick={() => {
                        sub.onSelect();
                        onClose();
                      }}
                      style={{
                        textAlign: "left",
                        fontSize: 12,
                        padding: "5px 10px",
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        background: sub.selected
                          ? "var(--accent)"
                          : "transparent",
                        color: sub.selected ? "#fff" : "var(--text-primary)",
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
