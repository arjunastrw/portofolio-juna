import { useRef, useState, type KeyboardEvent } from 'react';
import portfolio from '../data/portfolio';
import { Icon, type IconName } from '../os/icons';
import { cx } from '../os/desktop';

const LANGUAGES = new Set(['Go', 'TypeScript', 'Python', 'PHP', 'Dart']);
const DATABASES = new Set(['PostgreSQL', 'SQL Server']);

function toolIcon(tool: string): IconName {
  if (LANGUAGES.has(tool)) return 'notepad';
  if (DATABASES.has(tool)) return 'database';
  return 'program';
}

/** Toolkit as a Properties sheet: one tab per place the tools were used. No skill levels. */
export default function Toolkit() {
  const groups = portfolio.toolkit;
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = groups.length - 1;
    const next =
      e.key === 'ArrowRight' ? (tab === last ? 0 : tab + 1)
      : e.key === 'ArrowLeft' ? (tab === 0 ? last : tab - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setTab(next);
    tabs.current[next]?.focus();
  };

  return (
    <>
      <p className="win-lede">Grouped by where I have used each tool, not by self-rated skill level.</p>

      <div role="tablist" aria-label="Toolkit groups" className="os-tabs">
        {groups.map((g, i) => (
          <button
            key={g.label}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`toolkit-tab-${i}`}
            aria-selected={i === tab}
            aria-controls={`toolkit-panel-${i}`}
            tabIndex={i === tab ? 0 : -1}
            className={cx('os-tab', i === tab && 'is-active')}
            onClick={() => setTab(i)}
            onKeyDown={onKeyDown}
          >
            {g.label}
          </button>
        ))}
      </div>

      {groups.map((g, i) => (
        <div
          key={g.label}
          role="tabpanel"
          id={`toolkit-panel-${i}`}
          aria-labelledby={`toolkit-tab-${i}`}
          hidden={i !== tab}
          className="os-tab-panel"
        >
          <p className="os-chrome tool-note">{g.note}.</p>
          <ul className="os-field tool-grid">
            {g.tools.map((t) => (
              <li key={t}>
                <Icon name={toolIcon(t)} scale={2} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function toolkitStatus(): string[] {
  return [portfolio.toolkit.map((g) => `${g.label}: ${g.tools.length}`).join(' · '), 'No skill levels'];
}
