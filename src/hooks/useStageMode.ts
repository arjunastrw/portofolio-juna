import { useSyncExternalStore } from 'react';

/**
 * Decides, synchronously and before the first render, whether the page runs as the 3D
 * stage or as stacked sections with still images. Changes after load (resize, rotation,
 * reduced-motion toggled) are picked up through matchMedia subscriptions.
 *
 * `?mode=stack` or `?mode=stage` forces a mode, for testing.
 */

const STAGE_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let webglSupport: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    webglSupport = gl !== null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function prefersSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

function forcedMode(): 'stage' | 'stack' | null {
  const value = new URLSearchParams(window.location.search).get('mode');
  return value === 'stage' || value === 'stack' ? value : null;
}

function getSnapshot(): boolean {
  const forced = forcedMode();
  if (forced === 'stack') return false;
  const capable = supportsWebGL() && !prefersSaveData();
  if (forced === 'stage') return capable;
  return (
    capable &&
    window.matchMedia(STAGE_QUERY).matches &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function subscribe(onChange: () => void): () => void {
  const queries = [STAGE_QUERY, REDUCED_MOTION_QUERY].map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
}

/** True when the device can run the 3D stage. Does not account for a stage that failed at runtime. */
export function useStageCapable(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
