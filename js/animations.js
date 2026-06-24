/* ========================================
   ANIMATIONS — GSAP ScrollTrigger-powered reveals
   ======================================== */
window.App = window.App || {};

App.animations = {
  init() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    this._animatedHero = false;

    App.events.on('boot:complete', () => {
      this._animHero();
    });

    this._animSections();
    this._animProjects();
    this._animSkills();
    this._animContact();
  },

  _animHero() {
    if (this._animatedHero) return;
    this._animatedHero = true;
    const els = document.querySelectorAll('#hero .animate-in');
    gsap.to(els, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12,
      ease: App.config.EASE,
    });
  },

  _animSections() {
    document.querySelectorAll('.section-grid > div').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.15,
        ease: App.config.EASE,
        scrollTrigger: { trigger: el.parentElement, start: 'top 80%' },
      });
    });
  },

  _animProjects() {
    document.querySelectorAll('.project-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.1,
        ease: App.config.EASE,
        scrollTrigger: { trigger: card, start: 'top 85%' },
      });
    });
  },

  _animSkills() {
    document.querySelectorAll('.skill-category').forEach((cat, i) => {
      gsap.fromTo(cat, { opacity: 0, y: 40, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.12,
        ease: App.config.EASE,
        scrollTrigger: { trigger: cat, start: 'top 85%' },
        onStart: () => this._animSkillBars(cat),
      });
    });
  },

  _animSkillBars(category) {
    const fills = category.querySelectorAll('.skill-bar-fill');
    fills.forEach((fill, i) => {
      const targetWidth = fill.getAttribute('data-width');
      gsap.to(fill, {
        width: targetWidth + '%',
        duration: App.config.SKILL_BAR_DURATION,
        ease: 'power2.out',
        delay: i * 0.1,
      });
    });
  },

  _animContact() {
    gsap.fromTo('.contact-card', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8,
      ease: App.config.EASE,
      scrollTrigger: { trigger: '#contact', start: 'top 80%' },
    });
  },
};
