(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var top = document.querySelector('.top');
  if (!top) return;
  var canvas = document.createElement('canvas');
  canvas.id = 'px'; canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  var nav = top.querySelector('.sections');
  if (!nav) {
    nav = document.createElement('nav'); nav.className = 'sections';
    nav.setAttribute('aria-label', 'Primary');
    nav.innerHTML = '<a href="index.html" aria-current="page">Home</a><a href="manifesto.html">Manifesto</a><a href="projects.html">Projects</a><a href="open-source.html">Open source</a><a href="https://blog.kurenn.dev">Blog</a><a href="contact.html">Contact</a>';
    top.appendChild(nav);
    var fitBox = document.createElement('div'); fitBox.className = 'fit';
    var logo = document.createElement('pre'); logo.className = 'fitted logo';
    logo.setAttribute('role', 'img'); logo.setAttribute('aria-label', 'KURENN');
    logo.textContent = '██╗  ██╗██╗   ██╗██████╗ ███████╗███╗   ██╗███╗   ██╗\n██║ ██╔╝██║   ██║██╔══██╗██╔════╝████╗  ██║████╗  ██║\n█████╔╝ ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██╔██╗ ██║\n██╔═██╗ ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██║╚██╗██║\n██║  ██╗╚██████╔╝██║  ██║███████╗██║ ╚████║██║ ╚████║\n╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝';
    fitBox.appendChild(logo); top.insertBefore(fitBox, top.firstChild);
  } else {
    var home = document.createElement('a'); home.href = 'index.html'; home.textContent = 'Home'; nav.prepend(home);
    var blog = document.createElement('a'); blog.href = 'https://blog.kurenn.dev'; blog.textContent = 'Blog'; nav.insertBefore(blog, nav.lastElementChild);
    var name = top.querySelector('.name');
    if (name) { var mark = document.createElement('span'); mark.textContent = 'kurenn'; mark.className = 'site-mark'; name.prepend(mark); }
  }
  function fit() {
    document.querySelectorAll('pre.fitted').forEach(function (pre) {
      var box = pre.parentElement;
      var inner = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
      pre.style.fontSize = '16px';
      var natural = pre.scrollWidth;
      if (natural) pre.style.fontSize = Math.min(16 * inner / natural, 17) + 'px';
    });
  }
  fit(); addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  if (logo && !reduced.matches) {
    var finalText = logo.textContent, lines = finalText.split('\n');
    var width = Math.max.apply(null, lines.map(function (line) { return line.length; }));
    var noise = '░▒▓▖▗▘▙▚▛▜▝▞▟■▪◆◇○●';
    var lock = lines.map(function (line) { return Array.from(line, function (ch, x) { return ch === ' ' ? 0 : 250 + x / width * 1100 + Math.random() * 500; }); });
    var start = null;
    requestAnimationFrame(function frame(now) {
      if (reduced.matches) { logo.textContent = finalText; return; }
      if (start === null) start = now;
      var t = now - start, done = true, out = '';
      lines.forEach(function (line, y) {
        Array.from(line).forEach(function (ch, x) {
          if (ch === ' ' || t >= lock[y][x]) { out += ch; return; }
          done = false; out += '<span class="' + (t > lock[y][x] - 250 ? 's2' : 's') + '">' + noise[Math.floor(Math.random() * noise.length)] + '</span>';
        });
        if (y < lines.length - 1) out += '\n';
      });
      logo.innerHTML = out;
      if (!done) requestAnimationFrame(frame); else logo.textContent = finalText;
    });
  }
  var ctx = canvas.getContext('2d'), CELL = 14, DOT = 10, GAP = 48, cells = [];
  var dark = ['#1f2335', '#24283b', '#292e42', '#414868'];
  var lit = ['#7aa2f7', '#bb9af7', '#3d59a1'];
  function roll(cell) { var r = Math.random(); cell.fill = r > Math.pow(cell.d, 1.6) * 0.6 ? null : Math.random() < 0.07 ? lit[Math.floor(Math.random() * lit.length)] : dark[Math.floor(Math.random() * dark.length)]; }
  function draw(cell) { ctx.clearRect(cell.x, cell.y, CELL, CELL); if (cell.fill) { ctx.fillStyle = cell.fill; ctx.fillRect(cell.x, cell.y, DOT, DOT); } }
  function field() {
    var dpr = devicePixelRatio || 1, w = innerWidth, h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rect = document.querySelector('main').getBoundingClientRect(), left = rect.left - GAP, right = rect.right + GAP;
    cells = []; if (w <= 900 || left < CELL * 3 || right >= w) return;
    for (var x = 0; x < w; x += CELL) {
      var d = x + CELL <= left ? (left - x) / left : x >= right ? (x - right + CELL) / (w - right) : -1;
      if (d < 0) continue;
      for (var y = 0; y < h; y += CELL) { var cell = { x: x, y: y, d: d }; roll(cell); draw(cell); cells.push(cell); }
    }
  }
  field(); addEventListener('resize', field);
  setInterval(function () { if (reduced.matches) return; for (var i = 0, n = Math.ceil(cells.length * 0.015); i < n; i++) { var cell = cells[Math.floor(Math.random() * cells.length)]; roll(cell); draw(cell); } }, 120);
})();