"use client";

export type MobileTab = "edit" | "player" | "dm" | "export";

const TABS: { key: MobileTab; label: string }[] = [
  { key: "edit", label: "Character" },
  { key: "player", label: "Player Face" },
  { key: "dm", label: "DM Face" },
  { key: "export", label: "Print & Export" },
];

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}

// Small-screen navigation between the four panes desktop shows all at
// once (left form, right form, and the two live-preview faces) — see
// InitiativeCardApp's mobile layout branch.
export default function MobileTabBar({ active, onChange }: MobileTabBarProps) {
  return (
    <div
      className="flex shrink-0 border-b overflow-x-auto"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 min-w-[5.5rem] px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors"
            style={{
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
