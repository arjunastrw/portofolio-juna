import portfolio from '../../data/portfolio';
import Section from './Section';
import { stageBus } from '../../navigation';

export default function SideProjects() {
  return (
    <Section
      id="projects"
      index="02"
      title="Side projects"
      lede="Things I build outside client work, mostly around markets and automation. Source code is private unless a link is shown."
    >
      <ol className="border-t border-rule">
        {portfolio.sideProjects.map((project, i) => (
          <li
            key={project.name}
            onPointerEnter={() => stageBus.shelfFocus?.(i)}
            onPointerLeave={() => stageBus.shelfFocus?.(null)}
            className="grid gap-3 border-b border-rule py-6 @3xl:grid-cols-12 @3xl:items-baseline @3xl:gap-8">
            <p className="eyebrow @3xl:col-span-3">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="font-serif text-[1.6rem] leading-[1.1] @3xl:col-span-3">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {project.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                project.name
              )}
            </h3>
            <p className="max-w-[48ch] leading-relaxed text-ink/80 @3xl:col-span-4">{project.description}</p>
            <p className="eyebrow @3xl:col-span-2 @3xl:text-right">
              <span className="sr-only">Stack: </span>
              {project.stack.join(' / ')}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
