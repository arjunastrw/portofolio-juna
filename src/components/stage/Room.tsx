import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { DoubleSide, Object3D, Quaternion, Vector3, type Group } from 'three';
import { stageBus } from '../../navigation';
import type { StageState } from './state';
import type { V3 } from '../../stations';

/*
 * PHASE 1 PLACEHOLDERS. Proportions and positions follow docs/ASSET-SPEC.md, but the
 * shapes and materials are deliberately rough; Phase 2 replaces them with asset slots.
 */

const DESK_Y = 0.74;
const WALL_Z = -0.42;

const mat = {
  wall: { color: '#1b1916', roughness: 0.95 },
  floor: { color: '#12100e', roughness: 1 },
  desk: { color: '#2e2924', roughness: 0.7 },
  steel: { color: '#1c1a18', roughness: 0.45, metalness: 0.6 },
  board: { color: '#4a4136', roughness: 0.85 },
  box: { color: '#6f6657', roughness: 0.85 },
  paper: { color: '#cfc7b8', roughness: 0.9 },
} as const;

function Desk() {
  const legs: V3[] = [
    [-0.76, DESK_Y / 2, -0.33],
    [0.76, DESK_Y / 2, -0.33],
    [-0.76, DESK_Y / 2, 0.33],
    [0.76, DESK_Y / 2, 0.33],
  ];
  return (
    <group>
      <RoundedBox args={[1.6, 0.03, 0.75]} radius={0.006} smoothness={3} position={[0, DESK_Y - 0.015, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...mat.desk} />
      </RoundedBox>
      {legs.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.03, DESK_Y - 0.03, 0.03]} />
          <meshStandardMaterial {...mat.steel} />
        </mesh>
      ))}
    </group>
  );
}

const LAMP = {
  clamp: [-0.2, DESK_Y, -0.36] as V3,
  elbow: [-0.16, 1.3, -0.3] as V3,
  head: [0.0, 1.58, 0.02] as V3,
  aim: [0.05, DESK_Y, 0.05] as V3,
};

function Segment({ from, to, radius }: { from: V3; to: V3; radius: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: dir.length() };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial {...mat.steel} />
    </mesh>
  );
}

/** The single light source of the scene: a clamp-mounted desk lamp. */
function Lamp() {
  const target = useMemo(() => new Object3D(), []);
  const shade = useMemo(() => {
    const head = new Vector3(...LAMP.head);
    const toAim = new Vector3(...LAMP.aim).sub(head).normalize();
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), toAim.clone().negate());
    return { position: head.clone().add(toAim.multiplyScalar(0.06)), quaternion: q };
  }, []);

  return (
    <group>
      <mesh position={[LAMP.clamp[0], DESK_Y + 0.02, LAMP.clamp[2]]} castShadow>
        <boxGeometry args={[0.05, 0.04, 0.06]} />
        <meshStandardMaterial {...mat.steel} />
      </mesh>
      <Segment from={LAMP.clamp} to={LAMP.elbow} radius={0.007} />
      <Segment from={LAMP.elbow} to={LAMP.head} radius={0.007} />
      <group position={shade.position} quaternion={shade.quaternion}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.08, 0.14, 32, 1, true]} />
          <meshStandardMaterial {...mat.steel} side={DoubleSide} />
        </mesh>
      </group>
      <primitive object={target} position={LAMP.aim} />
      <spotLight
        position={LAMP.head}
        target={target}
        color="#f2b56b"
        intensity={7}
        angle={1.0}
        penumbra={0.7}
        distance={4}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </group>
  );
}

