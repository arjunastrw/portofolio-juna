import type { ReactNode } from 'react';
import portfolio from '../../data/portfolio';
import { useLayout } from '../../layout';
import WorkbenchFigure from '../three/WorkbenchFigure';

export default function Masthead() {
  const layout = useLayout();
  const current = portfolio.roles[0];
  const facts: { term: string; detail: ReactNode }[] = [
    {
      term: 'Now',
      detail: `${current.title}, ${current.company.toLowerCase()} · since ${current.start}`,
    },
    { term: 'Sectors', detail: 'Capital markets · Financial services' },
    { term: 'Works on', detail: 'Backend and frontend' },
    { term: 'Stack', detail: portfolio.headlineStack.join(' · ') },
  ];

  return (
    <div
      id="top"
      className={layout === 'stage' ? 'shell relative min-h-dvh pt-[calc(15dvh-3.5rem)] pb-[20dvh]' : 'shell pt-14 md:pt-20'}
    >
      <div className={layout === 'stage' ? 'stage-col @container' : '@container'}>
        <div className="eyebrow fade-in flex justify-between border-b border-rule pb-3">
          <span>Portfolio · {portfolio.revision}</span>
          <span>Updated {portfolio.updated}</span>
        </div>

        <div className="mt-12 grid gap-10 @3xl:mt-16 @3xl:grid-cols-12 @3xl:gap-8">
          <h1
            id="top-title"
            tabIndex={-1}
            className="fade-in font-serif text-[5.5rem] leading-[0.85] tracking-[-0.02em] outline-none @md:text-[8rem] @3xl:col-span-5 @3xl:text-[10.5rem]"
          >
            {portfolio.name}
            <span className="text-accent">.</span>
          </h1>

          <div className="fade-in @3xl:col-span-7 @3xl:pt-4" style={{ animationDelay: '60ms' }}>
            <p className="max-w-[30ch] font-serif text-[1.75rem] leading-[1.15] @3xl:text-[2.4rem]">
              {portfolio.positioning}
            </p>
            <dl className="mt-10 grid gap-y-3 border-t border-rule pt-5">
              {facts.map((fact) => (
                <div key={fact.term} className="grid grid-cols-[6.5rem_1fr] gap-4 text-sm">
                  <dt className="eyebrow">{fact.term}</dt>
                  <dd className="text-ink/90">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {layout === 'stack' ? (
        <div className="mt-16 md:mt-20">
          <WorkbenchFigure stillOnly />
        </div>
      ) : null}
    </div>
  );
}
