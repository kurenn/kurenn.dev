(function () {
  const traps = new WeakMap();
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(modal, trigger) {
    releaseFocus(modal);
    const previous = trigger || document.activeElement;
    const items = () => Array.from(modal.querySelectorAll(selector)).filter(el => el.getClientRects().length);
    function keydown(e) {
      if (e.key !== 'Tab') return;
      const els = items(); if (!els.length) { e.preventDefault(); return; }
      if (!modal.contains(document.activeElement) || (e.shiftKey && document.activeElement === els[0]) || (!e.shiftKey && document.activeElement === els[els.length - 1])) {
        e.preventDefault(); (e.shiftKey ? els[els.length - 1] : els[0]).focus();
      }
    }
    function focusin(e) { if (!modal.contains(e.target)) (items()[0] || modal).focus(); }
    document.addEventListener('keydown', keydown, true); document.addEventListener('focusin', focusin, true);
    traps.set(modal, { previous, keydown, focusin });
    (items()[0] || modal).focus();
  }
  function releaseFocus(modal) {
    const trap = traps.get(modal); if (!trap) return;
    document.removeEventListener('keydown', trap.keydown, true); document.removeEventListener('focusin', trap.focusin, true); traps.delete(modal);
    if (trap.previous && document.contains(trap.previous)) trap.previous.focus();
  }
  function copyButton(button, text) {
    button.setAttribute('aria-live', 'polite');
    const original = button._original || button.innerHTML; button._original = original;
    function success() { button.textContent = button.dataset.copySuccess || 'Copied!'; clearTimeout(button._timer); button._timer = setTimeout(() => { button.innerHTML = original; }, 1200); }
    function fallback() { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} el.remove(); button.focus(); if (ok) success(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(success, fallback); else fallback();
  }
  window.UI = { trapFocus, releaseFocus, copyButton };
})();