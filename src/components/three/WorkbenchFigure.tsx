import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMediaQuery, useReducedMotion } from '../../hooks/useMediaQuery';
import type { PointerRef } from './Workbench';

const Workbench = lazy(() => import('./Workbench'));

const POSTER = `${import.meta.env.BASE_URL}workbench.webp`;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function prefersSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[workbench] 3D scene failed, showing still image instead.', error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fig. 01. The still image is always rendered first, so content never waits on WebGL.
 * The live scene replaces it on capable desktop browsers once its first frame is drawn.
 */
/** `stillOnly`: never load the live scene (stacked layout; the page-level 3D stage replaces it). */
export default function WorkbenchFigure({ stillOnly = false }: { stillOnly?: boolean }) {
  const small = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useReducedMotion();
  const [capable] = useState(() => supportsWebGL() && !prefersSaveData());
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const [inView, setInView] = useState(true);

  const live = !stillOnly && capable && !small && !failed;
  const parallax = live && !reducedMotion;

  const frameRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerRef>({ x: 0, y: 0 });
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!parallax || !inView) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      invalidateRef.current?.();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [parallax, inView]);

  const caption = live
    ? parallax
      ? 'Rendered live in your browser. Move the pointer to shift the view.'
      : 'Rendered live in your browser.'
    : 'Still frame of the live 3D scene.';

  return (
    <figure className="fade-in" style={{ animationDelay: '120ms' }}>
      <div
        ref={frameRef}
        role="img"
        aria-label="A dark desk, lit by a single warm desk lamp, holding an open laptop showing code, a closed notebook with a pencil, a mug and a stack of books."
        className="relative aspect-[4/3] w-full overflow-hidden border border-rule bg-raised md:aspect-[16/7]"
      >
        {posterOk ? (
          <img
            src={POSTER}
            alt=""
            width={1600}
            height={699}
            decoding="async"
            onError={() => setPosterOk(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {live ? (
          <div
            className={`absolute inset-0 ${reducedMotion ? '' : 'transition-opacity duration-700'} ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            <SceneBoundary onError={() => setFailed(true)}>
              <Suspense fallback={null}>
                <Workbench
                  pointer={pointer}
                  parallax={parallax}
                  invalidateRef={invalidateRef}
                  onReady={() => setReady(true)}
                />
              </Suspense>
            </SceneBoundary>
          </div>
        ) : null}
      </div>
      <figcaption className="eyebrow mt-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
        <span>
          <span className="text-ink">Fig. 01</span> Workbench
        </span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
