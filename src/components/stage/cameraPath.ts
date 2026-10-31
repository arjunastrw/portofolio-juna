import { CatmullRomCurve3, Vector3 } from 'three';
import { STATIONS, VIAS, type Station, type V3 } from '../../stations';

/**
 * The camera rail: one curve for camera positions and one for look-at targets, sharing
 * the same curve parameter so that each station's target is hit exactly when the camera
 * reaches that station. Movement along the rail is parameterised by arc length (u), so
 * the camera's speed does not depend on how far apart the control points are.
 */
export interface Rail {
  position: CatmullRomCurve3;
  target: CatmullRomCurve3;
  /** Arc-length position (0..1) of each station on the rail. */
  stationU: number[];
}

const v = (p: V3) => new Vector3(p[0], p[1], p[2]);

/**
 * @param distanceScale per-station multiplier (>= 1) that pulls the camera back along its
 *   view direction, used to keep the subject inside narrower frames (e.g. 16:10).
 */
export function buildRail(distanceScale: (station: Station) => number): Rail {
  const positions: Vector3[] = [];
  const targets: Vector3[] = [];
  const stationIndex: number[] = [];

  const scaled = (camera: V3, target: Vector3, k: number) => v(camera).sub(target).multiplyScalar(k).add(target);

  STATIONS.forEach((station, i) => {
    const target = v(station.target);
    const k = distanceScale(station);
    stationIndex.push(positions.length);
    positions.push(scaled(station.camera, target, k));
    targets.push(target);

    const via = VIAS.find((x) => x.after === i);
    const next = STATIONS[i + 1];
    if (via && next) {
      const viaTarget = target.clone().lerp(v(next.target), 0.5);
      const kVia = (k + distanceScale(next)) / 2;
      positions.push(scaled(via.camera, viaTarget, kVia));
      targets.push(viaTarget);
    }
  });

  const position = new CatmullRomCurve3(positions, false, 'centripetal');
  const target = new CatmullRomCurve3(targets, false, 'centripetal');
  position.arcLengthDivisions = 2000;

  const lengths = position.getLengths();
  const total = lengths[lengths.length - 1];
  const segments = positions.length - 1;
  const stationU = stationIndex.map((index) => {
    const at = Math.round((index / segments) * (lengths.length - 1));
    return lengths[at] / total;
  });

  return { position, target, stationU };
}

export function sampleRail(rail: Rail, u: number, outPosition: Vector3, outTarget: Vector3) {
  // distance 0 = "use u" (three treats a falsy distance as unset).
  const t = rail.position.getUtoTmapping(Math.min(1, Math.max(0, u)), 0);
  rail.position.getPoint(t, outPosition);
  rail.target.getPoint(t, outTarget);
}
