/* ========================================
   NAVIGATION — Sidebar, hamburger, scroll spy
   ======================================== */
window.App = window.App || {};

App.navigation = {
  init() {
    this._renderNav();
    this._renderMobileNav();
    this._initScrollSpy();
    this._initHamburger();
  },

  _renderNav() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    const items = App.data.navItems;
    items.forEach((item, i) => {
      if (i > 0) {
        const dot = document.createElement('span');
        dot.className = 'nav-dot';
        sidebar.appendChild(dot);
      }
      const a = document.createElement('a');
      a.className = 'nav-item' + (i === 0 ? ' active' : '');
      a.href = item.href;
      a.textContent = item.label;
      sidebar.appendChild(a);
    });
  },

  _renderMobileNav() {
    const overlay = document.getElementById('mobile-nav');
    if (!overlay) return;
    overlay.innerHTML = '';
    App.data.navItems.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      overlay.appendChild(a);
    });
  },

  _initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('#sidebar .nav-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(el => el.classList.remove('active'));
          const active = document.querySelector(`#sidebar .nav-item[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));
  },

  _initHamburger() {
    const btn = document.getElementById('hamburger');
    const overlay = document.getElementById('mobile-nav');
    if (!btn || !overlay) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      overlay.classList.toggle('open');
    });

    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('open');
        overlay.classList.remove('open');
      });
    });
  },
};
