/* ========================================
   SCRATCH CARD — Coin-scratch reveal for about photo
   Canvas overlay that erases on drag to reveal image.
   ======================================== */
window.App = window.App || {};

App.scratch = {
  init() {
    const wrapper = document.querySelector('.scratch-wrapper');
    const canvas = wrapper?.querySelector('.scratch-canvas');
    if (!wrapper || !canvas) return;

    this._wrapper = wrapper;
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._scratching = false;
    this._revealed = false;
    this._progressChecks = 0;

    this._setupCanvas();
    this._bindEvents();

    this._resizeOb = new ResizeObserver(() => {
      if (!this._revealed) this._setupCanvas();
    });
    this._resizeOb.observe(this._wrapper);
  },

  _setupCanvas() {
    const w = this._wrapper.clientWidth;
    const h = this._wrapper.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this._w = w;
    this._h = h;
    this._canvas.width = w * dpr;
    this._canvas.height = h * dpr;
    this._canvas.style.width = w + 'px';
    this._canvas.style.height = h + 'px';
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.scale(dpr, dpr);

    this._drawSurface();
  },

  _drawSurface() {
    const w = this._w;
    const h = this._h;

    const grad = this._ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(0.4, '#241a30');
    grad.addColorStop(0.7, '#1a1a1a');
    grad.addColorStop(1, '#1e1630');
    this._ctx.fillStyle = grad;
    this._ctx.fillRect(0, 0, w, h);

    this._ctx.fillStyle = 'rgba(107, 63, 122, 0.25)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      this._ctx.beginPath();
      this._ctx.arc(x, y, 0.6 + Math.random() * 2, 0, Math.PI * 2);
      this._ctx.fill();
    }

    const cx = w / 2;
    const cy = h / 2 - 18;
    this._ctx.strokeStyle = 'rgba(245, 166, 35, 0.55)';
    this._ctx.lineWidth = 2.5;
    this._ctx.beginPath();
    this._ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    this._ctx.stroke();
    this._ctx.beginPath();
    this._ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    this._ctx.stroke();

    this._ctx.font = 'bold 15px "JetBrains Mono", monospace';
    this._ctx.fillStyle = 'rgba(245, 166, 35, 0.65)';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText('\u00A2', cx, cy);

    this._ctx.font = '11px "JetBrains Mono", monospace';
    this._ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
    this._ctx.fillText('scratch to reveal', cx, cy + 50);
  },

  _scratch(clientX, clientY) {
    if (this._revealed) return;
    const rect = this._canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this._ctx.globalCompositeOperation = 'destination-out';
    this._ctx.beginPath();
    this._ctx.arc(x, y, 26, 0, Math.PI * 2);
    this._ctx.fill();
    this._ctx.globalCompositeOperation = 'source-over';

    this._progressChecks++;
    if (this._progressChecks % 12 === 0) this._checkProgress();
  },

  _checkProgress() {
    const w = this._canvas.width;
    const h = this._canvas.height;
    if (w === 0 || h === 0) return;

    const scale = 4;
    const sw = Math.floor(w / scale);
    const sh = Math.floor(h / scale);
    const img = this._ctx.getImageData(0, 0, sw, sh);
    let transparent = 0;
    for (let i = 3; i < img.data.length; i += 4) {
      if (img.data[i] === 0) transparent++;
    }
    if (transparent / (sw * sh) > 0.35) this._revealAll();
  },

  _revealAll() {
    if (this._revealed) return;
    this._revealed = true;
    this._canvas.style.transition = 'opacity 0.5s ease';
    this._canvas.style.opacity = '0';
    setTimeout(() => {
      if (this._canvas) this._canvas.style.display = 'none';
    }, 500);
  },

  _bindEvents() {
    const start = (e) => {
      if (e.type === 'touchstart') e.preventDefault();
      this._scratching = true;
      const ev = e.touches ? e.touches[0] : e;
      this._scratch(ev.clientX, ev.clientY);
    };
    const move = (e) => {
      if (!this._scratching) return;
      if (e.type === 'touchmove') e.preventDefault();
      const ev = e.touches ? e.touches[0] : e;
      this._scratch(ev.clientX, ev.clientY);
    };
    const end = () => { this._scratching = false; };

    this._canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    this._canvas.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
  },
};
