/* ========================================
   MAIN — Entry point. Initializes all modules in order.
   ======================================== */
window.App = window.App || {};

App.main = {
  init() {
    // 1. Render data-driven content first
    this._renderProjects();
    this._renderSkills();
    this._renderHero();
    this._renderContact();
    this._renderFooter();

    // 2. Initialize infrastructure
    App.mouse.init();

    // 3. Initialize visual modules (order matters: Three.js before particles)
    App.threeScene.init();
    App.particles.init();
    App.glitch.init();
    App.cursor.init();

    // 4. Initialize interactivity
    App.navigation.init();
    App.animations.init();
    App.theme.init();
    App.scratch.init();
    App.card3d.init();
    App.mobileInteract.init();

    // 5. Start boot sequence (blocks UI until complete)
    App.boot.init();

    // 6. Set hero elements initial state
    this._setHeroInitial();
  },

  _renderProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    App.data.projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="card-titlebar">
          <span class="dot c1"></span><span class="dot c2"></span><span class="dot c3"></span>
          <span class="card-title">${p.titlebar}</span>
        </div>
        <div class="card-body">
          <div class="card-glitch" style="background:${p.glitchBg}"></div>
          <span class="card-index">${p.index}</span>
          <h3 class="card-name">${p.name}</h3>
          <p class="card-desc">${p.desc}</p>
          <div class="card-tags">
            ${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
          </div>
          <div class="card-hover-shape"></div>
        </div>`;
      grid.appendChild(card);
    });
  },

  _renderSkills() {
    const container = document.querySelector('.skills-container');
    if (!container) return;
    container.innerHTML = '';

    App.data.skills.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'skill-category';
      div.innerHTML = `
        <div class="skill-cat-name">${cat.name}</div>
        ${cat.bars.map(b => `
          <div class="skill-bar-wrap">
            <div class="skill-bar-label"><span>${b.label}</span><span>${b.pct}%</span></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-width="${b.pct}"></div></div>
          </div>
        `).join('')}`;
      container.appendChild(div);
    });
  },

  _renderHero() {
    const hero = App.data.hero;
    const container = document.querySelector('#hero .hero-inner');
    if (!container) return;

    container.innerHTML = `
      <p class="hero-eyebrow animate-in">${hero.eyebrow}</p>
      <h1 class="hero-title animate-in">
        <span class="glitch" data-text="${hero.titleLine1}">${hero.titleLine1}</span><br>
        <span class="glitch" data-text="${hero.titleLine2}">${hero.titleLine2}</span>
      </h1>
      <p class="hero-subtitle animate-in">${hero.subtitle}</p>
      <a href="#projects" class="hero-cta animate-in">${hero.cta}</a>
      <div class="hero-terminal animate-in">
        ${hero.terminal.map(t => `
          <div class="t-line">&gt; ${t.cmd}</div>
          <div class="t-line" style="color:${t.outColor}">${t.out}</div>
        `).join('')}
        <div class="t-line">&gt; <span class="t-cursor"></span></div>
      </div>`;
  },

  _renderContact() {
    const c = App.data.contact;
    const container = document.querySelector('#contact .contact-card');
    if (!container) return;
    // Preserve the outer structure, rebuild inner
    const wrapper = container.parentElement;
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <p class="section-tag" style="text-align:center">${c.tag}</p>
      <h2 class="section-heading" style="text-align:center">${c.heading}</h2>
      <p class="section-body" style="text-align:center;margin:0 auto 8px">${c.body}</p>
      <p style="font-family:var(--font-mono);font-size:13px;color:var(--secondary);text-align:center">${c.subtext}</p>
      <a href="${c.email}" class="contact-cta">${c.cta}</a>
      <div class="social-links">
        ${App.data.socialLinks.map(s => `
          <a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${s.svg}</svg>
          </a>
        `).join('')}
      </div>`;
    container.replaceWith(card);
  },

  _renderFooter() {
    const f = App.data.footer;
    const footer = document.querySelector('footer');
    if (!footer) return;
    footer.innerHTML = `
      <span>${f.copyright}</span>
      <span>${f.version}</span>`;
  },

  _setHeroInitial() {
    document.querySelectorAll('#hero .animate-in').forEach(el => {
      el.style.transform = 'translateY(20px)';
    });
  },
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => App.main.init());
