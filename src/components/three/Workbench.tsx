import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import { BackSide, DoubleSide, LatheGeometry, Object3D, Quaternion, Vector2, Vector3 } from 'three';

/*
 * Fig. 01: a still-life desk. Deliberately static: no floating props, no particles,
 * no free orbit. The only colour accent is the warm light of the desk lamp.
 * Rendered on demand: a frame is drawn only when the camera is still easing.
 */

const PAPER = '#0f0e0c';
const ACCENT_LIGHT = '#f0b469';

const DESK_TOP_Y = 0.775;
const CAMERA_BASE = new Vector3(3.2, 2.05, 3.75);
const LOOK_AT = new Vector3(0.05, 0.5, 0);

type V3 = [number, number, number];

export interface PointerRef {
  x: number;
  y: number;
}

interface WorkbenchProps {
  pointer: MutableRefObject<PointerRef>;
  parallax: boolean;
  invalidateRef: MutableRefObject<(() => void) | null>;
  onReady: () => void;
}

const materials = {
  deskTop: { color: '#2c2823', roughness: 0.72, metalness: 0.05 },
  steel: { color: '#1b1917', roughness: 0.45, metalness: 0.6 },
  aluminium: { color: '#8f8a82', roughness: 0.38, metalness: 0.55 },
  ceramic: { color: '#cec7ba', roughness: 0.5, metalness: 0 },
  paper: { color: '#d6cebf', roughness: 0.9, metalness: 0 },
} as const;

/** A cylinder spanning two points, used for the lamp arms. */
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
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial {...materials.steel} />
    </mesh>
  );
}

function Desk() {
  const legs: V3[] = [
    [-1.2, 0.365, -0.54],
    [1.2, 0.365, -0.54],
    [-1.2, 0.365, 0.54],
    [1.2, 0.365, 0.54],
  ];
  return (
    <group>
      <RoundedBox args={[2.6, 0.045, 1.25]} radius={0.01} smoothness={3} position={[0, DESK_TOP_Y - 0.0225, 0]} receiveShadow castShadow>
        <meshStandardMaterial {...materials.deskTop} />
      </RoundedBox>
      {legs.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.04, 0.73, 0.04]} />
          <meshStandardMaterial {...materials.steel} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, -0.54]}>
        <boxGeometry args={[2.4, 0.03, 0.02]} />
        <meshStandardMaterial {...materials.steel} />
      </mesh>
    </group>
  );
}

/** Deterministic "code" lines for the laptop screen. */
const SCREEN_LINES: { indent: number; width: number; tone: number }[] = [
  [0, 0.22, 0], [1, 0.3, 1], [1, 0.18, 1], [2, 0.26, 2], [2, 0.12, 2], [1, 0.08, 1],
  [0, 0.0, 0], [0, 0.28, 0], [1, 0.34, 1], [2, 0.2, 2], [2, 0.24, 1], [1, 0.1, 1], [0, 0.06, 0],
].map(([indent, width, tone]) => ({ indent, width, tone }));
const LINE_TONES = ['#a39b8e', '#6f685e', '#4f4a43'];

