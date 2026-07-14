"use client";

import type { IconType } from "react-icons";

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
  Icon?: IconType;
  title?: string;
  disabled?: boolean;
}

interface SegmentedToggleProps<T extends string> {
  options: readonly SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Content-sized buttons (e.g. the theme toggle) instead of the default
   *  equal-width, flex-filling buttons. */
  fill?: boolean;
  size?: "sm" | "xs";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SegmentedToggleProps<string>["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs",
  xs: "px-1.5 py-0.5 text-[10px]",
};

export default function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  fill = true,
  size = "sm",
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={
        "flex rounded overflow-hidden border shrink-0" +
        (className ? ` ${className}` : "")
      }
      style={{ borderColor: "var(--border)" }}
    >
      {options.map(({ value: optionValue, label, Icon, title, disabled }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          disabled={disabled}
          title={title}
          aria-label={title ?? label}
          className={
            (fill ? "flex-1 " : "") +
            "flex items-center justify-center gap-1 whitespace-nowrap font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed " +
            SIZE_CLASSES[size]
          }
          style={{
            background: value === optionValue ? "var(--accent)" : "transparent",
            color: value === optionValue ? "#fff" : "var(--text-muted)",
          }}
        >
          {Icon && <Icon size={size === "xs" ? 10 : 12} />}
          {label}
        </button>
      ))}
    </div>
  );
}
