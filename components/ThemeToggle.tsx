"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "@/components/Icons";
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
      {theme === "dark" ? <SunIcon size={13} /> : <MoonIcon size={13} />}
    </button>
  );
}
