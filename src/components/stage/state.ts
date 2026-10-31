import type { Anchor } from './scrollMap';
import type { Rail } from './cameraPath';

/** Mutable per-frame state shared by the scroll driver, the camera rig and the scene. */
export interface StageState {
  /** Smoothed (scrubbed) scroll position in px. */
  y: number;
  anchors: Anchor[];
  rail: Rail | null;
  /** Pointer position, -1..1 on both axes. */
  pointer: { x: number; y: number };
  /** Index of the side project whose shelf box is pulled forward, or null. */
  shelfFocus: number | null;
}

export function createStageState(): StageState {
  return { y: 0, anchors: [], rail: null, pointer: { x: 0, y: 0 }, shelfFocus: null };
}
