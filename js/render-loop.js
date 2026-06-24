/* ========================================
   RENDER LOOP — Single RAF manager
   All animations register callbacks here.
   One requestAnimationFrame drives everything.
   ======================================== */
window.App = window.App || {};

App.renderLoop = {
  _callbacks: [],
  _running: false,

  add(fn) {
    this._callbacks.push(fn);
    if (!this._running) this._start();
  },

  remove(fn) {
    this._callbacks = this._callbacks.filter(f => f !== fn);
  },

  _start() {
    this._running = true;
    const tick = (time) => {
      for (const cb of this._callbacks) {
        cb(time);
      }
      if (this._running) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  },

  stop() {
    this._running = false;
    this._callbacks = [];
  },
};
