/**
 * The five stations of the page. Shared by the DOM (routing, layout) and the 3D stage.
 *
 * World units are metres. +Y up, origin on the floor below the desk centre, +Z towards
 * the viewer. Desk top at y = 0.74, back wall at z = -0.42. See docs/ASSET-SPEC.md.
 */

export type StationId = 's0' | 's1' | 's2' | 's3' | 's4';
export type V3 = readonly [number, number, number];

export interface Station {
  id: StationId;
  /** DOM id of the section and the URL hash ('' for the masthead). */
  domId: string;
  hash: string;
  label: string;
  /** Designed camera position and look-at target. */
  camera: V3;
  target: V3;
  /** Radius (m) of the subject around `target` that must stay inside the visible frame. */
  frameRadius: number;
}

export const STATIONS: readonly Station[] = [
  { id: 's0', domId: 'top', hash: '', label: 'Top', camera: [1.15, 1.42, 1.95], target: [0.02, 1.0, -0.2], frameRadius: 0.95 },
  { id: 's1', domId: 'experience', hash: '#experience', label: 'Experience', camera: [0.42, 1.12, 0.9], target: [0.05, 1.03, -0.25], frameRadius: 0.4 },
  { id: 's2', domId: 'projects', hash: '#projects', label: 'Projects', camera: [0.95, 1.3, 0.55], target: [0.63, 1.2, -0.34], frameRadius: 0.32 },
  { id: 's3', domId: 'toolkit', hash: '#toolkit', label: 'Toolkit', camera: [-0.15, 1.2, 0.62], target: [-0.52, 1.1, -0.41], frameRadius: 0.33 },
  { id: 's4', domId: 'contact', hash: '#contact', label: 'Contact', camera: [0.8, 1.28, 0.8], target: [0.5, 0.75, 0.12], frameRadius: 0.3 },
];

/**
 * Extra control points between stations so the camera pulls back slightly instead of
 * cutting through the monitor. `after` is the index of the station the via point follows.
 */
export const VIAS: readonly { after: number; camera: V3 }[] = [
  { after: 1, camera: [0.75, 1.22, 0.85] },
  { after: 2, camera: [0.35, 1.38, 0.95] },
  { after: 3, camera: [0.3, 1.3, 1.05] },
];

export const CAMERA_FOV = 30;

/**
 * Framing. Each station's camera is pulled back along its view direction until a sphere of
 * `frameRadius` around the target fits the visible area (right of the text column).
 * `margin` adds breathing room. `narrowAspect` is the option for 16:10 and squarer
 * screens: below `below` (width / height), stations pull back by an extra `factor`.
 * Factor 1 = off.
 */
export const FRAMING = {
  margin: 1.15,
  narrowAspect: { below: 1.7, factor: 1.0 },
} as const;

/** Fraction of the viewport height at which a section's top edge counts as "arrived". */
export const ARRIVE_AT = 0.15;

export function stationByHash(hash: string): Station | undefined {
  const normalised = hash === '#' || hash === '#top' ? '' : hash;
  return STATIONS.find((s) => s.hash === normalised);
}

export function stationByDomId(domId: string): Station | undefined {
  return STATIONS.find((s) => s.domId === domId);
}
