// Placeholder monster-type icons (flat geometric glyphs, fill follows
// currentColor) — one per D&D 5e creature type. Unlike the class logos
// these aren't traced from reference art; swap in nicer line art later
// if/when reference PNGs show up for these.

interface LogoProps {
  size?: number;
  className?: string;
}

export function AberrationLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8,48 Q50,8 92,48 Q50,88 8,48 Z M50,34 A14,14 0 1,0 50,62 A14,14 0 1,0 50,34 Z"
      />
      <path d="M32,76 Q26,86 16,88 Q24,80 24,70 Q28,74 32,76Z" />
      <path d="M50,80 Q50,92 42,98 Q47,88 44,78 Q47,80 50,80Z" />
      <path d="M68,76 Q74,86 84,88 Q76,80 76,70 Q72,74 68,76Z" />
    </svg>
  );
}

export function BeastLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <ellipse cx="50" cy="66" rx="24" ry="20" />
      <ellipse cx="22" cy="38" rx="10" ry="13" transform="rotate(-15 22 38)" />
      <ellipse cx="42" cy="24" rx="10" ry="13" transform="rotate(-5 42 24)" />
      <ellipse cx="60" cy="24" rx="10" ry="13" transform="rotate(5 60 24)" />
      <ellipse cx="80" cy="38" rx="10" ry="13" transform="rotate(15 80 38)" />
    </svg>
  );
}

export function CelestialLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,2 L59,38 L96,38 L66,59 L77,96 L50,73 L23,96 L34,59 L4,38 L41,38 Z" />
      <circle cx="50" cy="50" r="10" />
    </svg>
  );
}

export function ConstructLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M42,4 H58 L61,16 L74,10 L85,21 L79,32 L92,38 V54 L79,58 L85,69 L74,80 L61,74 L58,88 H42 L39,74 L26,80 L15,69 L21,58 L8,54 V38 L21,32 L15,21 L26,10 L39,16 Z
           M50,32 A18,18 0 1,0 50,68 A18,18 0 1,0 50,32 Z"
      />
    </svg>
  );
}

export function DragonLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,10 C60,22 62,34 58,46 L96,20 C90,42 76,58 60,64 L58,64 C64,74 70,84 82,92 C64,90 50,82 42,68 C38,80 30,88 16,92 C24,80 28,68 26,56 L4,66 C10,50 22,38 38,34 C40,24 44,16 50,10 Z" />
    </svg>
  );
}

export function ElementalLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,4 C64,24 72,36 66,52 C74,48 78,40 78,40 C86,56 82,76 66,88 C74,78 72,66 64,60 C64,74 56,84 44,88 C52,78 52,68 46,60 C38,68 34,78 36,90 C22,80 18,62 28,48 C22,50 18,54 14,60 C14,42 24,26 38,18 C36,28 38,34 44,38 C40,24 44,14 50,4 Z" />
    </svg>
  );
}

export function FeyLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,4 C53,26 58,32 62,36 C70,26 78,22 92,20 C80,30 74,38 68,44 C80,46 90,52 96,60 C82,56 72,56 64,58 C68,68 76,76 88,84 C74,80 64,74 58,66 C58,78 54,88 50,96 C46,88 42,78 42,66 C36,74 26,80 12,84 C24,76 32,68 36,58 C28,56 18,56 4,60 C10,52 20,46 32,44 C26,38 20,30 8,20 C22,22 30,26 38,36 C42,32 47,26 50,4 Z" />
    </svg>
  );
}

export function FiendLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M28,30 C18,18 14,6 14,6 C24,10 32,16 36,24 Z" />
      <path d="M72,30 C82,18 86,6 86,6 C76,10 68,16 64,24 Z" />
      <path
        fillRule="evenodd"
        d="M50,20 C70,20 80,36 80,52 C80,72 66,86 50,86 C34,86 20,72 20,52 C20,36 30,20 50,20 Z
           M38,46 A7,9 0 1,0 38,64 A7,9 0 1,0 38,46 Z
           M62,46 A7,9 0 1,0 62,64 A7,9 0 1,0 62,46 Z"
      />
      <path d="M36,70 L42,78 L48,70 L54,78 L60,70 L64,72 C60,80 55,86 50,86 C45,86 40,80 36,72 Z" />
    </svg>
  );
}

export function GiantLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M38,4 H62 V30 H74 V56 H68 C74,66 78,78 78,96 H60 C60,80 56,68 48,60 C40,68 36,80 36,96 H18 C18,78 22,66 28,56 H22 V30 H38 Z" />
    </svg>
  );
}

export function MonstrosityLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M10,20 L34,36 L26,44 Z" />
      <path d="M22,10 L42,32 L32,38 Z" />
      <path d="M90,20 L66,36 L74,44 Z" />
      <path d="M78,10 L58,32 L68,38 Z" />
      <path
        fillRule="evenodd"
        d="M50,30 C36,30 26,42 26,56 C26,72 36,84 50,84 C64,84 74,72 74,56 C74,42 64,30 50,30 Z
           M40,52 A6,8 0 1,0 40,68 A6,8 0 1,0 40,52 Z
           M60,52 A6,8 0 1,0 60,68 A6,8 0 1,0 60,52 Z"
      />
      <path d="M38,74 L44,84 L50,76 L56,84 L62,74 L66,76 C62,86 56,92 50,92 C44,92 38,86 34,76 Z" />
    </svg>
  );
}

export function OozeLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,10 C68,10 84,24 86,44 C88,64 78,82 58,90 C38,96 18,88 12,68 C6,50 14,30 30,20 C36,14 42,10 50,10 Z" />
      <circle cx="38" cy="42" r="6" />
      <circle cx="62" cy="56" r="5" />
    </svg>
  );
}

export function PlantLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50,96 C50,60 50,30 50,6 C74,10 92,28 90,50 C88,72 70,88 50,96 Z" />
      <path d="M50,6 C26,10 8,28 10,50 C12,72 30,88 50,96 C50,60 50,30 50,6 Z" opacity="0.6" />
    </svg>
  );
}

export function UndeadLogo({ size = 80, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M50,8 C72,8 88,26 88,48 C88,62 82,72 74,78 L74,90 L64,90 L64,80 L58,80 L58,90 L42,90 L42,80 L36,80 L36,90 L26,90 L26,78 C18,72 12,62 12,48 C12,26 28,8 50,8 Z
           M32,42 A8,10 0 1,0 32,62 A8,10 0 1,0 32,42 Z
           M68,42 A8,10 0 1,0 68,62 A8,10 0 1,0 68,42 Z
           M50,52 L44,66 L56,66 Z"
      />
    </svg>
  );
}

export const MONSTER_TYPE_LOGO_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Aberration: AberrationLogo,
  Beast: BeastLogo,
  Celestial: CelestialLogo,
  Construct: ConstructLogo,
  Dragon: DragonLogo,
  Elemental: ElementalLogo,
  Fey: FeyLogo,
  Fiend: FiendLogo,
  Giant: GiantLogo,
  Monstrosity: MonstrosityLogo,
  Ooze: OozeLogo,
  Plant: PlantLogo,
  Undead: UndeadLogo,
};

/** Case-insensitive lookup; returns undefined for unknown creature types. */
export function getMonsterTypeLogo(creatureType: string) {
  const key = Object.keys(MONSTER_TYPE_LOGO_MAP).find(
    (k) => k.toLowerCase() === creatureType.trim().toLowerCase(),
  );
  return key ? MONSTER_TYPE_LOGO_MAP[key] : undefined;
}
