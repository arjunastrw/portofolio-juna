import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CAMERA_FOV } from '../../stations';
import { stageBus } from '../../navigation';
import CameraRig from './CameraRig';
import Room from './Room';
import { computeAnchors } from './scrollMap';
import { createStageState, type StageState } from './state';

gsap.registerPlugin(ScrollTrigger);

const PAPER = '#0f0e0c';
/** Seconds the camera lags behind the scrollbar. Damped, no overshoot. */
const SCRUB_SECONDS = 0.9;

/**
 * Drives `state.y` from native scroll through a scrubbed ScrollTrigger tween.
 * The tween maps progress 0..1 to scroll px 0..max; the rail mapping happens per frame.
 */
function useScrollDriver(state: StageState, invalidate: MutableRefObject<(() => void) | null>) {
  useEffect(() => {
    let snapAfterRefresh: (() => void) | null = null;
    const proxy = { y: window.scrollY };
    state.y = window.scrollY;
    state.anchors = computeAnchors();

    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        proxy,
        { y: 0 },
        {
          y: () => ScrollTrigger.maxScroll(window),
          ease: 'none',
          immediateRender: false,
          onUpdate: () => {
            state.y = proxy.y;
            invalidate.current?.();
          },
          scrollTrigger: {
            start: 0,
            end: 'max',
            scrub: SCRUB_SECONDS,
            invalidateOnRefresh: true,
            onRefresh: () => {
              state.anchors = computeAnchors();
              invalidate.current?.();
            },
          },
        },
      );

      const syncNow = () => {
        ScrollTrigger.update();
        const trigger = tween.scrollTrigger;
        if (trigger) {
          trigger.getTween()?.progress(1);
          tween.progress(trigger.progress);
        }
        proxy.y = window.scrollY;
        state.y = window.scrollY;
        invalidate.current?.();
      };

      // Start where the reader already is (e.g. /#contact): no sweep from the masthead.
      syncNow();
      stageBus.controller = { syncNow };

      // A refresh (resize, fonts, layout switch) changes max scroll, which would otherwise make
      // the scrub animate the camera between the old and new mapping. Snap instead.
      snapAfterRefresh = syncNow;
      ScrollTrigger.addEventListener('refresh', snapAfterRefresh);
    });

    // Web fonts change section heights after first layout.
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      if (snapAfterRefresh) ScrollTrigger.removeEventListener('refresh', snapAfterRefresh);
      stageBus.controller = null;
      ctx.revert();
    };
  }, [state, invalidate]);
}

/** `onFail` is part of the lazy-loading contract (see App); the stage itself reports errors by throwing. */
export default function Stage(_props: { onFail: () => void }) {
  // Seed from the current scroll position before the canvas mounts, so the first frame
  // is already at the reader's station (e.g. after loading /#contact).
  const state = useMemo(() => {
    const initial = createStageState();
    initial.y = window.scrollY;
    initial.anchors = computeAnchors();
    return initial;
  }, []);
  const invalidateRef = useRef<(() => void) | null>(null);
  useScrollDriver(state, invalidateRef);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      invalidateRef.current?.();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [state]);

  return (
    <Canvas
      frameloop="demand"
      shadows="soft"
      dpr={[1, 1.5]}
      camera={{ fov: CAMERA_FOV, near: 0.05, far: 20, position: [1.15, 1.42, 1.95] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={(s) => {
        s.gl.shadowMap.autoUpdate = false;
        invalidateRef.current = s.invalidate;
        if (import.meta.env.DEV) {
          // Dev-only handle for framing checks and profiling; stripped from production builds.
          (window as unknown as { __stage?: unknown }).__stage = { state, three: s };
        }
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[PAPER]} />
      <fog attach="fog" args={[PAPER, 3.5, 9]} />
      <hemisphereLight args={['#d8d0c3', PAPER, 0.12]} />
      <Room state={state} />
      <CameraRig state={state} />
    </Canvas>
  );
}
