import type { Party } from "@/types/party";

// Bumped to v2 when CardData's fixed vital fields (ac/maxHp/etc.) became the
// user-configurable vitalBoxes list, to v3 when the new required vitalRows
// field (row/column grouping for that list) was added, and to v4 when each
// row's shape changed again (an explicit `count`, and align values renamed
// left/right/center/justify) — old sessions are discarded rather than
// loaded with a stale shape.
const STORAGE_KEY = "initiative-cards:state:v4";

export interface PersistedState {
  parties: Party[];
  activePartyId: string;
}

function isValidState(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const state = value as PersistedState;
  return (
    Array.isArray(state.parties) &&
    state.parties.length > 0 &&
    typeof state.activePartyId === "string"
  );
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota) — persistence is best-effort
  }
}
