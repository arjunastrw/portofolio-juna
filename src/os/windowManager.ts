/**
 * Window manager for the desktop layout: which windows are open, minimised or maximised,
 * where they sit, and their stacking order. Pure reducer, so it is easy to reason about.
 */

export const APP_IDS = ['about', 'experience', 'projects', 'toolkit', 'contact'] as const;
export type AppId = (typeof APP_IDS)[number];

export interface WinState {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  /** y at the time the window was opened; caps its height so it fits above the taskbar. */
  capY: number;
  /** Stacking order; higher is in front. */
  z: number;
}

export interface WmState {
  wins: Record<AppId, WinState>;
  /** Next z value to hand out. */
  top: number;
  /** Window that has focus (front-most, not minimised), or null. */
  active: AppId | null;
  /** Bumped whenever a window should receive keyboard focus. */
  focusTick: number;
}

export type WmAction =
  | { type: 'open'; id: AppId }
  | { type: 'close'; id: AppId }
  | { type: 'minimize'; id: AppId }
  | { type: 'toggleMax'; id: AppId }
  | { type: 'raise'; id: AppId }
  | { type: 'move'; id: AppId; x: number; y: number }
  | { type: 'closeAll' }
  | { type: 'clamp'; width: number; height: number };

/** Default window widths in px (CSS also caps them to the viewport). */
export const WIN_WIDTH: Record<AppId, number> = {
  about: 760,
  experience: 800,
  projects: 820,
  toolkit: 600,
  contact: 560,
};

/** Width of the desktop-icon column; windows open to the right of it. */
const ICON_COLUMN = 124;
/** How much of a window must stay on screen while dragging, in px. */
const KEEP_VISIBLE = 96;
const TITLE_BAR = 28;

function defaultPosition(id: AppId, width: number, height: number): { x: number; y: number } {
  const w = Math.min(WIN_WIDTH[id], width - 32);
  if (id === 'about') {
    return { x: Math.max(ICON_COLUMN, Math.round((width - w) / 2) - 40), y: Math.max(16, Math.round(height * 0.05)) };
  }
  // Cascade the other windows, like a fresh session would.
  const i = APP_IDS.indexOf(id);
  const x = Math.min(ICON_COLUMN + 40 + i * 32, Math.max(ICON_COLUMN, width - w - 16));
  return { x, y: 20 + i * 26 };
}

export function initialState(width: number, height: number, openIds: AppId[]): WmState {
  const wins = {} as Record<AppId, WinState>;
  let top = 1;
  for (const id of APP_IDS) {
    const pos = defaultPosition(id, width, height);
    wins[id] = { open: false, minimized: false, maximized: false, z: 0, ...pos, capY: pos.y };
  }
  for (const id of openIds) {
    wins[id] = { ...wins[id], open: true, z: top++ };
  }
  return { wins, top, active: openIds[openIds.length - 1] ?? null, focusTick: 0 };
}

/** Front-most window that is open and not minimised. */
function frontMost(wins: Record<AppId, WinState>): AppId | null {
  let best: AppId | null = null;
  for (const id of APP_IDS) {
    const w = wins[id];
    if (w.open && !w.minimized && (best === null || w.z > wins[best].z)) best = id;
  }
  return best;
}

function clampPos(id: AppId, x: number, y: number, width: number, height: number) {
  const w = Math.min(WIN_WIDTH[id], width - 32);
  return {
    x: Math.round(Math.min(Math.max(x, KEEP_VISIBLE - w), width - KEEP_VISIBLE)),
    y: Math.round(Math.min(Math.max(y, 0), height - TITLE_BAR)),
  };
}

export function wmReducer(state: WmState, action: WmAction): WmState {
  switch (action.type) {
    case 'open':
    case 'raise': {
      const w = state.wins[action.id];
      if (action.type === 'raise' && (!w.open || state.active === action.id)) return state;
      const capY = w.open ? w.capY : w.y;
      const wins = { ...state.wins, [action.id]: { ...w, open: true, minimized: false, z: state.top, capY } };
      return {
        wins,
        top: state.top + 1,
        active: action.id,
        focusTick: action.type === 'open' ? state.focusTick + 1 : state.focusTick,
      };
    }
    case 'close':
    case 'minimize': {
      const w = state.wins[action.id];
      const next =
        action.type === 'close' ? { ...w, open: false, minimized: false, maximized: false } : { ...w, minimized: true };
      const wins = { ...state.wins, [action.id]: next };
      return { ...state, wins, active: frontMost(wins), focusTick: state.focusTick + 1 };
    }
    case 'toggleMax': {
      const w = state.wins[action.id];
      const wins = { ...state.wins, [action.id]: { ...w, maximized: !w.maximized, z: state.top } };
      return { ...state, wins, top: state.top + 1, active: action.id };
    }
    case 'move': {
      const w = state.wins[action.id];
      if (w.x === action.x && w.y === action.y) return state;
      return { ...state, wins: { ...state.wins, [action.id]: { ...w, x: action.x, y: action.y } } };
    }
    case 'closeAll': {
      const wins = { ...state.wins };
      for (const id of APP_IDS) wins[id] = { ...wins[id], open: false, minimized: false, maximized: false };
      return { ...state, wins, active: null };
    }
    case 'clamp': {
      let changed = false;
      const wins = { ...state.wins };
      for (const id of APP_IDS) {
        const p = clampPos(id, wins[id].x, wins[id].y, action.width, action.height);
        if (p.x !== wins[id].x || p.y !== wins[id].y) {
          wins[id] = { ...wins[id], ...p };
          changed = true;
        }
      }
      return changed ? { ...state, wins } : state;
    }
  }
}

export { clampPos };

export function appFromHash(hash: string): AppId | null {
  const id = hash.replace(/^#/, '');
  return (APP_IDS as readonly string[]).includes(id) ? (id as AppId) : null;
}
