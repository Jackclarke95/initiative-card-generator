# Initiative Card Generator — Remaining Work

Three tasks left before the card matches the reference aesthetic (white background, angular L-bracket corner boxes).

---

## 1. `components/ClassLogos.tsx` — CREATE THIS FILE

Inline React SVG components for all 12 D&D class logos.

The user shared the original SVG files earlier (context was lost). Options:
- Re-share the SVG files to Claude
- Or Claude can read `C:\Users\Jackc\.claude\projects\c--Users-Jackc-source-repos\9c9da595-4d89-4dd8-8432-30dcb698de36.jsonl` to recover the paths from the transcript

**Classes needed:** Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard

**Format:**
```tsx
export function PaladinLogo({ size = 80, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className}>
      {/* path data here — convert fill:#00040c to fill="currentColor" */}
    </svg>
  );
}

export const CLASS_LOGO_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Paladin: PaladinLogo,
  // ...
};
```

---

## 2. `types/card.ts` + `components/CardEditor.tsx` — ADD `playerName`

Add `playerName: string` to `CardData` and `DEFAULT_CARD`:
```ts
// types/card.ts — add to CardData interface:
playerName: string;

// DEFAULT_CARD:
playerName: "Jack",
```

Add a "Player Name" field to `CardEditor.tsx` in the Identity section (next to or below character Name).

---

## 3. Full aesthetic restyle — `components/InitiativeCard.tsx` + `app/globals.css`

### globals.css — change card CSS variables to white theme:
```css
--card-bg: #ffffff;
--card-ink: #111111;
--card-accent: #1a1a2e;
--card-border: #cccccc;
--card-header-bg: #1a1a2e;
--card-header-text: #ffffff;
--card-section-bg: #f5f5f5;
--font-card: system-ui, sans-serif;
```

### InitiativeCard.tsx — DM face layout (reference image style):

Each stat gets its own bordered box with **angular L-bracket corner decorations** and label below the number.

```
┌──────────────────────────┐
│ NAME         (full width)│   ← characterName, large text
├──────────────────────────┤
│ PLAYER       (full width)│   ← playerName
├──────────────────────────┤
│ RACE         (full width)│
├──────────────────────────┤
│ CLASS        (full width)│   ← characterClass + subclass + level
├────────┬─────────┬───────┤
│MAX HP  │AC       │SPELL  │
│  52    │  18     │SAVE 14│
├────────┴──┬──────┴───────┤
│PERCEPTION │SPEED│INSIGHT  │
│    12     │ 30  │   14    │
└───────────┴─────┴─────────┘
```

**L-bracket corner decoration** on each box = 4 small absolutely-positioned divs (or pseudo-elements), 8px × 8px, 2px border, only showing the corner sides.

### InitiativeCard.tsx — Player face layout (rotated 180°):
- Class logo from `ClassLogos.tsx` centered, large (80px)
- Label "CHARACTER APPEARANCE" small below
- Initiative box in the top-right corner

---

## Reference aesthetic
- Clean white, airy — NOT parchment/brown
- Bold numbers, small ALL-CAPS labels below each stat
- Angular bracket corners on every stat box (not rounded cards)
- Dark navy header bar for the DM face (name + initiative)
