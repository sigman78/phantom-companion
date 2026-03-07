import type { AppPhase, TurnState } from '../types/game';

export const SAVE_VERSION = 1;
const STORAGE_KEY = 'phantom-epoch-save';

export interface SavedState {
  version: number;
  phase: AppPhase;
  turn: TurnState;
}

// Auto-save is disabled until the user makes their restore-or-new-game choice,
// so the initial store hydration never overwrites a valid saved state.
let _autosaveEnabled = false;

export function enableAutosave(): void {
  _autosaveEnabled = true;
}

export function isAutosaveEnabled(): boolean {
  return _autosaveEnabled;
}

export function saveState(phase: AppPhase, turn: TurnState): void {
  if (!_autosaveEnabled) return;
  try {
    const payload: SavedState = { version: SAVE_VERSION, phase, turn };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable or quota exceeded — ignore silently
  }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed['version'] !== SAVE_VERSION) return null;
    return parsed as unknown as SavedState;
  } catch {
    return null;
  }
}
