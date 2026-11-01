import type { ReactNode } from 'react';
import portfolio from '../data/portfolio';
import { Icon } from '../os/icons';
import { AppLink, useDesktop } from '../os/desktop';

/** Welcome window, styled as a setup wizard: who Juna is, at a glance, and where to go next. */
export default function About() {
  const { mode } = useDesktop();
  const current = portfolio.roles[0];
  const facts: { term: string; detail: ReactNode }[] = [
    { term: 'Now', detail: `${current.title}, ${current.company.toLowerCase()}, since ${current.start}` },
    { term: 'Based in', detail: `${portfolio.location.city}, ${portfolio.location.country}` },
    { term: 'Sectors', detail: 'Capital markets · Financial services' },
    { term: 'Works on', detail: 'Backend and frontend' },
    { term: 'Stack', detail: portfolio.headlineStack.join(' · ') },
  ];

  return (
    <>
      <div className="about-grid">
        <div className="about-art" aria-hidden="true">
          <span className="about-rev">{portfolio.revision}</span>
          <Icon name="computer" scale={7} className="about-glyph" />
          <div className="about-dither" />
        </div>

        <div className="about-copy">
          <p className="os-chrome about-eyebrow">Welcome to {portfolio.name}&rsquo;s portfolio</p>
          <h1 className="about-h1">
            {portfolio.name}
            <span className="sr-only">, </span>
            <span className="about-role">{portfolio.role}</span>
          </h1>
          <p className="about-lead">{portfolio.positioning}</p>

          <div className="os-field about-facts">
            <p className="os-chrome about-facts-head">System properties:</p>
            <dl>
              {facts.map((f) => (
                <div key={f.term}>
                  <dt className="os-chrome">{f.term}</dt>
                  <dd>{f.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <hr className="os-hr" />
      <div className="os-actions">
        {mode === 'desktop' ? (
          <p className="os-chrome about-tip">
            <Icon name="info" scale={1} />
            Double-click icons to open. Drag title bars to move.
          </p>
        ) : null}
        <button type="button" className="os-btn" disabled>
          &lt; Back
        </button>
        <AppLink to="experience" className="os-btn os-btn-default">
          Next &gt;
        </AppLink>
        <AppLink to="contact" className="os-btn">
          Contact
        </AppLink>
      </div>
    </>
  );
}
