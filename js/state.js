/*
 * URL state hydration + share button + history drawer.
 *
 * Philosophy: every interactive state (modal open, tab selected, theme) lives
 * in the URL. Reload the URL → same screen. Share the URL → same screen.
 *
 * Usage from app.js:
 *   State.hydrate({
 *     modal: (v) => v && openModal(v),
 *     tab:   (v) => v && selectTab(v),
 *   });
 *   // later, when user opens a modal:
 *   State.set('modal', 'signup');
 */
(function () {
  const SESSION_KEY = (window.PROTO_NS || 'proto-') + 'history';
  const MAX_HISTORY = 10;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  }

  function readParams() {
    const p = new URLSearchParams(location.search);
    const out = {};
    for (const [k, v] of p.entries()) out[k] = v;
    return out;
  }

  function writeParams(obj) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined && v !== '') p.set(k, v);
    }
    const hash = location.hash || '';
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '') + hash;
    history.replaceState(null, '', url);
  }

  function set(key, value) {
    const current = readParams();
    if (value === null || value === undefined || value === '') delete current[key];
    else current[key] = String(value);
    writeParams(current);
    pushHistory();
  }

  function get(key) {
    return readParams()[key] || null;
  }

  function hydrate(handlers) {
    const params = readParams();
    for (const [key, fn] of Object.entries(handlers || {})) {
      try { fn(params[key] || null); } catch (e) { console.warn('hydrate', key, e); }
    }
  }

  // --- SHARE BUTTON -------------------------------------------------------
  function copyShareUrl() {
    const url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => toast('Link copied'));
    } else {
      // fallback for http:// without clipboard
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Link copied'); } catch {}
      document.body.removeChild(ta);
    }
  }

  // Defer to ui.js — both files drive the same shared `.proto-toast` element, and only
  // ui.js's version clears a still-armed undoToast()'s hover/focus-pause listeners. When
  // state.js kept its own copy, a Share toast fired after an undo inherited "hovering
  // pauses dismissal" and hung on screen. ui.js loads before any click can call this;
  // the inline fallback only covers a screen that somehow ships without it.
  function toast(msg) {
    if (window.UI && typeof window.UI.toast === 'function') return window.UI.toast(msg);
    let el = document.querySelector('.proto-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'proto-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('visible'), 1600);
  }

  window.State = { get, set, hydrate, toast };
})();
