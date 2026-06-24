/* ========================================
   DATA — All content data for rendering
   ======================================== */
window.App = window.App || {};

App.data = {
  bootLines: [
    { text: 'Initializing system kernel...', cls: '' },
    { text: 'Loading modules: [graphics] [audio] [network]', cls: '' },
    { text: 'Checking dependencies...', cls: 'dim' },
    { text: 'Three.js .............. OK', cls: 'ok' },
    { text: 'GSAP .................. OK', cls: 'ok' },
    { text: 'Howler.js ............. OK', cls: 'ok' },
    { text: 'Establishing WebGL context...', cls: '' },
    { text: 'Memory heap: 47.3 MB allocated', cls: 'warn' },
    { text: 'Compiling shaders...', cls: '' },
    { text: 'Fragment shader optimized', cls: 'dim' },
    { text: 'Vertex shader compiled', cls: 'dim' },
    { text: 'Mounting scene graph...', cls: '' },
    { text: 'Scene ready.', cls: 'ok' },
  ],

  bootProgress: [
    { pct: 15, label: 'Loading assets...' },
    { pct: 32, label: 'Compiling shaders...' },
    { pct: 48, label: 'Building scene graph...' },
    { pct: 67, label: 'Initializing GSAP...' },
    { pct: 82, label: 'Starting render loop...' },
    { pct: 100, label: 'READY' },
  ],

  navItems: [
    { href: '#hero', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#skills', label: 'Skills' },
    { href: '#contact', label: 'Contact' },
  ],

  hero: {
    eyebrow: '// Full-Stack Developer & Automation Engineer',
    titleLine1: 'Systems that',
    titleLine2: 'move money',
    subtitle: 'Building financial platforms, trading bots, and automation pipelines. From stock exchange dashboards to prediction market SDKs — code that runs 24/7.',
    cta: 'View Projects',
    terminal: [
      { cmd: 'npm run dev -- idxnet-web', out: '✓ ready — port 3000', outColor: 'var(--glitch-mint)' },
      { cmd: 'python -m simmer_sdk', out: '✓ SDK loaded — 47 endpoints', outColor: 'var(--accent-orange)' },
    ],
  },

  about: {
    initials: 'J',
    brand: 'JUNA.DEV',
    tag: '// About',
    heading: 'Hello. I\'m<br>Juna.',
    body: 'A full-stack developer specializing in financial platforms, trading automation, and microservices architecture. I build systems that process real-time data, execute trades, and visualize markets — from Indonesia Stock Exchange to prediction markets.',
    techList: 'Currently working with: Go · React · Laravel · Flutter · Python · n8n · Trading Bots',
  },

  projects: [
    {
      index: '01 / 08',
      titlebar: 'idxnet_web.exe',
      name: 'BEI Lines (IDXNet)',
      desc: 'Full-stack financial exchange platform for the Indonesia Stock Exchange. Microservices architecture with React frontend and Go backend services.',
      tags: ['React', 'TypeScript', 'Microservices', 'Go', 'ActiveMQ'],
      glitchBg: 'rgba(255,0,85,0.08)',
    },
    {
      index: '02 / 08',
      titlebar: 'meme_terminal.exe',
      name: 'Meme Coin Terminal',
      desc: 'Terminal-style dashboard for tracking low-cap meme coins. Real-time data feeds, news aggregation, and bullish/bearish probability analysis.',
      tags: ['Next.js', 'WebSocket', 'Real-time', 'Terminal UI'],
      glitchBg: 'rgba(0,255,170,0.08)',
    },
    {
      index: '03 / 08',
      titlebar: 'stock_dashboard.exe',
      name: 'Stock Dashboard Indonesia',
      desc: 'Real-time stock monitoring and analytics dashboard for the Indonesian market. Pulls data from Yahoo Finance and CNBC Indonesia.',
      tags: ['Python', 'Streamlit', 'yfinance', 'Data Viz'],
      glitchBg: 'rgba(255,0,85,0.08)',
    },
    {
      index: '04 / 08',
      titlebar: 'simmer_sdk.exe',
      name: 'Simmer SDK',
      desc: 'Python client library for trading on Simmer prediction markets. Published on PyPI with clean API design and comprehensive documentation.',
      tags: ['Python', 'SDK', 'PyPI', 'Open Source'],
      glitchBg: 'rgba(0,255,170,0.08)',
    },
    {
      index: '05 / 08',
      titlebar: 'smi_ews.exe',
      name: 'Early Warning System (SMI)',
      desc: 'Proactive financial risk detection system for loan portfolios. Monitors indicators and metrics to identify early signs of borrower distress.',
      tags: ['Laravel', 'PHP', 'MySQL', 'Finance'],
      glitchBg: 'rgba(255,0,85,0.08)',
    },
    {
      index: '06 / 08',
      titlebar: 'polymarket_bot.exe',
      name: 'PolyMarket Trading Bot',
      desc: 'Automated trading bot for PolyMarket prediction markets. Fast-loop execution engine with real-time odds monitoring and strategy execution.',
      tags: ['Node.js', 'Automation', 'Trading', 'WebSocket'],
      glitchBg: 'rgba(0,255,170,0.08)',
    },
    {
      index: '07 / 08',
      titlebar: 'aksara_sunda.exe',
      name: 'Aksara Sunda Detection',
      desc: 'Mobile app for detecting and recognizing Sundanese script (Aksara Sunda). Built with Flutter, uses YOLO-based ML model for character recognition.',
      tags: ['Flutter', 'Dart', 'YOLO', 'Mobile'],
      glitchBg: 'rgba(255,0,85,0.08)',
    },
    {
      index: '08 / 08',
      titlebar: 'idx_microservices.exe',
      name: 'IDX Go Microservices',
      desc: 'Suite of 20+ Go microservices powering the Indonesia Stock Exchange. Event-driven architecture with ActiveMQ, Redis caching, and PostgreSQL.',
      tags: ['Go', 'ActiveMQ', 'Redis', 'PostgreSQL'],
      glitchBg: 'rgba(0,255,170,0.08)',
    },
  ],

  skills: [
    {
      name: 'Backend',
      bars: [
        { label: 'Go (Golang)', pct: 90 },
        { label: 'Laravel / PHP', pct: 85 },
        { label: 'Node.js', pct: 80 },
      ],
    },
    {
      name: 'Frontend & Mobile',
      bars: [
        { label: 'React / TypeScript', pct: 88 },
        { label: 'Flutter / Dart', pct: 72 },
        { label: 'Three.js / GSAP', pct: 68 },
      ],
    },
    {
      name: 'Automation & Data',
      bars: [
        { label: 'Trading Bots', pct: 86 },
        { label: 'n8n / Workflow', pct: 83 },
        { label: 'Python', pct: 78 },
      ],
    },
  ],

  contact: {
    tag: '// Get In Touch',
    heading: 'Contact',
    body: 'Got a project in mind? Let\'s build something together.',
    subtext: 'Reach out anytime — I\'d love to hear from you.',
    cta: 'Get In Touch',
    email: 'mailto:juna@example.com',
  },

  socialLinks: [
    {
      href: 'https://github.com/arjunastrw',
      label: 'GitHub',
      svg: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>',
    },
    {
      href: 'https://www.linkedin.com/in/arjunasatria/',
      label: 'LinkedIn',
      svg: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
    },
  ],

  footer: {
    copyright: '© 2026 Juna. All rights reserved.',
    version: 'DUSK & NEON v2.0',
  },
};
