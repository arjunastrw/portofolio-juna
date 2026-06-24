/* ========================================
   CURSOR — Custom cursor with neon glow
   Uses App.mouse for position, App.renderLoop for ring animation.
   ======================================== */
window.App = window.App || {};

App.cursor = {
  init() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');
    if (!this.dot || !this.ring) return;

    this.ringX = 0;
    this.ringY = 0;

    this._bindHover();
    App.renderLoop.add(this._tick.bind(this));
  },

  _tick() {
    this.dot.style.left = App.mouse.x + 'px';
    this.dot.style.top = App.mouse.y + 'px';

    this.ringX += (App.mouse.x - this.ringX) * 0.12;
    this.ringY += (App.mouse.y - this.ringY) * 0.12;
    this.ring.style.left = this.ringX + 'px';
    this.ring.style.top = this.ringY + 'px';
  },

  _bindHover() {
    const targets = document.querySelectorAll(
      'a, button, .project-card, .hamburger, .boot-enter-btn, .floating-btn'
    );
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('hover');
        this.ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('hover');
        this.ring.classList.remove('hover');
      });
    });
  },
};
