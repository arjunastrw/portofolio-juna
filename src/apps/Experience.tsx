import portfolio, { type Status } from '../data/portfolio';
import { Icon } from '../os/icons';
import { cx } from '../os/desktop';

const STATUS_LABEL: Record<Status, string> = {
  ongoing: 'Ongoing',
  'in-uat': 'In user testing',
  delivered: 'Delivered',
};

export default function Experience() {
  return (
    <>
      <div className="os-addressbar" aria-hidden="true">
        <span className="os-chrome">Address</span>
        <span className="os-field os-chrome">C:\Juna\Experience</span>
      </div>

      <p className="win-lede">
        Where I work and what I am responsible for. Client and system names are withheld under NDA, so engagements are
        described by industry.
      </p>

      {portfolio.roles.map((role) => (
        <article key={`${role.title}-${role.start}`} className="xp-role">
          <header className="xp-role-head">
            <Icon name="folder" scale={3} />
            <div>
              <h3 className="win-h3">{role.title}</h3>
              <p className="os-chrome xp-meta">
                {role.company} · {role.employment} · {role.start} – {role.end ?? 'Present'}
              </p>
            </div>
          </header>
          <p className="xp-summary">{role.summary}</p>

          <ol className="xp-engagements">
            {role.engagements.map((eng, i) => (
              <li key={eng.title} className="os-groupbox">
                <h4 className="os-group-legend">
                  {String(i + 1).padStart(2, '0')} · {eng.title}
                </h4>
                <p className="os-chrome xp-eng-meta">
                  {eng.industry} · {eng.role}
                </p>
                <ul className="os-field xp-contribs">
                  {eng.contributions.map((c) => (
                    <li key={c.text}>
                      <span>{c.text}</span>
                      {c.status ? (
                        <span className={cx('os-chrome', 'xp-status', c.status === 'ongoing' && 'is-ongoing')}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="os-chips">
                  <span className="sr-only">Stack: </span>
                  {eng.stack.map((s, j) => (
                    <span key={s} className="os-chip">
                      {s}
                      {j < eng.stack.length - 1 ? <span className="sr-only">, </span> : null}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </>
  );
}

export function experienceStatus(): string[] {
  const engagements = portfolio.roles.reduce((n, r) => n + r.engagements.length, 0);
  const since = portfolio.roles[portfolio.roles.length - 1]?.start ?? '';
  return [`${engagements} engagement(s)`, `Since ${since}`];
}
