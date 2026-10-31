/**
 * Single source of truth for every piece of copy on the site.
 *
 * Rules for editing this file:
 * - Client names, internal project/system names and their acronyms never go here.
 *   Describe the industry instead. `npm run check:nda` scans for known terms.
 * - No skill levels, percentages or impact numbers unless they are measured and approved.
 * - "PIC" means person in charge of a feature, not owner of the whole project.
 * - Items still awaiting confirmation are tracked in docs/CONTENT-TODO.md.
 */

export type Status = 'ongoing' | 'in-uat' | 'delivered';

export interface Contribution {
  text: string;
  status?: Status;
}

export interface Engagement {
  title: string;
  industry: string;
  role: string;
  contributions: Contribution[];
  stack: string[];
}

export interface Role {
  title: string;
  company: string;
  employment: string;
  start: string;
  /** null = current role */
  end: string | null;
  summary: string;
  engagements: Engagement[];
}

export interface SideProject {
  name: string;
  description: string;
  stack: string[];
  /** Only set when the repository or demo is publicly reachable. */
  url?: string;
}

export interface ToolGroup {
  label: string;
  note: string;
  tools: string[];
}

export interface Portfolio {
  name: string;
  role: string;
  positioning: string;
  /** Short stack line in the masthead. Not yet verified, see docs/CONTENT-TODO.md. */
  headlineStack: string[];
  revision: string;
  updated: string;
  roles: Role[];
  sideProjects: SideProject[];
  toolkit: ToolGroup[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
  };
}

const portfolio: Portfolio = {
  name: 'Juna',
  role: 'Senior Software Engineer',
  positioning:
    'I build backend and frontend systems for clients in capital markets and financial services.',
  headlineStack: ['Go', 'React', 'TypeScript', 'Laravel'],
  revision: 'Rev. 03',
  updated: 'Oct 2026',

  roles: [
    {
      title: 'Senior Software Engineer',
      company: 'Software vendor',
      employment: 'Permanent',
      start: 'Oct 2024',
      end: null,
      summary:
        'Engineer at a technology vendor that builds and maintains systems for financial-industry clients. I work across backend and frontend.',
      engagements: [
        {
          title: 'Capital-markets reporting platform',
          industry: 'Capital markets',
          role: 'Backend & frontend',
          contributions: [
            {
              text: 'Major contributor to migrating the complete issuer-data service from the client’s legacy system to the new platform.',
            },
            {
              text: 'Contribute to the platform’s backend services and its web frontend.',
            },
          ],
          stack: ['Go', 'React', 'TypeScript', 'PostgreSQL', 'Python'],
        },
        {
          title: 'Internal applications for a financial institution',
          industry: 'Financial services',
          role: 'Engineer · PIC for two features',
          contributions: [
            {
              text: 'Person in charge of a peer-analysis dashboard feature.',
              status: 'in-uat',
            },
            {
              text: 'Person in charge of an annual review and monitoring module.',
              status: 'ongoing',
            },
            {
              text: 'Integrated the client’s central single sign-on into several of its internal applications and built the login page.',
            },
          ],
          stack: ['Laravel', 'PHP', 'SQL Server'],
        },
      ],
    },
  ],

  sideProjects: [
    {
      name: 'Meme Coin Terminal',
      description:
        'Terminal-style dashboard for tracking low-cap meme coins, with real-time feeds and news aggregation.',
      stack: ['Next.js', 'WebSocket'],
    },
    {
      name: 'Stock Dashboard',
      description:
        'Monitoring and analytics dashboard for the Indonesian stock market, built on public market data.',
      stack: ['Python', 'Streamlit', 'yfinance'],
    },
    {
      name: 'Simmer SDK',
      description: 'Python client library for trading on Simmer prediction markets.',
      stack: ['Python'],
    },
    {
      name: 'Polymarket bot',
      description:
        'Automated trading bot for Polymarket prediction markets, with real-time odds monitoring and strategy execution.',
      stack: ['Node.js', 'WebSocket'],
    },
    {
      name: 'Aksara Sunda Detection',
      description:
        'Mobile app that recognises Sundanese script characters with a YOLO-based detection model.',
      stack: ['Flutter', 'Dart', 'YOLO'],
    },
  ],

  toolkit: [
    {
      label: 'At work',
      note: 'Used on client systems',
      tools: ['Go', 'React', 'TypeScript', 'PostgreSQL', 'Python', 'Laravel', 'PHP', 'SQL Server'],
    },
    {
      label: 'Off the clock',
      note: 'Used on side projects and this site',
      tools: ['Next.js', 'Node.js', 'Flutter', 'Streamlit', 'n8n', 'Three.js'],
    },
  ],

  contact: {
    email: 'arjunastrw@gmail.com',
    linkedin: 'https://www.linkedin.com/in/arjunasatria/',
    github: 'https://github.com/arjunastrw',
  },
};

export default portfolio;
