/* ========================================
   BOOT — Loading screen sequence
   Renders boot lines from App.data.bootLines,
   then progress bar, then fires App.events.emit('boot:complete')
   ======================================== */
window.App = window.App || {};
App.events = App.events || { _listeners: {} };

App.events.on = function(name, fn) {
  (this._listeners[name] = this._listeners[name] || []).push(fn);
};

App.events.emit = function(name, data) {
  (this._listeners[name] || []).forEach(fn => fn(data));
};

App.boot = {
  init() {
    this._renderLines();
  },

  _renderLines() {
    const container = document.getElementById('boot-body');
    const lines = App.data.bootLines;
    let i = 0;

    const showNext = () => {
      if (i >= lines.length) {
        setTimeout(() => this._startProgress(), 300);
        return;
      }
      const div = document.createElement('div');
      div.className = 'line';
      div.textContent = '> ' + lines[i].text;
      if (lines[i].cls) div.classList.add(lines[i].cls);
      container.appendChild(div);

      requestAnimationFrame(() => div.classList.add('visible'));

      i++;
      setTimeout(showNext, 60 + Math.random() * 160);
    };
    showNext();
  },

  _startProgress() {
    const wrap = document.getElementById('boot-progress-wrap');
    const fill = document.getElementById('boot-progress-fill');
    const text = document.getElementById('boot-progress-text');
    const pctEl = document.getElementById('boot-progress-pct');
    const btn = document.getElementById('boot-enter-btn');
    const screen = document.getElementById('loading-screen');
    const steps = App.data.bootProgress;
    let progress = 0;
    let stepIdx = 0;

    wrap.classList.add('visible');

    const tick = () => {
      if (stepIdx >= steps.length) {
        btn.classList.add('visible');
        btn.addEventListener('click', () => {
          screen.classList.add('hidden');
          App.events.emit('boot:complete');
        });
        return;
      }
      const step = steps[stepIdx];
      const duration = 300 + Math.random() * 600;
      const startPct = progress;
      const endPct = step.pct;
      const startTime = performance.now();

      const anim = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = startPct + (endPct - startPct) * eased;
        fill.style.width = current + '%';
        pctEl.textContent = Math.round(current) + '%';
        if (t < 1) {
          requestAnimationFrame(anim);
        } else {
          progress = endPct;
          text.textContent = step.label;
          stepIdx++;
          setTimeout(tick, 200);
        }
      };
      requestAnimationFrame(anim);
    };
    tick();
  },
};
