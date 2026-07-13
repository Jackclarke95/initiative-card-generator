"use client";

import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { applyTheme, getCurrentTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className="w-6 h-6 shrink-0 flex items-center justify-center rounded"
      style={{
        background: "var(--surface-raised)",
        color: "var(--text-muted)",
      }}
    >
      {theme === "dark" ? <FiSun size={13} /> : <FiMoon size={13} />}
    </button>
  );
}
