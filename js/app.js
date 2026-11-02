/*
 * Page-specific glue.
 * Add interactive behaviors here. Keep each screen's state flowing through
 * State.set() so URLs stay shareable.
 */
(function () {
  // ---------- kurenn.dev: render content from data.js ----------
  const D = window.Data?.all || {};
  const root = document.documentElement;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ext = (p) => p.external ? ' target="_blank" rel="noopener"' : '';

  // Home: the index is the navigation; hover/focus swaps the detail pane
  const ixList = document.querySelector('[data-render="index"]');
  const panes = document.querySelector('[data-render="panes"]');
  if (ixList && panes) {
    const firstSentence = (t) => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
    const items = [
      { id: 'manifesto', name: 'Manifesto', href: 'manifesto.html', modal: true },
      ...D.projects.map(p => ({ id: p.id, name: p.name, href: 'projects.html#' + p.id, project: p })),
      { id: 'open-source', name: 'Open source', href: 'open-source.html' },
    ];
    ixList.innerHTML = items.map((it, i) => `
      <li><a class="ix" href="${it.href}" data-ix="${it.id}"${it.modal ? ' data-open-modal="manifesto" aria-haspopup="dialog"' : ''}>
        <span class="ix-n">${pad(i + 1)}</span><span class="ix-name">${esc(it.name)}</span>
        <span class="ix-promise">${esc(it.project ? it.project.promise : it.id === 'manifesto' ? D.manifesto.title : 'Code, plugins and experiments, built in public.')}</span>
      </a></li>`).join('');
    const pane = (id, inner) => `<div class="pane" data-pane="${id}" aria-hidden="true">${inner}</div>`;
    panes.innerHTML += [
      ...D.projects.map((p, i) => pane(p.id, `
        <p class="meta">${pad(i + 2)} · ${esc(p.name)}</p>
        <p class="pane-title">${esc(p.promise)}</p>
        <p class="pane-body">${esc(firstSentence(p.body))}</p>
        <p class="meta-row"><span class="status" data-status="${p.status}">${esc(p.state)}</span>${p.updated ? `<span>Updated ${fmtDate(p.updated)}</span>` : ''}</p>
        <a href="${esc(p.url)}" class="text-link"${ext(p)}>${esc(p.cta)} ${p.external ? '↗' : '→'}</a>`)),
      pane('open-source', `
        <p class="meta">06 · Open source</p>
        <p class="pane-title">Building in public.</p>
        <p class="pane-body">Some of what I build is open source. Explore the code, use the projects, contribute, or follow along as they evolve.</p>
        <p class="meta-row"><span>${D.repos.length} public repositories</span></p>
        <a href="open-source.html" class="text-link">Browse the code →</a>`),
    ].join('');
    // Manifesto shares the opening pane: it already is the belief.
    const paneFor = (id) => (id === 'manifesto' ? 'belief' : id);
    let current = 'belief';
    const show = (id) => {
      if (id === current || !panes.querySelector(`[data-pane="${paneFor(id)}"]`)) return;
      current = id;
      panes.querySelectorAll('[data-pane]').forEach(el => {
        const on = el.dataset.pane === paneFor(id);
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-hidden', String(!on));
      });
      ixList.querySelectorAll('[data-ix]').forEach(a => a.classList.toggle('is-current', a.dataset.ix === id));
    };
    show('belief'); current = 'belief';
    panes.querySelector('[data-pane="belief"]').classList.add('is-active');
    panes.querySelector('[data-pane="belief"]').setAttribute('aria-hidden', 'false');
    ixList.addEventListener('mouseover', e => { const a = e.target.closest('[data-ix]'); if (a) show(a.dataset.ix); });
    ixList.addEventListener('focusin', e => { const a = e.target.closest('[data-ix]'); if (a) show(a.dataset.ix); });
    const stage = document.querySelector('[data-ix-stage]');
    stage.addEventListener('mouseleave', () => show('belief'));
    stage.addEventListener('focusout', e => { if (!stage.contains(e.relatedTarget)) show('belief'); });
  }

  // Manifesto (panel on home + /manifesto page)
  document.querySelectorAll('[data-render="manifesto"]').forEach(el => {
    const m = D.manifesto;
    el.innerHTML = `
      <header class="m-head">
        <p class="meta">Manifesto</p>
        <h1 class="m-title" id="mtitle">${esc(m.title)}</h1>
        <p class="meta">${esc(m.signed)}</p>
      </header>
      ${m.sections.map((s, i) => `
        <section class="m-section" id="${s.id}" aria-labelledby="${s.id}-h">
          <span class="m-idx">${pad(i + 1)}</span>
          <div class="prose"><h2 id="${s.id}-h">${esc(s.h)}</h2>${s.p.map(t => `<p>${esc(t)}</p>`).join('')}</div>
        </section>`).join('')}
      <div class="m-closing flex flex-col gap-8">
        <blockquote>${esc(m.closing)}</blockquote>
        <div><a href="projects.html" class="btn">See what I’m building →</a></div>
      </div>`;
  });
  const toc = document.querySelector('[data-render="toc"]');
  if (toc) {
    toc.innerHTML = D.manifesto.sections.map((s, i) =>
      `<a href="#${s.id}" data-toc="${s.id}"><span>${pad(i + 1)}</span><span>${esc(s.h)}</span></a>`).join('');
  }

  // Reading progress: panel scroll on home, window scroll on /manifesto
  function wireProgress(scroller, bar) {
    if (!bar) return;
    const update = () => {
      const el = scroller === window ? document.documentElement : scroller;
      const max = el.scrollHeight - el.clientHeight;
      bar.style.width = (max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0) + '%';
    };
    (scroller === window ? window : scroller).addEventListener('scroll', update, { passive: true });
    update();
  }
  const panel = document.querySelector('[data-panel-scroll]');
  if (panel) wireProgress(panel, panel.querySelector('[data-progress]'));
  else if (document.querySelector('[data-page-progress]')) wireProgress(window, document.querySelector('[data-page-progress]'));

  // TOC current-section highlight
  if (toc && 'IntersectionObserver' in window) {
    const links = toc.querySelectorAll('[data-toc]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-current', a.dataset.toc === e.target.id));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    D.manifesto.sections.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
  }

  // Projects
  const projects = document.querySelector('[data-render="projects"]');
  if (projects) {
    projects.innerHTML = D.projects.map((p, i) => {
      const sep = p.id === 'coba' ? ' ⇄ ' : ' → ';
      const meta = p.meta.concat([[p.id === 'coba' ? 'Flow' : 'Loop', p.loop.join(sep) + (p.id === 'devloop' ? ' ↺' : '')]], p.updated ? [['Updated', fmtDate(p.updated)]] : []);
      return `
      <article class="project g12" id="${p.id}" aria-labelledby="${p.id}-h">
        <span class="meta p-n">${pad(i + 1)}</span>
        <div class="p-name"><h2 id="${p.id}-h">${esc(p.name)}</h2><span class="status" data-status="${p.status}">${esc(p.state)}</span></div>
        <div class="p-main">
          <p class="p-promise">${esc(p.promise)}</p>
          <p class="p-body">${esc(p.body)}</p>
          <dl class="kv">${meta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
          <a href="${esc(p.url)}" class="text-link"${ext(p)}>${esc(p.cta)} ${p.external ? '↗' : '→'}</a>
        </div>
      </article>`;
    }).join('');
  }

  // Open source: featured repos
  const featured = document.querySelector('[data-render="featured"]');
  if (featured) {
    featured.innerHTML = ['dev-loop', 'claude-prototype'].map(n => D.repos.find(r => r.name === n)).map(r => `
      <li class="row g12">
        <span class="r-name">${esc(r.name)}</span>
        <span class="r-desc">${esc(r.desc)}<span class="meta-row"><span>${esc(r.lang)}</span>${r.stars ? `<span>${r.stars} stars</span>` : ''}<span>Updated ${fmtDate(r.pushed)}</span></span></span>
        <span class="r-links"><a class="text-link" href="https://github.com/kurenn/${r.name}" target="_blank" rel="noopener">Repository ↗</a><a class="text-link" href="https://github.com/kurenn/${r.name}/issues" target="_blank" rel="noopener">Issues ↗</a></span>
      </li>`).join('');
  }

  // Open source: repo list (search + language filter, full state matrix)
  const list = document.querySelector('[data-render="repos"]');
  const repoState = { q: '', lang: 'All' };
  function renderRepos() {
    if (!list) return;
    const q = repoState.q.trim().toLowerCase();
    const rows = D.repos.filter(r =>
      (repoState.lang === 'All' || r.lang === repoState.lang) &&
      (!q || r.name.includes(q) || r.desc.toLowerCase().includes(q)));
    const count = document.querySelector('[data-repo-count]');
    if (count) count.textContent = `${rows.length} of ${D.repos.length}`;
    if (!rows.length) {
      const what = [repoState.q && `“${esc(repoState.q)}”`, repoState.lang !== 'All' && esc(repoState.lang)].filter(Boolean).join(' in ');
      list.innerHTML = `
        <li class="state state--empty">
          <p class="state-title">No repositories match ${what}.</p>
          <button class="text-link" data-repos-clear>Clear search</button>
        </li>`;
      return;
    }
    list.innerHTML = rows.map(r => `
      <li class="repo-item"><a href="https://github.com/kurenn/${r.name}" target="_blank" rel="noopener">
        <span class="r-name">${esc(r.name)}</span>
        <span class="r-desc">${esc(r.desc)}</span>
        <span class="r-meta r-lang">${esc(r.lang)}</span>
        <span class="r-meta">${r.stars ? r.stars + ' ★' : ''}</span>
        <span class="r-meta r-pushed">${fmtDate(r.pushed)}</span>
      </a></li>`).join('');
  }
  if (list) {
    const langs = ['All', ...new Set(D.repos.map(r => r.lang))];
    const chips = document.querySelector('[data-render="lang-chips"]');
    chips.innerHTML = langs.map(l => `<button class="filter${l === 'All' ? ' is-active' : ''}" data-lang="${esc(l)}" aria-pressed="${l === 'All'}">${esc(l)}</button>`).join('');
    const search = document.querySelector('[data-repo-search]');
    const fromUrl = window.State?.get('lang');
    if (fromUrl && langs.includes(fromUrl)) repoState.lang = fromUrl;
    if (window.State?.get('q')) { repoState.q = window.State.get('q'); search.value = repoState.q; }
    const syncChips = () => chips.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.dataset.lang === repoState.lang;
      b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on));
    });
    syncChips();
    chips.addEventListener('click', e => {
      const b = e.target.closest('[data-lang]'); if (!b) return;
      repoState.lang = b.dataset.lang; syncChips();
      window.State?.set('lang', repoState.lang === 'All' ? null : repoState.lang);
      renderRepos();
    });
    search.addEventListener('input', () => {
      repoState.q = search.value;
      window.State?.set('q', repoState.q || null);
      renderRepos();
    });
    list.addEventListener('click', e => {
      if (e.target.closest('[data-repos-clear]')) {
        repoState.q = ''; repoState.lang = 'All'; search.value = '';
        window.State?.set('q', null); window.State?.set('lang', null);
        syncChips(); renderRepos(); search.focus();
      }
    });
    renderRepos();
  }

  // Contact form: prefill from ?topic=, draft persistence, blur validation, send via mailto
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const KEY = 'kurenn-contact-draft';
    const fields = ['name', 'message'].map(n => form.elements[n]);
    try {
      const draft = JSON.parse(localStorage.getItem(KEY) || '{}');
      fields.forEach(f => { if (draft[f.name]) f.value = draft[f.name]; });
    } catch {}
    const topic = window.State?.get('topic');
    const project = D.projects.find(p => p.id === topic);
    if (project && !form.elements.message.value) form.elements.message.value = `About ${project.name}: `;
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(fields.map(f => [f.name, f.value])))); } catch {} };
    const rules = {
      name: v => v.trim() ? '' : 'Add your name',
      message: v => v.trim().length >= 10 ? '' : 'Write at least a sentence',
    };
    const check = f => {
      const msg = rules[f.name](f.value);
      const wrap = f.closest('.form-field');
      wrap.classList.toggle('has-error', !!msg);
      wrap.querySelector('.error').textContent = msg;
      f.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    };
    fields.forEach(f => {
      f.addEventListener('blur', () => { if (f.value) check(f); });
      f.addEventListener('input', () => { save(); if (f.closest('.has-error')) check(f); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = fields.filter(f => !check(f));
      if (bad.length) { bad[0].focus(); return; }
      // ponytail: mailto hands delivery to the visitor's mail app; swap for a form endpoint if drop-off shows up
      const name = form.elements.name.value.trim();
      location.href = `mailto:${D.links.email}?subject=${encodeURIComponent('Hello from kurenn.dev — ' + name)}&body=${encodeURIComponent(form.elements.message.value.trim())}`;
      const sent = document.querySelector('[data-sent]');
      sent.querySelector('[data-sent-name]').textContent = name.split(' ')[0];
      form.hidden = true; sent.hidden = false;
      sent.querySelector('h2').focus();
      try { localStorage.removeItem(KEY); } catch {}
    });
    document.querySelector('[data-send-another]')?.addEventListener('click', () => {
      form.reset(); form.hidden = false; document.querySelector('[data-sent]').hidden = true; form.elements.name.focus();
    });
  }

  // Copy email
  document.querySelectorAll('[data-copy-email]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); window.UI?.copyButton(b, D.links.email);
  }));

  document.addEventListener('click', e => {
    const m = e.target.closest('[data-modal].open');
    if (m && e.target === m) closeModal(m); // backdrop click
  });

  // Modals.
  // triggerEl is whatever the user clicked to open it (undefined on a
  // hydrate-from-URL open); UI.trapFocus/releaseFocus own focus while the
  // modal is open, Esc and this wiring decide *when* it closes.
  function openModal(name, triggerEl) {
    const m = document.querySelector(`[data-modal="${name}"]`);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    window.UI?.trapFocus(m, triggerEl);
  }
  function closeModal(m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    window.State?.set('modal', null);
    window.UI?.releaseFocus(m);
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.openModal;
      window.State?.set('modal', name);
      openModal(name, btn);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.closest('[data-modal]');
      if (m) closeModal(m);
    });
  });
  // Esc closes whichever modal is open — completes the a11y floor
  // (SKILL.md: "moves focus in, traps Tab, restores focus on close; Esc closes").
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('[data-modal].open');
    if (open) closeModal(open);
  });

  // Hydrate interactive state from URL on load
  window.State?.hydrate({
    modal: (v) => v && openModal(v),
  });

  // Expose for console debugging
  window.App = { openModal, closeModal };
})();
