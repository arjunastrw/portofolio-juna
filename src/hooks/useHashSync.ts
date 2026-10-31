import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { STATIONS, stationByHash, type Station } from '../stations';
import type { Layout } from '../layout';
import { arrivalScrollTop, goToStation, navState, stageBus } from '../navigation';
import { useActiveSection } from './useActiveSection';

const DOM_IDS = STATIONS.map((s) => s.domId);

function replaceHash(hash: string) {
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  try {
    // Safari throttles history updates; a failure here must never break scrolling.
    window.history.replaceState(window.history.state, '', url);
  } catch {
    /* ignore */
  }
}

/**
 * Two-way sync between scroll position and URL hash:
 * - scrolling updates the hash (replaceState, only when the active station changes);
 * - nav clicks push a history entry and move to the station;
 * - back/forward and a hash on first load move to the station without a camera sweep.
 */
export function useHashSync(layout: Layout) {
  const activeId = useActiveSection(DOM_IDS, layout);
  const activeIndex = Math.max(0, STATIONS.findIndex((s) => s.domId === activeId));
  const userScrolled = useRef(false);
  const firstLayout = useRef(true);

  // Scroll → hash.
  useEffect(() => {
    if (activeId === null) return;
    navState.activeIndex = activeIndex;
    if (navState.busy) return;
    const hash = STATIONS[activeIndex].hash;
    if ((window.location.hash || '') !== hash) replaceHash(hash);
  }, [activeId, activeIndex]);

  // Hash on first load: jump before paint so the camera starts at the right station.
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    const station = stationByHash(window.location.hash);
    if (!station || station.id === 's0') return;

    const jump = () => {
      window.scrollTo({ top: arrivalScrollTop(station, layout), behavior: 'instant' });
      navState.activeIndex = STATIONS.indexOf(station);
      // If the stage is already running, snap the camera instead of letting it scrub across.
      stageBus.controller?.syncNow();
    };
    jump();

    const markScrolled = () => {
      userScrolled.current = true;
    };
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    events.forEach((e) => window.addEventListener(e, markScrolled, { once: true, passive: true }));
    // Web fonts change section heights; re-align once they are in, unless the reader already moved.
    void document.fonts.ready.then(() => {
      if (!userScrolled.current) jump();
    });
    return () => events.forEach((e) => window.removeEventListener(e, markScrolled));
    // Runs once on mount; `layout` is already final because the mode is decided synchronously.
  }, []);

  // Layout switch mid-session (resize, rotation, reduced motion): keep the reader on the same station.
  useLayoutEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      return;
    }
    const station = STATIONS[navState.activeIndex];
    window.scrollTo({ top: arrivalScrollTop(station, layout), behavior: 'instant' });
  }, [layout]);

  // Back / forward.
  useEffect(() => {
    const onPop = () => {
      const station = stationByHash(window.location.hash) ?? STATIONS[0];
      void goToStation(station, layout);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [layout]);

  const go = useCallback(
    (station: Station) => {
      const url = `${window.location.pathname}${window.location.search}${station.hash}`;
      if ((window.location.hash || '') !== station.hash) {
        try {
          window.history.pushState(null, '', url);
        } catch {
          /* ignore */
        }
      }
      void goToStation(station, layout);
    },
    [layout],
  );

  return { activeIndex, go };
}
