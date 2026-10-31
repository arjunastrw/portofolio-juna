import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { CAMERA_FOV, FRAMING, type Station } from '../../stations';
import { buildRail, sampleRail } from './cameraPath';
import { scrollToU } from './scrollMap';
import type { StageState } from './state';

/** Parallax limits: a few degrees, never more. */
const MAX_YAW = MathUtils.degToRad(2);
const MAX_PITCH = MathUtils.degToRad(1);

/** Where the readable scene starts: the right edge of the text scrim, minus half its fade. */
function visibleStartPx(): number {
  const scrim = document.getElementById('stage-scrim');
  if (!scrim) return 0;
  const rect = scrim.getBoundingClientRect();
  return Math.max(0, rect.right - 0.07 * window.innerWidth);
}

/**
 * Places the camera on the rail every frame from the scrubbed scroll position.
 * The projection is shifted (view offset) so the subject sits in the middle of the area
 * right of the text column; stations pull back when that area is too narrow (16:10).
 */
export default function CameraRig({ state }: { state: StageState }) {
  const { camera, size, invalidate } = useThree();
  const cam = camera as PerspectiveCamera;
  const position = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const look = useRef({ yaw: 0, pitch: 0 });

  useLayoutEffect(() => {
    const start = visibleStartPx();
    const visibleWidth = Math.max(1, size.width - start);
    const halfV = MathUtils.degToRad(CAMERA_FOV / 2);
    const halfH = Math.atan(Math.tan(halfV) * (visibleWidth / size.height));
    const half = Math.min(halfV, halfH);
    const aspectFactor = size.width / size.height < FRAMING.narrowAspect.below ? FRAMING.narrowAspect.factor : 1;

    state.rail = buildRail((station: Station) => {
      const designed = new Vector3(...station.camera).distanceTo(new Vector3(...station.target));
      const required = (station.frameRadius * FRAMING.margin * aspectFactor) / Math.tan(half);
      return Math.max(1, required / designed);
    });

    cam.setViewOffset(size.width, size.height, -start / 2, 0, size.width, size.height);
    cam.updateProjectionMatrix();

    // Place the camera now, so even the very first frame is at the right station.
    sampleRail(state.rail, scrollToU(state.y, state.anchors, state.rail.stationU), position, target);
    cam.position.copy(position);
    cam.lookAt(target);
    invalidate();
  }, [cam, size.width, size.height, state, invalidate, position, target]);

  useFrame((_, rawDelta) => {
    const rail = state.rail;
    if (!rail) return;
    const u = scrollToU(state.y, state.anchors, rail.stationU);
    sampleRail(rail, u, position, target);
    cam.position.copy(position);
    cam.lookAt(target);

    const k = 1 - Math.exp(-Math.min(rawDelta, 1 / 30) * 5);
    const yawGoal = -state.pointer.x * MAX_YAW;
    const pitchGoal = state.pointer.y * MAX_PITCH;
    look.current.yaw += (yawGoal - look.current.yaw) * k;
    look.current.pitch += (pitchGoal - look.current.pitch) * k;
    cam.rotateY(look.current.yaw);
    cam.rotateX(look.current.pitch);

    if (Math.abs(yawGoal - look.current.yaw) > 1e-5 || Math.abs(pitchGoal - look.current.pitch) > 1e-5) {
      invalidate();
    }
  });

  return null;
}
