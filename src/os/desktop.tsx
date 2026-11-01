import { createContext, useContext, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import type { AppId } from './windowManager';

/**
 * Two layouts share the same windows:
 * - `desktop`: a Win98 desktop. Icons open windows that can be dragged, minimised and maximised.
 * - `stack`: every window open, stacked in normal document flow (phones, small screens).
 *
 * `?mode=stack` or `?mode=desktop` forces a layout, for testing.
 */
export type Mode = 'desktop' | 'stack';

/** Height of the taskbar in px. Mirrored by `--taskbar-h` in the stylesheet. */
export const TASKBAR_H = 44;

/** Also used by the inline boot script in index.html (injected from vite.config.ts). */
export const DESKTOP_QUERY = '(min-width: 900px) and (min-height: 560px)';

function forcedMode(): Mode | null {
  const value = new URLSearchParams(window.location.search).get('mode');
  return value === 'desktop' || value === 'stack' ? value : null;
}

function getSnapshot(): Mode {
  return forcedMode() ?? (window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'stack');
}

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

export function useDesktopMode(): Mode {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'stack');
}

interface DesktopApi {
  mode: Mode;
  open: (id: AppId) => void;
}

export const DesktopContext = createContext<DesktopApi>({ mode: 'stack', open: () => {} });

export function useDesktop(): DesktopApi {
  return useContext(DesktopContext);
}

/**
 * Link to another window. On the desktop it opens (or raises) that window; in the stacked
 * layout it is a plain in-page anchor. Modified clicks keep their native behaviour.
 */
export function AppLink({
  to,
  onClick,
  ...rest
}: { to: AppId } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const { mode, open } = useDesktop();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (mode !== 'desktop' || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(to);
  };
  return <a href={`#${to}`} onClick={handle} {...rest} />;
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
