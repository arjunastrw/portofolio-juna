import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import portfolio from './data/portfolio';
import { DesktopContext, TASKBAR_H, cx, useDesktopMode } from './os/desktop';
import { DesktopIcons } from './os/DesktopIcons';
import { ShutdownScreen } from './os/ShutdownScreen';
import { Taskbar, type AppEntry, type LinkEntry } from './os/Taskbar';
import { Window } from './os/Window';
import { Icon } from './os/icons';
import { APP_IDS, appFromHash, initialState, wmReducer, type AppId } from './os/windowManager';
import About from './apps/About';
import Experience, { experienceStatus } from './apps/Experience';
import Projects, { projectsStatus } from './apps/Projects';
import Toolkit, { toolkitStatus } from './apps/Toolkit';
import Contact, { ContactStatus, type CopyState } from './apps/Contact';

type AppDef = AppEntry & { title: string; menu?: string[] };

const APPS: AppDef[] = [
  { id: 'about', label: 'About Me', icon: 'computer', title: 'Welcome' },
  { id: 'experience', label: 'Experience', icon: 'folder', title: 'Experience', menu: ['File', 'Edit', 'View', 'Help'] },
  { id: 'projects', label: 'Side Projects', icon: 'folder', title: 'Side Projects', menu: ['File', 'Edit', 'View', 'Help'] },
  { id: 'toolkit', label: 'Toolkit', icon: 'properties', title: 'Toolkit Properties' },
  { id: 'contact', label: 'Contact', icon: 'mail', title: 'Contact - New Message', menu: ['File', 'Edit', 'View', 'Insert', 'Help'] },
];

const LINKS: LinkEntry[] = [
  { label: 'GitHub', href: portfolio.contact.github, icon: 'globe' },
  { label: 'LinkedIn', href: portfolio.contact.linkedin, icon: 'globe' },
];

function replaceHash(hash: string) {
  if ((window.location.hash || '') === hash) return;
  try {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
  } catch {
    /* Safari throttles history updates; never let that break the page. */
  }
}

export default function App() {
  const mode = useDesktopMode();
  const desktop = mode === 'desktop';
  const [wm, dispatch] = useReducer(wmReducer, undefined, () => {
    // Prerender (no window): only the stacked layout is rendered, positions don't matter.
    if (typeof window === 'undefined') return initialState(1280, 800, ['about']);
    const target = appFromHash(window.location.hash);
    const openIds: AppId[] = target && target !== 'about' ? ['about', target] : ['about'];
    return initialState(window.innerWidth, window.innerHeight - TASKBAR_H, openIds);
  });
  const [shutdown, setShutdown] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const rootRef = useRef<HTMLDivElement>(null);

  const open = useCallback((id: AppId) => dispatch({ type: 'open', id }), []);
  const api = useMemo(() => ({ mode, open }), [mode, open]);

  // The inline script in index.html sets this before first paint; keep it in sync afterwards.
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  // Keyboard focus follows the window that was just opened, minimised or closed.
  useEffect(() => {
    if (!desktop || wm.focusTick === 0) return;
    const target = wm.active
      ? document.getElementById(wm.active)
      : document.querySelector<HTMLElement>('.os-desk-icon');
    target?.focus({ preventScroll: true });
    // Runs on focus requests only.
  }, [wm.focusTick]);

  // Desktop: the URL hash names the front window, so any window can be linked to.
  useEffect(() => {
    if (!desktop || shutdown) return;
    replaceHash(wm.active && wm.active !== 'about' ? `#${wm.active}` : '');
  }, [desktop, shutdown, wm.active]);

  useEffect(() => {
    const onHash = () => {
      const id = appFromHash(window.location.hash);
      if (id && desktop) open(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [desktop, open]);

  // Stack: content renders after load, so jump to a deep-linked window ourselves.
  useEffect(() => {
    if (desktop) return;
    const id = appFromHash(window.location.hash);
    if (id && id !== 'about') document.getElementById(id)?.scrollIntoView();
  }, [desktop]);

  // Keep title bars reachable when the viewport shrinks.
  useEffect(() => {
    if (!desktop) return;
    const clamp = () => dispatch({ type: 'clamp', width: window.innerWidth, height: window.innerHeight - TASKBAR_H });
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [desktop]);

  // The shut-down screen is modal: everything behind it is inert.
  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', shutdown);
  }, [shutdown]);

  const onTask = (id: AppId) => {
    const w = wm.wins[id];
    dispatch({ type: wm.active === id && !w.minimized ? 'minimize' : 'open', id });
  };

  const content: Record<AppId, { node: ReactNode; status: ReactNode[] }> = {
    about: {
      node: <About />,
      status: [`${portfolio.revision} · Updated ${portfolio.updated}`, 'Client names withheld under NDA'],
    },
    experience: { node: <Experience />, status: experienceStatus() },
    projects: { node: <Projects />, status: projectsStatus() },
    toolkit: { node: <Toolkit />, status: toolkitStatus() },
    contact: {
      node: <Contact onCopyState={setCopyState} />,
      status: [<ContactStatus key="copy" state={copyState} />, portfolio.contact.email],
    },
  };

  return (
    <DesktopContext.Provider value={api}>
      <a
        href="#about"
        className="os-skip"
        onClick={(e) => {
          if (!desktop) return;
          e.preventDefault();
          open('about');
        }}
      >
        Skip to content
      </a>

      <div ref={rootRef} className={cx('os-root', desktop ? 'is-desktop' : 'is-stack')}>
        <div className="os-desk">
          <DesktopIcons apps={APPS} links={LINKS} />
          <main id="main" className="os-windows">
            {APP_IDS.map((id) => {
              const app = APPS.find((a) => a.id === id) as AppDef;
              return (
                <Window
                  key={id}
                  id={id}
                  title={app.title}
                  icon={<Icon name={app.icon} scale={1} />}
                  mode={mode}
                  state={wm.wins[id]}
                  active={wm.active === id}
                  titleIsHeading={id !== 'about'}
                  menu={app.menu}
                  status={content[id].status}
                  onClose={() => dispatch({ type: 'close', id })}
                  onMinimize={() => dispatch({ type: 'minimize', id })}
                  onToggleMax={() => dispatch({ type: 'toggleMax', id })}
                  onRaise={() => dispatch({ type: 'raise', id })}
                  onMove={(x, y) => dispatch({ type: 'move', id, x, y })}
                >
                  {content[id].node}
                </Window>
              );
            })}
          </main>
          {desktop ? null : (
            <footer className="os-colophon">
              <p suppressHydrationWarning>
                &copy; {new Date().getFullYear()} {portfolio.name} · {portfolio.revision} · Updated {portfolio.updated}
              </p>
              <p>Client names withheld under NDA</p>
            </footer>
          )}
        </div>

        <Taskbar
          apps={APPS}
          links={LINKS}
          wins={wm.wins}
          active={wm.active}
          onTask={onTask}
          onShutDown={() => {
            dispatch({ type: 'closeAll' });
            setShutdown(true);
          }}
        />
      </div>

      {shutdown ? (
        <ShutdownScreen
          onRestart={() => {
            setShutdown(false);
            open('about');
          }}
        />
      ) : null}
    </DesktopContext.Provider>
  );
}
