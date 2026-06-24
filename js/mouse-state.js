/* ========================================
   MOUSE STATE — Singleton mouse tracking
   Single source of truth for mouse position.
   Consumers read App.mouse.x / App.mouse.y
   ======================================== */
window.App = window.App || {};

App.mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,

  init() {
    const onMove = (e) => {
      this.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      // Raw pixel coords for cursor/particles
      this.x = e.clientX;
      this.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
  },
};
