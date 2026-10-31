import type { MouseEvent } from 'react';
import portfolio from '../../data/portfolio';
import { STATIONS, type Station } from '../../stations';

const NAV_STATIONS = STATIONS.filter((s) => s.id !== 's0');

interface HeaderProps {
  activeIndex: number;
  onNavigate: (station: Station) => void;
}

export default function Header({ activeIndex, onNavigate }: HeaderProps) {
  const handle = (station: Station) => (e: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, etc.) behave natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(station);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="shell flex h-14 items-center justify-between gap-4">
        <a href="#top" onClick={handle(STATIONS[0])} className="flex min-h-11 items-center gap-3">
          <span className="font-serif text-[1.35rem] leading-none">{portfolio.name}</span>
          <span className="eyebrow hidden lg:inline">{portfolio.role}</span>
        </a>
        <nav aria-label="Sections">
          <ul className="flex items-center gap-3 sm:gap-6">
            {NAV_STATIONS.map((station) => {
              const current = STATIONS[activeIndex]?.id === station.id;
              return (
                <li key={station.id}>
                  <a
                    href={station.hash}
                    onClick={handle(station)}
                    aria-current={current ? 'location' : undefined}
                    className={`flex min-h-11 items-center font-mono text-[0.7rem] transition-colors duration-200 sm:text-xs ${
                      current ? 'text-accent' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {station.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
