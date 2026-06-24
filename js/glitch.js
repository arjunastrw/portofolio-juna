/* ========================================
   GLITCH — Proximity-based glitch jitter on .glitch elements
   Uses App.mouse for position, App.renderLoop for animation.
   ======================================== */
window.App = window.App || {};

App.glitch = {
  init() {
    this._els = document.querySelectorAll('.glitch');
    if (!this._els.length) return;
    App.renderLoop.add(this._tick.bind(this));
  },

  _tick() {
    const mx = App.mouse.x;
    const my = App.mouse.y;
    this._els.forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      const intensity = Math.max(0, 1 - dist / 400);
      if (intensity > 0) {
        const xShift = (Math.random() - 0.5) * intensity * 6;
        const yShift = (Math.random() - 0.5) * intensity * 4;
        el.style.transform = `translate(${xShift}px, ${yShift}px)`;
      } else {
        el.style.transform = '';
      }
    });
  },
};