function Laptop() {
  const openAngle = -1.86;
  return (
    <group position={[0.12, DESK_TOP_Y, 0.02]} rotation={[0, 0.22, 0]}>
      <RoundedBox args={[0.6, 0.016, 0.42]} radius={0.006} smoothness={3} position={[0, 0.008, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...materials.aluminium} />
      </RoundedBox>
      {/* keyboard well */}
      <mesh position={[0, 0.0165, -0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.52, 0.2]} />
        <meshStandardMaterial color="#26231f" roughness={0.8} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group position={[0, 0.016, -0.21]} rotation={[openAngle, 0, 0]}>
        <RoundedBox args={[0.6, 0.01, 0.41]} radius={0.004} smoothness={3} position={[0, 0, 0.205]} castShadow>
          <meshStandardMaterial {...materials.aluminium} />
        </RoundedBox>
        <mesh position={[0, -0.0055, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 0.36]} />
          <meshStandardMaterial color="#0c0b0a" emissive="#1a1814" roughness={0.25} />
        </mesh>
        {SCREEN_LINES.map((line, i) =>
          line.width === 0 ? null : (
            <mesh
              key={i}
              position={[-0.23 + line.indent * 0.025 + line.width / 2, -0.006, 0.055 + i * 0.022]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[line.width, 0.007]} />
              <meshBasicMaterial color={LINE_TONES[line.tone]} />
            </mesh>
          ),
        )}
      </group>
    </group>
  );
}

function Mug() {
  const geometry = useMemo(() => {
    const profile = [
      [0, 0], [0.045, 0], [0.05, 0.008], [0.05, 0.105], [0.045, 0.105], [0.045, 0.012], [0, 0.012],
    ].map(([x, y]) => new Vector2(x, y));
    return new LatheGeometry(profile, 48);
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={[0.78, DESK_TOP_Y, 0.26]} rotation={[0, -0.6, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...materials.ceramic} side={DoubleSide} />
      </mesh>
      <mesh position={[0.05, 0.056, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.028, 0.007, 12, 24, Math.PI]} />
        <meshStandardMaterial {...materials.ceramic} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 32]} />
        <meshStandardMaterial color="#1d140e" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Notebook() {
  return (
    <group position={[-0.42, DESK_TOP_Y, 0.36]} rotation={[0, -0.28, 0]}>
      <RoundedBox args={[0.21, 0.016, 0.29]} radius={0.004} smoothness={2} position={[0, 0.008, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a332b" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0.075, 0.0165, 0]}>
        <boxGeometry args={[0.008, 0.002, 0.292]} />
        <meshStandardMaterial {...materials.steel} />
      </mesh>
      {/* pencil */}
      <mesh position={[-0.01, 0.022, 0.01]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.0045, 0.0045, 0.17, 6]} />
        <meshStandardMaterial color="#d9ccb2" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Books() {
  const books: { y: number; rot: number; color: string; size: V3 }[] = [
    { y: 0.018, rot: 0.06, color: '#4a443c', size: [0.24, 0.036, 0.33] },
    { y: 0.051, rot: -0.1, color: '#2f2b26', size: [0.22, 0.03, 0.3] },
    { y: 0.08, rot: 0.14, color: '#6a6257', size: [0.2, 0.028, 0.27] },
  ];
  return (
    <group position={[1.0, DESK_TOP_Y, -0.3]} rotation={[0, -0.3, 0]}>
      {books.map((b, i) => (
        <group key={i} position={[0, b.y, 0]} rotation={[0, b.rot, 0]}>
          <RoundedBox args={b.size} radius={0.003} smoothness={2} castShadow receiveShadow>
            <meshStandardMaterial color={b.color} roughness={0.8} />
          </RoundedBox>
          <mesh position={[0.006, 0, 0]}>
            <boxGeometry args={[b.size[0] - 0.008, b.size[1] - 0.008, b.size[2] - 0.004]} />
            <meshStandardMaterial {...materials.paper} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const LAMP = {
  base: [-0.98, DESK_TOP_Y + 0.02, -0.38] as V3,
  elbow: [-0.9, 1.28, -0.5] as V3,
  head: [-0.6, 1.4, -0.22] as V3,
  target: [-0.4, DESK_TOP_Y, 0.3] as V3,
};

function Lamp() {
  const { base, elbow, head, target } = LAMP;
  const targetObject = useMemo(() => new Object3D(), []);
  const shade = useMemo(() => {
    const h = new Vector3(...head);
    const towardTarget = new Vector3(...target).sub(h).normalize();
    // Cylinder +Y points away from the target, so the wide (bottom) end opens toward it.
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), towardTarget.clone().negate());
    return { position: h.clone().add(towardTarget.multiplyScalar(0.05)), quaternion: q };
  }, [head, target]);

  return (
    <group>
      <mesh position={[base[0], DESK_TOP_Y + 0.01, base[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.09, 0.02, 40]} />
        <meshStandardMaterial {...materials.steel} />
      </mesh>
      <Segment from={base} to={elbow} radius={0.008} />
      <Segment from={elbow} to={head} radius={0.008} />
      <mesh position={elbow}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial {...materials.steel} />
      </mesh>

      <group position={shade.position} quaternion={shade.quaternion}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.085, 0.15, 40, 1, true]} />
          <meshStandardMaterial {...materials.steel} side={DoubleSide} />
        </mesh>
        {/* lit inner face of the shade */}
        <mesh scale={0.985}>
          <cylinderGeometry args={[0.035, 0.085, 0.15, 40, 1, true]} />
          <meshStandardMaterial color="#3a2a17" emissive={ACCENT_LIGHT} emissiveIntensity={0.55} side={BackSide} />
        </mesh>
        <mesh position={[0, 0.075, 0]}>
          <circleGeometry args={[0.035, 32]} />
          <meshStandardMaterial {...materials.steel} side={DoubleSide} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.024, 20, 20]} />
          <meshBasicMaterial color="#fff1d6" />
        </mesh>
      </group>

      <primitive object={targetObject} position={target} />
      <spotLight
        position={head}
        target={targetObject}
        color={ACCENT_LIGHT}
        intensity={9}
        angle={0.62}
        penumbra={0.9}
        distance={5}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={head} color={ACCENT_LIGHT} intensity={0.25} distance={1.2} decay={2} />
    </group>
  );
}

function CameraRig({ pointer, parallax }: Pick<WorkbenchProps, 'pointer' | 'parallax'>) {
  const { camera, invalidate } = useThree();
  const goal = useMemo(() => new Vector3(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const px = parallax ? pointer.current.x : 0;
    const py = parallax ? pointer.current.y : 0;
    goal.set(CAMERA_BASE.x + px * 0.55, CAMERA_BASE.y + py * 0.22, CAMERA_BASE.z - px * 0.35);
    camera.position.lerp(goal, 1 - Math.exp(-delta * 3.5));
    camera.lookAt(LOOK_AT);
    if (camera.position.distanceToSquared(goal) > 1e-6) invalidate();
  });
  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

export default function Workbench({ pointer, parallax, invalidateRef, onReady }: WorkbenchProps) {
  return (
    <Canvas
      frameloop="demand"
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ position: CAMERA_BASE.toArray() as V3, fov: 29, near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        state.camera.lookAt(LOOK_AT);
        invalidateRef.current = state.invalidate;
      }}
      aria-hidden="true"
    >
      <color attach="background" args={[PAPER]} />
      <fog attach="fog" args={[PAPER, 4.5, 9]} />

      <hemisphereLight args={['#d8d0c3', PAPER, 0.6]} />
      <directionalLight position={[-3, 5, 3]} intensity={0.8} color="#e6dfd3" />
      <directionalLight position={[3, 2.5, -4]} intensity={0.35} color="#cfc8bb" />

      <ContactShadows position={[0, 0.002, 0]} scale={6} blur={2.2} opacity={0.85} far={1} resolution={512} frames={1} color="#000000" />

      <Desk />
      <Laptop />
      <Mug />
      <Notebook />
      <Books />
      <Lamp />

      <CameraRig pointer={pointer} parallax={parallax} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
