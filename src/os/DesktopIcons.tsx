import { useRef, type MouseEvent } from 'react';
import { Icon } from './icons';
import { useDesktop } from './desktop';
import type { AppEntry, LinkEntry } from './Taskbar';

/**
 * Desktop shortcuts. On the desktop: click selects, double-click (or Enter, or a tap on a
 * touch screen) opens. In the stacked layout they are plain in-page / external links.
 */
export function DesktopIcons({ apps, links }: { apps: AppEntry[]; links: LinkEntry[] }) {
  const { mode, open } = useDesktop();
  const pointerType = useRef<string>('mouse');
  const desktop = mode === 'desktop';

  const rememberPointer = (e: { pointerType: string }) => {
    pointerType.current = e.pointerType;
  };

  /** True when a single click should open: keyboard activation (detail 0) or touch. */
  const opensOnClick = (e: MouseEvent) => e.detail === 0 || pointerType.current !== 'mouse';

  return (
    <nav aria-label="Desktop" className="os-desk-icons">
      <ul>
        {apps.map((app) => (
          <li key={app.id}>
            {desktop ? (
              <button
                type="button"
                className="os-desk-icon"
                onPointerDown={rememberPointer}
                onClick={(e) => opensOnClick(e) && open(app.id)}
                onDoubleClick={() => open(app.id)}
              >
                <Icon name={app.icon} scale={2} />
                <span className="os-desk-label">{app.label}</span>
              </button>
            ) : (
              <a href={`#${app.id}`} className="os-desk-icon">
                <Icon name={app.icon} scale={2} />
                <span className="os-desk-label">{app.label}</span>
              </a>
            )}
          </li>
        ))}
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="os-desk-icon"
              onPointerDown={rememberPointer}
              onClick={(e) => {
                // Desktop + mouse: a single click only selects, like the app icons.
                if (desktop && !opensOnClick(e) && !(e.metaKey || e.ctrlKey || e.shiftKey)) e.preventDefault();
              }}
              onDoubleClick={() => {
                if (desktop && pointerType.current === 'mouse') window.open(link.href, '_blank', 'noopener,noreferrer');
              }}
            >
              <Icon name={link.icon} scale={2} shortcut />
              <span className="os-desk-label">
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
