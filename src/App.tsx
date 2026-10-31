import { Component, lazy, type ComponentType, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Header from './components/sections/Header';
import Masthead from './components/sections/Masthead';
import Experience from './components/sections/Experience';
import SideProjects from './components/sections/SideProjects';
import Toolkit from './components/sections/Toolkit';
import Contact from './components/sections/Contact';
import Colophon from './components/sections/Colophon';
import { LayoutContext, type Layout } from './layout';
import { useStageCapable } from './hooks/useStageMode';
import { useHashSync } from './hooks/useHashSync';
import { stageBus } from './navigation';

interface StageProps {
  onFail: () => void;
}

/** Rendered instead of the stage when its chunk cannot be loaded: report once, render nothing. */
function StageUnavailable({ onFail }: StageProps) {
  useEffect(() => onFail(), [onFail]);
  return null;
}

// A failed chunk download is handled here rather than thrown, so it never reaches the console as an error.
const Stage = lazy<ComponentType<StageProps>>(() =>
  import('./components/stage/Stage').catch((error: unknown) => {
    if (import.meta.env.DEV) console.info('[stage] 3D chunk failed to load; using the stacked layout.', error);
    return { default: StageUnavailable };
  }),
);

class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.info('[stage] 3D stage failed; using the stacked layout.', error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Sticky full-viewport layer behind the content: the canvas plus the text scrim. */
function StageLayer({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    stageBus.layer = ref.current;
    return () => {
      stageBus.layer = null;
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none sticky top-0 -mb-[100dvh] h-dvh overflow-hidden">
      <StageBoundary onError={onFail}>
        <Suspense fallback={null}>
          <Stage onFail={onFail} />
        </Suspense>
      </StageBoundary>
      <div id="stage-scrim" className="stage-scrim absolute inset-y-0 left-0" />
    </div>
  );
}

/** Empty scroll distance between stations; the camera travels while it passes. */
function Transit() {
  return <div aria-hidden="true" className="h-[40dvh]" />;
}

export default function App() {
  const capable = useStageCapable();
  const [failed, setFailed] = useState(false);
  const layout: Layout = capable && !failed ? 'stage' : 'stack';
  const { activeIndex, go } = useHashSync(layout);
  const stage = layout === 'stage';

  const header = <Header activeIndex={activeIndex} onNavigate={go} />;
  const main = (
    <main id="main" tabIndex={-1} className="relative z-10 outline-none">
      <Masthead />
      {stage ? <Transit /> : null}
      <Experience />
      {stage ? <Transit /> : null}
      <SideProjects />
      {stage ? <Transit /> : null}
      <Toolkit />
      {stage ? <Transit /> : null}
      <Contact />
    </main>
  );

  return (
    <LayoutContext.Provider value={layout}>
      <a
        href="#main"
        className="sr-only z-[70] bg-ink font-mono text-xs text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      {stage ? (
        <div className="relative">
          <StageLayer onFail={() => setFailed(true)} />
          {header}
          {main}
        </div>
      ) : (
        <>
          {header}
          {main}
        </>
      )}
      <Colophon />
    </LayoutContext.Provider>
  );
}
