import portfolio from '../../data/portfolio';
import Section from './Section';

export default function Toolkit() {
  return (
    <Section
      id="toolkit"
      index="03"
      title="Toolkit"
      lede="Grouped by where I have used each tool, not by self-rated skill level."
    >
      <div className="grid gap-12 @3xl:grid-cols-2 @3xl:gap-8">
        {portfolio.toolkit.map((group) => (
          <div key={group.label} className="border-t border-rule pt-5">
            <h3 className="eyebrow text-ink">{group.label}</h3>
            <p className="eyebrow">{group.note}</p>
            <ul className="mt-6 flex flex-wrap font-serif text-[1.9rem] leading-[1.25] @3xl:text-[2.25rem]">
              {group.tools.map((tool, i) => (
                <li key={tool}>
                  {tool}
                  {i < group.tools.length - 1 ? (
                    <span aria-hidden="true" className="px-2.5 text-faint">
                      /
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
