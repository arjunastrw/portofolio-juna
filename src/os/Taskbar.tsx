import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import portfolio from '../data/portfolio';
import { Icon, type IconName } from './icons';
import { cx, useDesktop } from './desktop';
import type { AppId, WinState } from './windowManager';

export interface AppEntry {
  id: AppId;
  /** Label on the desktop, in the Start menu and on the taskbar. */
  label: string;
  icon: IconName;
}

export interface LinkEntry {
  label: string;
  href: string;
  icon: IconName;
}

interface TaskbarProps {
  apps: AppEntry[];
  links: LinkEntry[];
  wins: Record<AppId, WinState>;
  active: AppId | null;
  onTask: (id: AppId) => void;
  onShutDown: () => void;
}

/** Current time, or null until mounted (the prerendered HTML must not contain a build-time clock). */
function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    // Align to the minute, then tick every minute.
    const first = window.setTimeout(
      () => {
        tick();
        interval = window.setInterval(tick, 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    let interval: number | undefined;
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);
  return now;
}

function ItemContent({ icon, label }: { icon: IconName; label: ReactNode }) {
  return (
    <>
      <Icon name={icon} scale={2} />
      <span>{label}</span>
    </>
  );
}

function StartMenu({
  apps,
  links,
  onClose,
  onShutDown,
}: {
  apps: AppEntry[];
  links: LinkEntry[];
  onClose: (refocus: boolean) => void;
  onShutDown: () => void;
}) {
  const { mode, open } = useDesktop();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[next]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    } else if (e.key === 'Tab') {
      onClose(false);
    }
  };

  const itemProps = { className: 'os-start-item', role: 'menuitem', tabIndex: -1 } as const;

  return (
    <div ref={ref} id="start-menu" role="menu" aria-label="Start" className="os-start-menu" onKeyDown={onKeyDown}>
      <div className="os-start-banner" aria-hidden="true">
        <span>
          <b>{portfolio.name}</b> {portfolio.revision}
        </span>
      </div>
      <div className="os-start-items">
        {apps.map((app) =>
          mode === 'desktop' ? (
            <button
              key={app.id}
              type="button"
              {...itemProps}
              onClick={() => {
                onClose(false);
                open(app.id);
              }}
            >
              <ItemContent icon={app.icon} label={app.label} />
            </button>
          ) : (
            <a key={app.id} href={`#${app.id}`} {...itemProps} onClick={() => onClose(false)}>
              <ItemContent icon={app.icon} label={app.label} />
            </a>
          ),
        )}
        <div role="separator" className="os-start-sep" />
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" {...itemProps} onClick={() => onClose(false)}>
            <ItemContent
              icon={link.icon}
              label={
                <>
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </>
              }
            />
          </a>
        ))}
        <div role="separator" className="os-start-sep" />
        <button
          type="button"
          {...itemProps}
          onClick={() => {
            onClose(false);
            onShutDown();
          }}
        >
          <ItemContent icon="computer" label="Shut Down…" />
        </button>
      </div>
    </div>
  );
}

export function Taskbar({ apps, links, wins, active, onTask, onShutDown }: TaskbarProps) {
  const { mode } = useDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const startRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const now = useClock();

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  const closeMenu = (refocus: boolean) => {
    setMenuOpen(false);
    if (refocus) startRef.current?.focus();
  };

  const tasks = mode === 'desktop' ? apps.filter((a) => wins[a.id].open) : [];
  const time = now ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(now) : '';
  const date = now ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(now) : undefined;

  return (
    <nav aria-label="Taskbar" className="os-taskbar">
      <div ref={wrapRef} className="os-start-wrap">
        <button
          ref={startRef}
          type="button"
          className={cx('os-btn', 'os-start-btn', menuOpen && 'is-pressed')}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'start-menu' : undefined}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name="computer" scale={1} />
          <span className="os-start-label">Start</span>
        </button>
        {menuOpen ? <StartMenu apps={apps} links={links} onClose={closeMenu} onShutDown={onShutDown} /> : null}
      </div>

      <span className="os-task-sep" aria-hidden="true" />

      <ul className="os-tasks" aria-label="Open windows">
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={cx('os-task', active === t.id && 'is-active')}
              aria-pressed={active === t.id}
              onClick={() => onTask(t.id)}
            >
              <Icon name={t.icon} scale={1} />
              <span>{t.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="os-tray">
        <time className="os-clock" dateTime={now?.toISOString()} title={date}>
          {time}
        </time>
      </div>
    </nav>
  );
}
