/* ========================================
   PARTICLES — 2D Canvas particle overlay
   Uses App.mouse for repulsion, App.renderLoop for animation.
   ======================================== */
window.App = window.App || {};

App.particles = {
  init() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width = window.innerWidth;
    this._height = canvas.height = window.innerHeight;

    this._list = [];
    for (let i = 0; i < App.config.PARTICLE_COUNT; i++) {
      this._list.push(this._makeParticle());
    }

    window.addEventListener('resize', () => {
      this._width = canvas.width = window.innerWidth;
      this._height = canvas.height = window.innerHeight;
    });

    App.renderLoop.add(this._tick.bind(this));
  },

  _makeParticle() {
    return {
      x: Math.random() * this._width,
      y: Math.random() * this._height,
      size: 0.5 + Math.random() * 2,
      speedY: 0.3 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: 0.1 + Math.random() * 0.4,
      color: Math.random() < 0.5
        ? (Math.random() < 0.5 ? App.config.COLORS.cyan : App.config.COLORS.orange)
        : (Math.random() < 0.5 ? App.config.COLORS.mint : App.config.COLORS.pink),
    };
  },

  _reset(p) {
    p.x = Math.random() * this._width;
    p.y = -10;
    p.size = 0.5 + Math.random() * 2;
    p.speedY = 0.3 + Math.random() * 1.2;
    p.speedX = (Math.random() - 0.5) * 0.4;
    p.opacity = 0.1 + Math.random() * 0.4;
    p.color = Math.random() < 0.5
      ? (Math.random() < 0.5 ? App.config.COLORS.cyan : App.config.COLORS.orange)
      : (Math.random() < 0.5 ? App.config.COLORS.mint : App.config.COLORS.pink);
  },

  _tick() {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    this._list.forEach(p => {
      // Mouse repulsion
      const dx = p.x - App.mouse.x;
      const dy = p.y - App.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.x += (dx / dist) * 1.5;
        p.y += (dy / dist) * 1.5;
      }

      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y > this._height + 10) this._reset(p);
      if (p.x < -10) p.x = this._width + 10;
      if (p.x > this._width + 10) p.x = -10;

      // Draw
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  },
};
