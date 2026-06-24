/* ========================================
   CARD 3D — Perspective tilt on hover
   Adds 3D perspective + tilt + glare to all cards.
   Disabled on touch devices.
   ======================================== */
window.App = window.App || {};

App.card3d = {
  init() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const selectors = '.project-card, .skill-category, .contact-card';
    this._cards = document.querySelectorAll(selectors);
    this._cards.forEach(card => this._bind(card));

    this._observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(selectors)) this._bind(node);
          node.querySelectorAll?.(selectors)?.forEach(c => this._bind(c));
        });
      });
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  _bind(card) {
    if (card.dataset.card3dBound) return;
    card.dataset.card3dBound = '1';
    card.classList.add('card-3d');

    const glare = document.createElement('div');
    glare.className = 'card-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', (e) => this._tilt(e, card, glare));
    card.addEventListener('mouseleave', () => this._reset(card, glare));
  },

  _tilt(e, card, glare) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -14;
    const ry = ((x / rect.width) - 0.5) * 14;

    card.style.transform =
      'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) +
      'deg) scale3d(1.02, 1.02, 1.02)';
    card.style.boxShadow =
      (ry > 0 ? (ry * 0.9).toFixed(0) + 'px ' : '') +
      (rx > 0 ? (rx * 0.6).toFixed(0) + 'px ' : '') +
      '30px rgba(0, 229, 255, ' + (0.08 + Math.abs(ry) * 0.008).toFixed(3) + '), ' +
      (ry < 0 ? Math.abs(ry * 0.5).toFixed(0) + 'px ' : '') +
      (rx < 0 ? Math.abs(rx * 0.4).toFixed(0) + 'px ' : '') +
      '20px rgba(0, 0, 0, 0.5)';

    if (glare) {
      glare.style.opacity = '1';
      glare.style.background =
        'radial-gradient(circle at ' + ((x / rect.width) * 100).toFixed(0) + '% ' +
        ((y / rect.height) * 100).toFixed(0) +
        '%, rgba(255,255,255,0.07) 0%, transparent 55%)';
    }
  },

  _reset(card, glare) {
    card.style.transform =
      'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = '';
    if (glare) glare.style.opacity = '0';
  },
};
