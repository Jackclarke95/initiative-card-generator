"use client";

// Lets a frame's real value text — and, separately, its label caption —
// become directly editable in place, without an overlay input. A parent
// (EditableValue in InlineEdit.tsx) provides up to two FieldBindings via
// context, one per slot; the text-rendering frame (Frame, NotesFrame) calls
// useEditableText / useEditableLabelText and spreads the returned props onto
// the corresponding element, turning that exact element into a
// contentEditable field. No binding for a slot (i.e. not inside the editable
// preview, or the caller didn't wire up that slot) → renders as plain text,
// so exports/measurement/folded previews are unchanged.

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

/** Up to two independently editable slots per frame — the value (almost
 *  every frame) and, separately, its caption (vital boxes only, so far). */
export interface FieldBindings {
  value?: FieldBinding;
  label?: FieldBinding;
}

const FieldEditContext = createContext<FieldBindings | null>(null);

export function FieldEditProvider({
  bindings,
  children,
}: {
  bindings: FieldBindings;
  children: React.ReactNode;
}) {
  return (
    <FieldEditContext.Provider value={bindings}>
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
    "data-field-slot": "value" | "label";
  };
  /** Focus the value element and drop the caret at the end — used when a
   *  click lands beside the glyphs (e.g. an empty field). */
  focusEnd: () => void;
}

/** Shared by useEditableText / useEditableLabelText — see either for the
 *  contract. Takes the resolved binding for its own slot (value or label). */
function useEditableSlot(
  binding: FieldBinding | undefined,
  value: string,
  slot: "value" | "label",
): EditableTextHandle | null {
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
      // Lets a scroll-to-adjust handler on the whole-frame wrapper (see
      // EditableValue's `wheelStep`) find the value element specifically —
      // a vital box's caption is contentEditable too, so `[contenteditable]`
      // alone wouldn't reliably pick the right one out of the two.
      "data-field-slot": slot,
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

/** When a FieldEditProvider above this frame wired up a `value` binding,
 *  returns props to spread onto the value element so it edits in place;
 *  otherwise null.
 *
 *  The element's text is owned by the DOM (never passed as React children):
 *  we write `value` into it only when it differs from what's shown, so
 *  committing on every keystroke never yanks the caret. */
export function useEditableText(value: string): EditableTextHandle | null {
  const bindings = useContext(FieldEditContext);
  return useEditableSlot(bindings?.value, value, "value");
}

/** Same contract as useEditableText, for a frame's label caption instead of
 *  its value — a separate slot, so a caller can wire up one, both, or
 *  neither independently. */
export function useEditableLabelText(value: string): EditableTextHandle | null {
  const bindings = useContext(FieldEditContext);
  return useEditableSlot(bindings?.label, value, "label");
}
