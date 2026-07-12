"use client";

import { useEffect, useRef, useState } from "react";

interface NamePartyModalProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function NamePartyModal({
  onConfirm,
  onCancel,
}: NamePartyModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function commit() {
    onConfirm(name.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border p-4 shadow-xl"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-sm font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Name this party
        </h2>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Untitled Party"
          className="w-full bg-[var(--surface-raised)] border rounded px-2 py-1.5 text-xs mb-4"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs font-semibold"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            Skip
          </button>
          <button
            onClick={commit}
            className="px-3 py-1.5 rounded text-xs font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
