"use client";

// Lets a frame's real value text become directly editable in place, without
// an overlay input. A parent (EditableValue in InlineEdit.tsx) provides a
// FieldBinding via context; the text-rendering frame (Frame, NotesFrame)
// calls useEditableText and spreads the returned props onto its value
// element, turning that exact element into a contentEditable field. No
// binding (i.e. not inside the editable preview) → renders as plain text, so
// exports/measurement/folded previews are unchanged.

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

export interface FieldBinding {
  /** Latest text → wherever it belongs (setNum / setStat / set live here). */
  commit: (text: string) => void;
  label?: string;
  /** Enter inserts a newline; Cmd/Ctrl+Enter (or blur) finishes. */
  multiline?: boolean;
}

const FieldEditContext = createContext<FieldBinding | null>(null);

export function FieldEditProvider({
  binding,
  children,
}: {
  binding: FieldBinding;
  children: React.ReactNode;
}) {
  return (
    <FieldEditContext.Provider value={binding}>
      {children}
    </FieldEditContext.Provider>
  );
}

interface EditableTextHandle {
  /** Spread onto the value element (includes a callback ref). */
  bind: React.HTMLAttributes<HTMLElement> & {
    ref: (el: HTMLElement | null) => void;
    contentEditable: "plaintext-only";
    tabIndex: number;
  };
  /** Focus the value element and drop the caret at the end — used when a
   *  click lands beside the glyphs (e.g. an empty field). */
  focusEnd: () => void;
}

/** When a FieldEditProvider is above this frame, returns props to spread onto
 *  the value element so it edits in place; otherwise null.
 *
 *  The element's text is owned by the DOM (never passed as React children):
 *  we write `value` into it only when it differs from what's shown, so
 *  committing on every keystroke never yanks the caret. */
export function useEditableText(value: string): EditableTextHandle | null {
  const binding = useContext(FieldEditContext);
  const nodeRef = useRef<HTMLElement | null>(null);
  const snapshot = useRef("");

  useLayoutEffect(() => {
    if (!binding) return;
    const el = nodeRef.current;
    if (el && el.textContent !== value) el.textContent = value;
  });

  if (!binding) return null;

  return {
    bind: {
      ref: (el) => {
        nodeRef.current = el;
      },
      contentEditable: "plaintext-only",
      suppressContentEditableWarning: true,
      role: "textbox",
      "aria-label": binding.label,
      "aria-multiline": binding.multiline || undefined,
      tabIndex: 0,
      spellCheck: false,
      // No highlight class here — the whole-frame wrapper (.edit-frame in
      // EditableValue) carries the hover/focus highlight instead.
      onFocus: (e) => {
        snapshot.current = e.currentTarget.textContent ?? "";
      },
      onInput: (e) => binding.commit(e.currentTarget.textContent ?? ""),
      onKeyDown: (e) => {
        if (e.nativeEvent.isComposing) return; // let IME finish
        if (e.key === "Escape") {
          e.preventDefault();
          binding.commit(snapshot.current);
          e.currentTarget.blur();
        } else if (e.key === "Enter") {
          // Multiline: plain Enter inserts a newline; Cmd/Ctrl+Enter finishes.
          if (binding.multiline && !(e.metaKey || e.ctrlKey)) return;
          e.preventDefault();
          e.currentTarget.blur();
        }
      },
    },
    focusEnd: () => {
      const el = nodeRef.current;
      if (!el) return;
      // preventScroll: focus() otherwise asks every scrollable ancestor —
      // including overflow:hidden ones, which are still programmatically
      // scrollable — to bring the element into view. Those invisible
      // scroll nudges were shifting frame values on focus (scrollTop shows
      // in no markup or computed style); the frames never need the assist.
      el.focus({ preventScroll: true });
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    },
  };
}
