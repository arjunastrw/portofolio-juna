import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { CtrlGlyph } from './icons';
import { TASKBAR_H, cx, type Mode } from './desktop';
import { WIN_WIDTH, clampPos, type AppId, type WinState } from './windowManager';

interface WindowProps {
  id: AppId;
  title: string;
  icon: ReactNode;
  mode: Mode;
  state: WinState;
  active: boolean;
  /** Render the title as an <h2>. Off for the window that holds the page's <h1>. */
  titleIsHeading?: boolean;
  /** Decorative menu bar labels (first letter underlined). */
  menu?: string[];
  status?: ReactNode[];
  bodyClassName?: string;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMax: () => void;
  onRaise: () => void;
  onMove: (x: number, y: number) => void;
}

/**
 * A Win98 window. On the desktop it floats: drag it by the title bar, double-click the
 * title bar to maximise, Esc closes it. In the stacked layout it is a static panel and the
 * title-bar controls are decorative.
 */
export function Window({
  id,
  title,
  icon,
  mode,
  state,
  active,
  titleIsHeading = true,
  menu,
  status,
  bodyClassName,
  children,
  onClose,
  onMinimize,
  onToggleMax,
  onRaise,
  onMove,
}: WindowProps) {
  const desktop = mode === 'desktop';
  const ref = useRef<HTMLElement>(null);
  const titleId = `${id}-title`;
  const Title = titleIsHeading ? 'h2' : 'p';

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!desktop || state.maximized || e.button !== 0) return;
    if ((e.target as Element).closest('button')) return;
    e.preventDefault();
    const bar = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const { x: ox, y: oy } = state;
    bar.setPointerCapture(e.pointerId);
    ref.current?.classList.add('is-dragging');

    const move = (ev: globalThis.PointerEvent) => {
      const p = clampPos(id, ox + ev.clientX - startX, oy + ev.clientY - startY, window.innerWidth, window.innerHeight - TASKBAR_H);
      onMove(p.x, p.y);
    };
    const end = () => {
      ref.current?.classList.remove('is-dragging');
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', end);
      bar.removeEventListener('pointercancel', end);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (desktop && e.key === 'Escape' && !e.defaultPrevented) {
      e.stopPropagation();
      onClose();
    }
  };

  const style: CSSProperties | undefined = desktop
    ? state.maximized
      ? { zIndex: state.z }
      : {
          zIndex: state.z,
          transform: `translate(${state.x}px, ${state.y}px)`,
          width: `min(${WIN_WIDTH[id]}px, calc(100vw - 32px))`,
          maxHeight: `max(240px, calc(var(--desk-h) - ${state.capY}px - 12px))`,
        }
    : undefined;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={desktop && (!state.open || state.minimized)}
      className={cx('os-window', desktop && 'is-floating', desktop && state.maximized && 'is-max')}
      style={style}
      onPointerDownCapture={desktop ? onRaise : undefined}
      onFocusCapture={desktop ? onRaise : undefined}
      onKeyDown={onKeyDown}
    >
      <div
        className={cx('os-titlebar', desktop && !active && 'is-inactive', desktop && !state.maximized && 'is-draggable')}
        onPointerDown={startDrag}
        onDoubleClick={desktop ? (e) => !(e.target as Element).closest('button') && onToggleMax() : undefined}
      >
        <Title id={titleId} className="os-title-text">
          {icon}
          <span>{title}</span>
        </Title>
        {desktop ? (
          <span className="os-title-controls">
            <button type="button" className="os-ctrl" aria-label={`Minimise ${title}`} onClick={onMinimize}>
              <CtrlGlyph kind="min" />
            </button>
            <button
              type="button"
              className="os-ctrl"
              aria-label={state.maximized ? `Restore ${title}` : `Maximise ${title}`}
              onClick={onToggleMax}
            >
              <CtrlGlyph kind={state.maximized ? 'restore' : 'max'} />
            </button>
            <button type="button" className="os-ctrl os-ctrl-close" aria-label={`Close ${title}`} onClick={onClose}>
              <CtrlGlyph kind="close" />
            </button>
          </span>
        ) : (
          <span className="os-title-controls" aria-hidden="true">
            <span className="os-ctrl">
              <CtrlGlyph kind="min" />
            </span>
            <span className="os-ctrl">
              <CtrlGlyph kind="max" />
            </span>
            <span className="os-ctrl os-ctrl-close">
              <CtrlGlyph kind="close" />
            </span>
          </span>
        )}
      </div>

      {menu ? (
        <div className="os-menubar" aria-hidden="true">
          {menu.map((m) => (
            <span key={m}>
              <u>{m[0]}</u>
              {m.slice(1)}
            </span>
          ))}
        </div>
      ) : null}

      <div className={cx('os-window-body', bodyClassName)}>{children}</div>

      {status ? (
        <div className="os-statusbar">
          {status.map((s, i) => (
            <span key={i} className="os-status-cell">
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
