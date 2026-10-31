import { ARRIVE_AT, STATIONS } from '../../stations';
import { arrivalScrollTop } from '../../navigation';

/**
 * Scroll position → rail position.
 *
 * Each station has a dwell zone (the camera holds still while its section is read) and
 * the gap to the next station is a transit zone (the camera travels). The camera arrives
 * when the section's top edge reaches ARRIVE_AT of the viewport, and leaves when the
 * section's bottom edge rises to (1 - ARRIVE_AT).
 */
export interface Anchor {
  arrive: number;
  leave: number;
}

export function computeAnchors(): Anchor[] {
  const vh = window.innerHeight;
  const anchors = STATIONS.map((station) => {
    const arrive = arrivalScrollTop(station, 'stage');
    const el = document.getElementById(station.domId);
    if (!el) return { arrive, leave: arrive };
    const top = el.getBoundingClientRect().top + window.scrollY;
    const leave = Math.max(arrive, Math.round(top + el.offsetHeight - (1 - ARRIVE_AT) * vh));
    return { arrive, leave };
  });
  // Keep the zones ordered even if a section is unexpectedly short.
  for (let i = 1; i < anchors.length; i++) {
    anchors[i].arrive = Math.max(anchors[i].arrive, anchors[i - 1].leave + 1);
    anchors[i].leave = Math.max(anchors[i].leave, anchors[i].arrive);
  }
  return anchors;
}

/** Transit easing: starts and stops gently, never overshoots. */
const easeInOutSine = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);

export function scrollToU(y: number, anchors: Anchor[], stationU: number[]): number {
  const last = anchors.length - 1;
  if (anchors.length === 0) return 0;
  if (y <= anchors[0].leave) return stationU[0];
  for (let i = 0; i < last; i++) {
    const from = anchors[i];
    const to = anchors[i + 1];
    if (y <= from.leave) return stationU[i];
    if (y < to.arrive) {
      const p = (y - from.leave) / Math.max(1, to.arrive - from.leave);
      return stationU[i] + (stationU[i + 1] - stationU[i]) * easeInOutSine(p);
    }
  }
  return stationU[last];
}
