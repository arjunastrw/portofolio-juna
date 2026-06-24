/* ========================================
   THEME — Light/dark toggle via data-theme attribute
   ======================================== */
window.App = window.App || {};

App.theme = {
  _isLight: false,

  init() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this._isLight = !this._isLight;
      btn.textContent = this._isLight ? '☽' : '☀';
      document.documentElement.setAttribute(
        'data-theme',
        this._isLight ? 'light' : ''
      );
    });
  },
};
