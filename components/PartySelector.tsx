"use client";

import { useEffect, useRef, useState } from "react";
import type { Party } from "@/types/party";

interface PartySelectorProps {
  parties: Party[];
  activePartyId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onRequestDelete: (id: string) => void;
}

export default function PartySelector({
  parties,
  activePartyId,
  onSelect,
  onAdd,
  onRename,
  onRequestDelete,
}: PartySelectorProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeParty = parties.find((p) => p.id === activePartyId) ?? parties[0];

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function startRenaming() {
    setDraftName(activeParty.name);
    setRenaming(true);
  }

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed) onRename(activeParty.id, trimmed);
    setRenaming(false);
  }

  return (
    <div
      className="px-4 py-3 border-b shrink-0"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          Party
        </h2>
        <button
          onClick={onAdd}
          className="px-2 py-1 rounded text-xs font-semibold"
          style={{
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
          }}
        >
          + New
        </button>
      </div>

      {renaming ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="w-full bg-[var(--surface-raised)] border rounded px-2 py-1.5 text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        />
      ) : (
        <div className="flex items-center gap-1.5">
          <select
            value={activePartyId}
            onChange={(e) => onSelect(e.target.value)}
            className="flex-1 min-w-0 bg-[var(--surface-raised)] border rounded px-1.5 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
          <button
            onClick={startRenaming}
            title="Rename party"
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            ✎
          </button>
          <button
            onClick={() => onRequestDelete(activeParty.id)}
            title="Delete party"
            disabled={parties.length <= 1}
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
