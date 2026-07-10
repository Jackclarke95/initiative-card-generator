import type { DamageType } from "@/types/card";
import { JSX } from "react/jsx-runtime";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function ShieldIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" />
    </svg>
  );
}

export function HalfShieldIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25V2z" fill={color} />
      <path
        d="M12 2l9 5v6c0 5.25-3.75 10.15-9 11.25V2z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function HeartIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function BootIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M19 19H5v-2h1V8c0-3.31 2.69-6 6-6s6 2.69 6 6v1h1v8h1v2zm-3-2V9h-1V8c0-2.21-1.79-4-4-4S7 5.79 7 8v9h9z" />
    </svg>
  );
}

export function EyeIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

export function BrainIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" />
    </svg>
  );
}

export function MagnifyingGlassIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

export function SparkleIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// ── Damage-type icons ─────────────────────────────────────────────────

const DAMAGE_ICONS: Record<DamageType, (props: IconProps) => JSX.Element> = {
  fire: ({ size = 12, color = "#e25822" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
    </svg>
  ),
  cold: ({ size = 12, color = "#6eb4e8" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M22 11h-4.17l2.96-2.96-1.41-1.41-4.38 4.37V7.17l2.95-2.95L16.54 2.8 14 5.34V1h-2v4.34L9.46 2.81 8.04 4.22l2.96 2.96v3.82L6.62 6.62 5.21 8.04 8.17 11H4v2h4.17L5.21 15.96l1.41 1.41 4.38-4.37v3.83l-2.95 2.95 1.41 1.42L12 18.66V23h2v-4.34l2.54 2.54 1.42-1.42-2.96-2.95V13h3.82l4.38 4.37 1.41-1.41L21.83 13H26v-2h-4z" />
    </svg>
  ),
  lightning: ({ size = 12, color = "#f5c518" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  ),
  acid: ({ size = 12, color = "#7ec850" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h2v9zm4 0h-2V8h2v9z" />
    </svg>
  ),
  poison: ({ size = 12, color = "#5cb85c" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  necrotic: ({ size = 12, color = "#6a0dad" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-13h-2v5H9l3 5 3-5h-2V7z" />
    </svg>
  ),
  radiant: ({ size = 12, color = "#ffd700" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
    </svg>
  ),
  psychic: ({ size = 12, color = "#e91e8c" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3z" />
    </svg>
  ),
  force: ({ size = 12, color = "#9b59b6" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
    </svg>
  ),
  thunder: ({ size = 12, color = "#607d8b" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  ),
  bludgeoning: ({ size = 12, color = "#795548" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  ),
  piercing: ({ size = 12, color = "#9e9e9e" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.3 2.841A1 1 0 005 3.75V20.25a1 1 0 001.3.959l12-4a1 1 0 000-1.918l-12-4z" />
    </svg>
  ),
  slashing: ({ size = 12, color = "#ef5350" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3l5 9H7l5-9z" />
    </svg>
  ),
};

interface DamageIconProps {
  type: DamageType;
  size?: number;
}

export function DamageTypeIcon({ type, size = 12 }: DamageIconProps) {
  const IconComponent = DAMAGE_ICONS[type];
  return (
    <span title={type} className="inline-flex items-center gap-0.5">
      <IconComponent size={size} />
    </span>
  );
}

export const DAMAGE_LABELS: Record<DamageType, string> = {
  acid: "Acid",
  bludgeoning: "Bludgeoning",
  cold: "Cold",
  fire: "Fire",
  force: "Force",
  lightning: "Lightning",
  necrotic: "Necrotic",
  piercing: "Piercing",
  poison: "Poison",
  psychic: "Psychic",
  radiant: "Radiant",
  slashing: "Slashing",
  thunder: "Thunder",
};

export const ALL_DAMAGE_TYPES: DamageType[] = Object.keys(
  DAMAGE_LABELS,
) as DamageType[];
