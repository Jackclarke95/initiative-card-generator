"use client";

import SegmentedToggle from "@/components/SegmentedToggle";

const OPTIONS = [
  { value: "hide", label: "Hide" },
  { value: "show", label: "Show" },
] as const;

interface VisibilityToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Show/Hide segmented toggle controlling whether a field or section prints
 *  on the card, styled like the app's other mode toggles (theme, art, etc). */
export default function VisibilityToggle({
  checked,
  onChange,
}: VisibilityToggleProps) {
  return (
    <SegmentedToggle
      options={OPTIONS}
      value={checked ? "show" : "hide"}
      onChange={(next) => onChange(next === "show")}
      size="sm"
    />
  );
}
