"use client";

import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { applyTheme, getCurrentTheme, type Theme } from "@/lib/theme";

const OPTIONS: { theme: Theme; label: string; Icon: typeof FiSun }[] = [
  { theme: "light", label: "Light", Icon: FiSun },
  { theme: "dark", label: "Dark", Icon: FiMoon },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());

  function select(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div
      className="flex rounded overflow-hidden border shrink-0"
      style={{ borderColor: "var(--border)" }}
    >
      {OPTIONS.map(({ theme: optionTheme, label, Icon }) => (
        <button
          key={optionTheme}
          onClick={() => select(optionTheme)}
          title={`Switch to ${label.toLowerCase()} mode`}
          aria-label={`Switch to ${label.toLowerCase()} mode`}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-colors"
          style={{
            background:
              theme === optionTheme ? "var(--accent)" : "transparent",
            color: theme === optionTheme ? "#fff" : "var(--text-muted)",
          }}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
}
