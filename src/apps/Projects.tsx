import portfolio from '../data/portfolio';
import { Icon } from '../os/icons';

/** Side projects as an Explorer "Details" view. */
export default function Projects() {
  return (
    <>
      <div className="os-addressbar" aria-hidden="true">
        <span className="os-chrome">Address</span>
        <span className="os-field os-chrome">C:\Juna\Side Projects</span>
      </div>

      <p className="win-lede">
        Things I build outside client work, mostly around markets and automation. Source code is private unless a link
        is shown.
      </p>

      <div className="os-field proj-view">
        <table className="proj-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Stack</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.sideProjects.map((p) => (
              <tr key={p.name}>
                <th scope="row">
                  <span className="proj-name">
                    <Icon name="program" scale={1} />
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      p.name
                    )}
                  </span>
                </th>
                <td>{p.description}</td>
                <td className="os-chrome proj-stack">{p.stack.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function projectsStatus(): string[] {
  return [`${portfolio.sideProjects.length} object(s)`, 'Private repositories'];
}
