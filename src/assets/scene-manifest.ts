/**
 * Every object in the 3D stage. One entry per asset slot; see docs/ASSET-SPEC.md for the
 * modelling and export rules each entry must follow.
 *
 * status:
 *   placeholder  procedural geometry in code; no file is requested.
 *   final        `path` is loaded (meshopt-compressed GLB, WebP textures).
 */

import type { StationId } from '../stations';

export type AssetStatus = 'placeholder' | 'final';

export interface SceneAsset {
  id: string;
  station: StationId | 'room';
  /** GLB path under public/, relative to the site root. */
  path: string;
  /** Node inside the GLB to use, when one file holds several objects. Defaults to the whole scene. */
  node?: string;
  /** Target bounding size in metres [width (x), height (y), depth (z)]. */
  size: readonly [number, number, number];
  /** Triangle budget after decimation. */
  tris: number;
  /** Part of the baked lightmap set (static); false = lit in real time (moves or has no bake). */
  lightmapped: boolean;
  status: AssetStatus;
  /** Source and licence of a third-party model, e.g. "Poly Haven, CC0". */
  source?: string;
}

export const SCENE_ASSETS: readonly SceneAsset[] = [
  { id: 'room_shell', station: 'room', path: 'models/room_shell.glb', size: [6, 3, 6], tris: 200, lightmapped: true, status: 'placeholder' },
  { id: 'desk', station: 'room', path: 'models/desk.glb', size: [1.6, 0.74, 0.75], tris: 4000, lightmapped: true, status: 'placeholder' },
  { id: 'desk_lamp', station: 'room', path: 'models/desk_lamp.glb', size: [0.3, 0.86, 0.45], tris: 6000, lightmapped: true, status: 'placeholder' },
  { id: 'monitor', station: 's1', path: 'models/monitor.glb', size: [0.62, 0.5, 0.2], tris: 5000, lightmapped: true, status: 'placeholder' },
  { id: 'wall_shelf', station: 's2', path: 'models/wall_shelf.glb', size: [0.5, 0.06, 0.16], tris: 800, lightmapped: true, status: 'placeholder' },
  { id: 'archive_box_01', station: 's2', path: 'models/archive_boxes.glb', node: 'archive_box_01', size: [0.075, 0.15, 0.12], tris: 600, lightmapped: false, status: 'placeholder' },
  { id: 'archive_box_02', station: 's2', path: 'models/archive_boxes.glb', node: 'archive_box_02', size: [0.075, 0.135, 0.12], tris: 600, lightmapped: false, status: 'placeholder' },
  { id: 'archive_box_03', station: 's2', path: 'models/archive_boxes.glb', node: 'archive_box_03', size: [0.075, 0.145, 0.12], tris: 600, lightmapped: false, status: 'placeholder' },
  { id: 'archive_box_04', station: 's2', path: 'models/archive_boxes.glb', node: 'archive_box_04', size: [0.075, 0.125, 0.12], tris: 600, lightmapped: false, status: 'placeholder' },
  { id: 'archive_box_05', station: 's2', path: 'models/archive_boxes.glb', node: 'archive_box_05', size: [0.075, 0.14, 0.12], tris: 600, lightmapped: false, status: 'placeholder' },
  { id: 'pegboard', station: 's3', path: 'models/pegboard.glb', size: [0.5, 0.4, 0.02], tris: 3000, lightmapped: true, status: 'placeholder' },
  { id: 'pegboard_tools', station: 's3', path: 'models/pegboard_tools.glb', size: [0.46, 0.34, 0.06], tris: 8000, lightmapped: true, status: 'placeholder' },
  { id: 'notebook', station: 's4', path: 'models/notebook.glb', size: [0.296, 0.012, 0.21], tris: 1500, lightmapped: true, status: 'placeholder' },
  { id: 'pen', station: 's4', path: 'models/pen.glb', size: [0.14, 0.01, 0.01], tris: 600, lightmapped: true, status: 'placeholder' },
  { id: 'phone', station: 's4', path: 'models/phone.glb', size: [0.072, 0.008, 0.147], tris: 1200, lightmapped: true, status: 'placeholder' },
];

/** Hard limit for everything under public/models (GLB + textures + lightmaps). */
export const ASSET_BUDGET_BYTES = 2 * 1024 * 1024;