/** S1: monitor on a stand. */
function Monitor() {
  return (
    <group position={[0.05, DESK_Y, -0.24]}>
      <RoundedBox args={[0.22, 0.012, 0.16]} radius={0.004} smoothness={2} position={[0, 0.006, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial {...mat.steel} />
      </RoundedBox>
      <mesh position={[0, 0.12, -0.02]} castShadow>
        <boxGeometry args={[0.04, 0.24, 0.02]} />
        <meshStandardMaterial {...mat.steel} />
      </mesh>
      <RoundedBox args={[0.62, 0.37, 0.025]} radius={0.006} smoothness={2} position={[0, 0.29, -0.01]} castShadow>
        <meshStandardMaterial {...mat.steel} />
      </RoundedBox>
      <mesh position={[0, 0.29, 0.0035]}>
        <planeGeometry args={[0.6, 0.34]} />
        <meshStandardMaterial color="#0d0c0b" emissive="#2a2620" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

const BOX_HEIGHTS = [0.15, 0.135, 0.145, 0.125, 0.14];

/** S2: wall shelf with five archive boxes, one per side project. */
function Shelf({ state }: { state: StageState }) {
  const { gl, invalidate } = useThree();
  const boxes = useRef<(Group | null)[]>([]);

  useEffect(() => {
    stageBus.shelfFocus = (index) => {
      state.shelfFocus = index;
      invalidate();
    };
    return () => {
      stageBus.shelfFocus = null;
    };
  }, [state, invalidate]);

  useFrame((_, delta) => {
    let moving = false;
    const k = 1 - Math.exp(-Math.min(delta, 1 / 30) * 10);
    boxes.current.forEach((box, i) => {
      if (!box) return;
      const goal = state.shelfFocus === i ? 0.02 : 0;
      const next = box.position.z + (goal - box.position.z) * k;
      if (Math.abs(goal - next) > 1e-4) moving = true;
      box.position.z = Math.abs(goal - next) > 1e-4 ? next : goal;
    });
    if (moving) {
      // Shadows are rendered once and only refreshed while a box moves.
      gl.shadowMap.needsUpdate = true;
      invalidate();
    }
  });

  return (
    <group position={[0.63, 1.11, -0.34]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.16]} />
        <meshStandardMaterial {...mat.board} />
      </mesh>
      {BOX_HEIGHTS.map((h, i) => (
        <group key={i} ref={(el) => (boxes.current[i] = el)} position={[-0.17 + i * 0.085, 0.01 + h / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.075, h, 0.12]} />
            <meshStandardMaterial {...mat.box} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** S3: pegboard on the wall with a few hand tools. */
function Pegboard() {
  return (
    <group position={[-0.52, 1.1, WALL_Z + 0.008]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.5, 0.4, 0.012]} />
        <meshStandardMaterial {...mat.board} />
      </mesh>
      <mesh position={[-0.15, 0.02, 0.015]} castShadow>
        <boxGeometry args={[0.03, 0.3, 0.004]} />
        <meshStandardMaterial {...mat.paper} />
      </mesh>
      <mesh position={[-0.05, 0.04, 0.02]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.2, 12]} />
        <meshStandardMaterial {...mat.steel} />
      </mesh>
      <mesh position={[0.08, 0.06, 0.025]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.045, 0.018, 12, 32]} />
        <meshStandardMaterial {...mat.box} />
      </mesh>
      <mesh position={[0.17, -0.02, 0.018]} castShadow>
        <boxGeometry args={[0.04, 0.18, 0.012]} />
        <meshStandardMaterial {...mat.steel} />
      </mesh>
    </group>
  );
}

/** S4: open notebook, pen and phone at the front of the desk. */
function ContactSet() {
  return (
    <group>
      <group position={[0.42, DESK_Y, 0.14]} rotation={[0, -0.25, 0]}>
        <RoundedBox args={[0.296, 0.008, 0.21]} radius={0.002} smoothness={2} position={[0, 0.004, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...mat.paper} />
        </RoundedBox>
        <mesh position={[0.02, 0.012, 0.03]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.0045, 0.0045, 0.14, 10]} />
          <meshStandardMaterial {...mat.steel} />
        </mesh>
      </group>
      <RoundedBox args={[0.072, 0.008, 0.147]} radius={0.003} smoothness={2} position={[0.64, DESK_Y + 0.004, 0.1]} rotation={[0, 0.3, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...mat.steel} />
      </RoundedBox>
    </group>
  );
}

export default function Room({ state }: { state: StageState }) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    // Static scene: render the shadow map once after mount.
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [gl, invalidate]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial {...mat.floor} />
      </mesh>
      <mesh position={[0, 1.5, WALL_Z]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial {...mat.wall} />
      </mesh>
      <Desk />
      <Lamp />
      <Monitor />
      <Shelf state={state} />
      <Pegboard />
      <ContactSet />
    </group>
  );
}
