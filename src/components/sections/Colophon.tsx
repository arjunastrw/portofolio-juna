import portfolio from '../../data/portfolio';

export default function Colophon() {
  const year = new Date().getFullYear();
  const lines = [
    `© ${year} ${portfolio.name}`,
    `${portfolio.revision} · Updated ${portfolio.updated}`,
    'Set in Instrument Serif, Geist and Geist Mono',
    'Fig. 01 rendered with Three.js',
    'Client names withheld under NDA',
  ];

  return (
    <footer className="shell mt-28 pb-10">
      <ul className="eyebrow flex flex-col gap-2 border-t border-rule pt-5 md:flex-row md:flex-wrap md:justify-between md:gap-x-10">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </footer>
  );
}
