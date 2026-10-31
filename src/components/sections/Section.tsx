import type { ReactNode } from 'react';
import { useLayout } from '../../layout';

interface SectionProps {
  id: string;
  index: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}

/**
 * Shared section frame: hairline rule, index number in mono, serif title.
 * Inner layouts use container queries, so the same markup works as a narrow column over
 * the 3D stage and as a full-width stacked section.
 */
export default function Section({ id, index, title, lede, children }: SectionProps) {
  const layout = useLayout();
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={layout === 'stage' ? 'shell relative min-h-dvh pb-[20dvh]' : 'shell pt-24 pb-8 md:pt-36'}
    >
      <div className={layout === 'stage' ? 'stage-col @container' : '@container'}>
        <header className="grid gap-4 border-t border-rule pt-5 @3xl:grid-cols-12 @3xl:gap-8">
          <p className="eyebrow @3xl:col-span-3">§ {index}</p>
          <div className="@3xl:col-span-9">
            <h2
              id={headingId}
              tabIndex={-1}
              className="font-serif text-[2.5rem] leading-[1] tracking-[-0.01em] outline-none @3xl:text-[3.75rem]"
            >
              {title}
            </h2>
            {lede ? <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted">{lede}</p> : null}
          </div>
        </header>
        <div className="mt-12 @3xl:mt-16">{children}</div>
      </div>
    </section>
  );
}
