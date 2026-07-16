// Generic Notes — a left-aligned block of free text (the DM's notes
// section), framed with the shared 5e border and a caption centered along
// the bottom edge — Notes never puts it on top. Its value is a scrollable,
// possibly-multiline block rather than a single auto-fit line, so it
// doesn't reuse Frame's centered value layout, only its `Label` piece (see
// Frame.tsx). Has no intrinsic height of its own; wrap it in a `flex: 1`
// container to have it eat whatever space is left at the bottom of the card.

import { useLayoutEffect, useRef, useState } from "react";
import { useEditableText } from "@/components/fieldEdit";
import { INK, Label } from "@/components/frames/Frame";
import { Border5e } from "@/components/frames/shared/Border5e";

export function NotesFrame({
  value,
  label,
}: {
  value?: string;
  /** Omit to hide the label — there is no separate visibility flag. The
   *  caption text (e.g. "Notes") is the caller's to supply, same as every
   *  other frame category, not a default baked in here. */
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // When inside the editable preview, the notes text is edited directly (the
  // caret sits in the real wrapped text); null everywhere else.
  const edit = useEditableText(value ?? "");

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const textStyle: React.CSSProperties = {
    fontSize: 8,
    lineHeight: 1.35,
    color: INK,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textAlign: "left",
  };

  return (
    <div ref={containerRef} style={{ position: "relative", height: "100%" }}>
      {size.width > 0 && size.height > 0 && (
        <Border5e width={size.width} height={size.height} />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "8px 12px 6px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden" }}>
          {edit ? (
            <div
              {...edit.bind}
              style={{
                ...textStyle,
                height: "100%",
                outline: "none",
                cursor: "text",
                overflow: "auto",
              }}
            />
          ) : (
            value && <div style={textStyle}>{value}</div>
          )}
        </div>
        {label && (
          <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <Label text={label} position="bottom" />
          </div>
        )}
      </div>
    </div>
  );
}
