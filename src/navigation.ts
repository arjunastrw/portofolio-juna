import { ARRIVE_AT, STATIONS, type Station } from './stations';
import type { Layout } from './layout';
import { prefersReducedMotion } from './hooks/useStageMode';

/**
 * Navigation between stations, shared by the header, the hash/history sync and the
 * 3D stage. Lives in the initial chunk; the stage registers a controller when it loads.
 */

export interface StageController {
  /** Snap the camera to the current scroll position, bypassing scrub smoothing. */
  syncNow(): void;
}

export const stageBus: {
  controller: StageController | null;
  /** Element that holds the canvas; faded out and in for cuts. */
  layer: HTMLElement | null;
  /** Set by the stage: highlight the shelf box for a side project (index), or none. */
  shelfFocus: ((index: number | null) => void) | null;
} = { controller: null, layer: null, shelfFocus: null };

export const navState: { activeIndex: number; busy: boolean } = { activeIndex: 0, busy: false };

const HEADER_OFFSET = 72;
const CUT_FADE_MS = 90;

/** Scroll position at which a station counts as arrived. Used by navigation and by the camera rail. */
export function arrivalScrollTop(station: Station, layout: Layout): number {
  if (station.id === 's0') return 0;
  const el = document.getElementById(station.domId);
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const offset = layout === 'stage' ? ARRIVE_AT * window.innerHeight : HEADER_OFFSET;
  return Math.max(0, Math.round(top - offset));
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function fadeLayer(layer: HTMLElement, opacity: number): Promise<void> {
  return new Promise((resolve) => {
    layer.style.transition = `opacity ${CUT_FADE_MS}ms linear`;
    layer.style.opacity = String(opacity);
    window.setTimeout(resolve, CUT_FADE_MS + 10);
  });
}

function waitForScrollEnd(top: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('scrollend', finish);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, 1600);
    if (Math.abs(window.scrollY - top) < 2) finish();
    else window.addEventListener('scrollend', finish, { once: true });
  });
}

function focusHeading(station: Station) {
  const heading = document.getElementById(`${station.domId}-title`);
  heading?.focus({ preventScroll: true });
}

/**
 * Move to a station. Adjacent stations scroll smoothly so the camera travels the rail;
 * non-adjacent ones on the 3D stage are a cut: fade out, jump, snap the camera, fade in.
 */
export async function goToStation(station: Station, layout: Layout): Promise<void> {
  if (navState.busy) return;
  navState.busy = true;
  try {
    const toIndex = STATIONS.indexOf(station);
    const adjacent = Math.abs(toIndex - navState.activeIndex) <= 1;
    const top = arrivalScrollTop(station, layout);
    const layer = stageBus.layer;

    if (layout === 'stage' && !adjacent && layer) {
      await fadeLayer(layer, 0);
      window.scrollTo({ top, behavior: 'instant' });
      stageBus.controller?.syncNow();
      await nextFrame();
      await nextFrame();
      await fadeLayer(layer, 1);
    } else {
      const smooth = !prefersReducedMotion();
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
      if (smooth) await waitForScrollEnd(top);
    }
    focusHeading(station);
  } finally {
    navState.busy = false;
  }
}
