"use client";

import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import SegmentedToggle from "@/components/SegmentedToggle";
import { applyTheme, getCurrentTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof FiSun; title: string }[] = [
  { value: "light", label: "Light", Icon: FiSun, title: "Switch to light mode" },
  { value: "dark", label: "Dark", Icon: FiMoon, title: "Switch to dark mode" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());

  function select(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <SegmentedToggle options={OPTIONS} value={theme} onChange={select} fill={false} />
  );
}
