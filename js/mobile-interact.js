/* ========================================
   MOBILE INTERACT — Game-like touch + gyro interactions
   Device orientation parallax, touch 3D card tilt,
   haptic feedback, touch ripple.
   ======================================== */
window.App = window.App || {};

App.mobileInteract = {
  init() {
    this._isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!this._isTouch) return;

    this._tiltX = 0;
    this._tiltY = 0;
    this._hasOrientation = false;

    this._setupOrientation();
    this._setupTouchCards();
    this._setupHaptics();
    this._setupRipple();
  },

  _setupOrientation() {
    if (!window.DeviceOrientationEvent) return;

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const request = () => {
        DeviceOrientationEvent.requestPermission()
          .then(state => { if (state === 'granted') this._bindOrientation(); })
          .catch(() => {});
      };
      document.addEventListener('touchstart', request, { once: true });
      document.addEventListener('click', request, { once: true });
    } else {
      this._bindOrientation();
    }
  },

  _bindOrientation() {
    const aboutVisual = document.querySelector('.about-visual');
    const heroInner = document.querySelector('.hero-inner');

    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      this._hasOrientation = true;
      this._tiltX = Math.max(-1, Math.min(1, e.gamma / 45));
      this._tiltY = Math.max(-1, Math.min(1, (e.beta - 30) / 45));
      App.mouse.targetX = this._tiltX;
      App.mouse.targetY = this._tiltY;

      if (aboutVisual) {
        aboutVisual.style.transform =
          'translate(' + (this._tiltX * 8).toFixed(1) + 'px, ' +
          (this._tiltY * 8).toFixed(1) + 'px)';
      }
      if (heroInner) {
        heroInner.style.transform =
          'translate(' + (this._tiltX * -5).toFixed(1) + 'px, ' +
          (this._tiltY * -5).toFixed(1) + 'px)';
      }
    }, { passive: true });
  },

  _setupTouchCards() {
    const selectors = '.project-card, .skill-category, .contact-card';
    const bind = (card) => {
      if (card.dataset.touchTiltBound) return;
      card.dataset.touchTiltBound = '1';
      card.classList.add('card-3d');

      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      card.addEventListener('touchstart', () => {
        this._vibrate(8);
        card.style.transition = 'none';
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) return;
        const t = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -16;
        const ry = ((x / rect.width) - 0.5) * 16;
        card.style.transform =
          'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
          ry.toFixed(2) + 'deg) scale3d(1.03, 1.03, 1.03)';
        glare.style.opacity = '1';
        glare.style.background =
          'radial-gradient(circle at ' + ((x / rect.width) * 100).toFixed(0) +
          '% ' + ((y / rect.height) * 100).toFixed(0) +
          '%, rgba(255,255,255,0.1) 0%, transparent 55%)';
      }, { passive: true });

      card.addEventListener('touchend', () => {
        card.style.transition =
          'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform =
          'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        glare.style.opacity = '0';
      });
    };

    document.querySelectorAll(selectors).forEach(bind);
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(selectors)) bind(node);
        node.querySelectorAll?.(selectors)?.forEach(bind);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  },

  _setupHaptics() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('a, button, .boot-enter-btn, .floating-btn, .nav-item')) {
        this._vibrate(15);
      }
    }, { passive: true });
  },

  _setupRipple() {
    document.addEventListener('touchstart', (e) => {
      if (e.target.classList?.contains('scratch-canvas')) return;
      const t = e.touches[0];
      this._ripple(t.clientX, t.clientY);
    }, { passive: true });
  },

  _ripple(x, y) {
    const r = document.createElement('div');
    r.className = 'touch-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  },

  _vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  },
};
