import portfolio, { type Role, type Status } from '../../data/portfolio';
import Section from './Section';

const STATUS_LABEL: Record<Status, string> = {
  ongoing: 'Ongoing',
  'in-uat': 'In user testing',
  delivered: 'Delivered',
};

/** Small square marker + text label. Only "ongoing" carries the accent colour. */
function StatusMark({ status }: { status: Status }) {
  const swatch =
    status === 'ongoing'
      ? 'bg-accent border-accent'
      : status === 'in-uat'
        ? 'border-muted bg-[linear-gradient(90deg,var(--color-muted)_50%,transparent_50%)]'
        : 'border-muted';
  return (
    <span className={`eyebrow inline-flex shrink-0 items-center gap-2 ${status === 'ongoing' ? 'text-accent' : ''}`}>
      <span aria-hidden="true" className={`inline-block size-[7px] border ${swatch}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Period({ role }: { role: Role }) {
  return (
    <p className="eyebrow text-ink">
      {role.start} — {role.end ?? 'Present'}
    </p>
  );
}

export default function Experience() {
  return (
    <Section
      id="experience"
      index="01"
      title="Experience"
      lede="Where I work and what I am responsible for. Client and system names are withheld under NDA, so engagements are described by industry."
    >
      {portfolio.roles.map((role) => (
        <article key={`${role.title}-${role.start}`} className="grid gap-10 @3xl:grid-cols-12 @3xl:gap-8">
          <aside className="@3xl:col-span-3">
            <div className="@3xl:sticky @3xl:top-24">
              <Period role={role} />
              <dl className="mt-4 grid gap-1.5 text-sm text-muted">
                <div>
                  <dt className="sr-only">Employer</dt>
                  <dd>{role.company}</dd>
                </div>
                <div>
                  <dt className="sr-only">Employment type</dt>
                  <dd>{role.employment}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="@3xl:col-span-9">
            <h3 className="font-serif text-[2rem] leading-[1.05] @3xl:text-[2.6rem]">{role.title}</h3>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-ink/80">{role.summary}</p>

            <ol className="mt-12 grid gap-14">
              {role.engagements.map((engagement, i) => (
                <li key={engagement.title} className="grid gap-5 border-t border-rule pt-6 @3xl:grid-cols-9 @3xl:gap-8">
                  <div className="@3xl:col-span-3">
                    <p className="eyebrow">{String(i + 1).padStart(2, '0')}</p>
                    <h4 className="mt-2 font-serif text-[1.5rem] leading-[1.15]">{engagement.title}</h4>
                    <p className="eyebrow mt-3">
                      {engagement.industry}
                      <br />
                      {engagement.role}
                    </p>
                  </div>

                  <div className="@3xl:col-span-6">
                    <ul className="divide-y divide-rule border-b border-rule">
                      {engagement.contributions.map((c) => (
                        <li
                          key={c.text}
                          className="flex flex-col gap-2 py-4 first:pt-0 @md:flex-row @md:items-baseline @md:justify-between @md:gap-8"
                        >
                          <p className="max-w-[52ch] leading-relaxed">{c.text}</p>
                          {c.status ? <StatusMark status={c.status} /> : null}
                        </li>
                      ))}
                    </ul>
                    <p className="eyebrow mt-4">
                      <span className="sr-only">Stack: </span>
                      {engagement.stack.join(' / ')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </article>
      ))}
    </Section>
  );
}
