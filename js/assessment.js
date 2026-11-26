/*
 * AI engineering assessment. No network: answers live in sessionStorage,
 * everything is inserted with textContent, the call card is a mailto: link.
 */
(function () {
  'use strict';

  var EMAIL = 'kuri@coba.ai';
  var KEY = 'kurenn-assessment';
  var MAX = 3;

  var WHO = {
    solo: { label: 'Solo developer', ctx: 'I’m a solo developer, and I' },
    team: { label: 'Small engineering team (2–20)', ctx: 'I’m on a small engineering team (2–20 people), and we' },
    org: { label: 'Engineering org (20+)', ctx: 'I’m in an engineering org (20+ people), and we' }
  };
  var USE = {
    autocomplete: { label: 'Autocomplete and chat', ctx: 'use AI for autocomplete and chat' },
    tasks: { label: 'Coding agents on individual tasks (Claude Code, Codex, Cursor)', ctx: 'run coding agents on individual tasks (Claude Code, Codex, Cursor)' },
    prs: { label: 'Agents open pull requests on their own', ctx: 'let agents open pull requests on their own' },
    production: { label: 'Agents run inside production workflows', ctx: 'run agents inside production workflows' }
  };

  var PROBLEMS = {
    review: {
      label: 'Agent output doesn’t survive review',
      title: 'Gate it before a human looks.',
      body: 'The first reader of agent output is usually a person, and that is the expensive part. I put a gate in front of that person. The agent plans first, then implements, then a deterministic check runs: tests, lint, types. An adversarial reviewer then reads the diff looking for problems, not for a reason to approve. Serious findings go back for a fix round. A human reads only what passed, so review time goes to judgment calls.',
      seen: 'dev-loop: plan, implement, gate, adversarial review, rate. The reviewer looks for what’s wrong, not for a reason to approve.',
      link: 'https://github.com/kurenn/dev-loop',
      idea: 'Plan first, implement, then run a deterministic gate (tests, lint, types) and an adversarial review that hunts for problems, with a fix round for serious findings. A human only reads what passed.',
      steps: [
        'Read this repo’s current workflow and list where changes get reviewed, and by whom.',
        'Add a plan step: before any code, write a short plan and check it against the task.',
        'Add a deterministic gate that runs tests, lint and type checks and must pass before review starts.',
        'Add an adversarial review pass whose prompt hunts for defects and missing cases, plus a fix round for serious findings.',
        'Document the loop in AGENTS.md or CLAUDE.md so every agent run follows it.'
      ],
      rule: 'Show me the plan before changing any files.'
    },
    cost: {
      label: 'Model bills keep climbing',
      title: 'Tier the models.',
      body: 'A single frontier model doing everything is the simplest setup and the most expensive one. I split the work by tier. The expensive model plans and reviews, because that is where judgment matters. Cheaper models take bounded implementation units, each with a written spec that says which files to touch and what done looks like. Before you switch anything, run both setups on a handful of your own tasks and compare cost and rework. Benchmarks from other repos won’t transfer.',
      seen: 'roundhouse: a tiered Sonnet team ran 7–34× cheaper than a single-agent setup on 10 Rails tasks.',
      link: 'https://github.com/kurenn/roundhouse',
      idea: 'The expensive model plans and reviews. Cheaper models do bounded implementation units from a written spec. Measure on your own tasks before switching.',
      steps: [
        'List the kinds of agent tasks this repo gets and mark each as planning, implementation or review.',
        'Propose a tier split: the strongest model for plans and reviews, cheaper models for bounded implementation units.',
        'Write a spec template for an implementation unit: files to touch, acceptance checks, what is out of scope.',
        'Pick five recent tasks and define how to compare cost, rework and review rounds between the current setup and the tiered one.',
        'Recommend a switch only if the numbers on those tasks support it, and show what they said.'
      ],
      rule: 'Ask one question at a time.'
    },
    context: {
      label: 'Agents forget and repeat mistakes',
      title: 'Write it where the agent reads it.',
      body: 'Agents start every session with no memory, so anything you told one yesterday is gone. I keep a short context file, AGENTS.md or CLAUDE.md, with the rules that matter. Next to it sit a decision log and a learnings file, and every review finding gets promoted into the learnings file so the same mistake costs you once. Check the size limit of your tool’s loader. Past it, content gets dropped without a warning.',
      seen: 'A context file that grew past its loader’s limit had its middle silently dropped. The rules in it stopped reaching the agent and nothing errored.',
      link: '',
      idea: 'Keep a short context file (AGENTS.md / CLAUDE.md) with the rules, a decision log, and a learnings file that every review finding gets promoted into. Keep it under the tool’s size limit.',
      steps: [
        'Find any AGENTS.md, CLAUDE.md or similar context files and report each one’s size against the tool’s loader limit.',
        'Draft a short rules file containing only the rules an agent would break if nobody told it.',
        'Create a decision log with one line per decision: what was chosen, why, and when.',
        'Create a learnings file and move into it the review findings that have repeated.',
        'Add a step to the review process that promotes each new finding into the learnings file, and a check that the context file stays under the size limit.'
      ],
      rule: 'Keep every file short, and ask before deleting anything.'
    },
    unattended: {
      label: 'Scheduled agents fail silently',
      title: 'Claim first, retry only what you can prove failed.',
      body: 'A scheduled agent has no one watching it, so failure has to be handled in the design. Record the run before it starts, so a second trigger can’t fire the same job twice. When a run fails, check what actually happened before retrying; a timeout often means the work went through. Send failures to a place a person looks, and configure a fallback provider for when the primary rate-limits.',
      seen: 'A rate limit wiped four scheduled posts in one afternoon. The fix retries only after checking the post really didn’t go out, so a retry can never double-post.',
      link: '',
      idea: 'Record the run before it starts so it can’t double-fire. When it fails, check the real outcome before retrying. Send failures somewhere a person sees them, and set a provider fallback.',
      steps: [
        'Find every scheduled or unattended agent job in this repo and list its trigger, owner and failure path.',
        'Add a claim step that records each run before it starts, so a repeated trigger cannot start it twice.',
        'On failure, check the real outcome in the target system before retrying, and retry only what you can prove failed.',
        'Route failures to a place a person sees, such as a channel, an issue or an email, with the run id and the error.',
        'Configure a fallback provider or model for rate limits and outages, and test it with a forced failure.'
      ],
      rule: 'Do not retry anything with external side effects until I confirm how to check its outcome.'
    },
    tests: {
      label: 'Tests pass, bugs still ship',
      title: 'Make the gate check behaviour.',
      body: 'A coding agent will satisfy whatever the gate measures. If the gate is a green test run, the cheapest way to green is sometimes to delete or weaken the test. So the gate has to check behaviour. For bug fixes I require a failing test first, then the fix. Test changes get their own diff in review, and a removed test counts as a finding until someone explains it. Coverage numbers alone won’t catch any of this.',
      seen: 'An endpoint with its tests deleted got a different verdict from the same reviewer 3, 0 and 3 times out of 10. More reasoning effort didn’t make it steadier.',
      link: 'https://blog.kurenn.dev/posts/the-second-opinion-i-deleted/',
      idea: 'Agents satisfy whatever the gate measures, including by deleting or weakening tests. Require a failing test first for bug fixes, diff test changes in review, and treat removed tests as a finding.',
      steps: [
        'Look at the last ten bug fixes and note which shipped with a test that failed before the fix.',
        'Add a rule that a bug fix needs a failing test first, committed or shown before the fix.',
        'Make test changes visible in review by listing added, modified and removed tests separately.',
        'Treat any removed or weakened test (skipped, loosened assertion) as a finding that needs a written reason.',
        'Prove the gate works: delete a test from a known-good change and confirm the gate or review flags it.'
      ],
      rule: 'Show me the plan before changing any files.'
    },
    access: {
      label: 'Agents have too much access',
      title: 'Decide the blast radius once.',
      body: 'Decide what an agent can touch once, in writing, before it runs. I give agents their own credentials, never mine, so their reach is separate from mine and can be revoked on its own. Risky tools go behind wrappers that refuse dangerous flags and scrub secrets from output before the agent reads it. Every external change is explicit, and the agent reads the result back instead of assuming it landed. Then write the boundary down where the agent loads it.',
      seen: 'A GitHub wrapper that refuses to print tokens and redacts credentials from API responses before the agent sees them.',
      link: '',
      idea: 'Give agents their own credentials, never yours. Route risky tools through wrappers that refuse dangerous flags and scrub secrets from output. Make every external mutation explicit and read it back. Write the boundary down.',
      steps: [
        'List every credential, token and permission an agent can currently reach in this environment.',
        'Propose separate agent credentials with the least access each task needs, and mark mine as off limits.',
        'Wrap risky tools (git push, cloud CLIs, database clients) in scripts that refuse dangerous flags and redact secrets from output.',
        'Make every external change an explicit step, and read back the real state after each one.',
        'Write the boundary into AGENTS.md or CLAUDE.md: what is allowed, what is refused, and who to ask.'
      ],
      rule: 'Do not create or rotate any credential without asking me first.'
    },
    ui: {
      label: 'Generated UI feels off',
      title: 'Read only the words.',
      body: 'Generated screens tend to narrate themselves: a button labelled “Click here to submit”, a heading that explains the form below it. Reading only the words on a screen shows this fast. Give the agent copy rules with a bad and a good example for each, and finish every build with a copy sweep: grep for the known patterns, then one read-through. The sweep is cheap and catches the part of the output that no test looks at.',
      seen: 'Eleven A/B prototype builds all had screens describing their own controls. A copy sweep now flags all eleven and none of the clean starter screens.',
      link: 'https://github.com/kurenn/claude-prototype',
      idea: 'Generated screens narrate themselves. Give the agent copy rules with bad and good examples, and run a copy sweep (grep for known patterns plus one read) at the end of every build.',
      steps: [
        'Read the screens this repo generates and quote any copy that describes its own controls or layout.',
        'Write copy rules for this repo, each with a bad and a good example: labels, empty states, errors.',
        'Add a copy sweep script that greps templates and components for the known bad patterns.',
        'Run the sweep on the current screens and fix what it finds.',
        'Add the sweep, then one read-through of the visible words, to the end of every build task.'
      ],
      rule: 'Change only user-visible text; do not touch layout or logic.'
    },
    measure: {
      label: 'We can’t tell if it’s working',
      title: 'Measure before you add a check.',
      body: 'Every extra check sounds sensible when you add it. Before adding one, write down the case it catches and find a real example from your own history. If you can’t find one, the check is a cost with no benefit. Then count what matters per change: rework, review rounds, time to merge. Prompt counts and token totals measure activity only. Keep the numbers next to the change that moved them.',
      seen: 'A second reviewer sounded careful. 180 measured calls showed it would fire on almost every run for a case nobody could point to, so it came out.',
      link: 'https://blog.kurenn.dev/posts/the-second-opinion-i-deleted/',
      idea: 'For every extra step, write down the case it catches and find a real example. Count what matters per change (rework, review rounds, time to merge), not prompts.',
      steps: [
        'For each automated check or review step in this workflow, write down the case it is supposed to catch.',
        'Find a real example of that case in the repo history, and flag every check with none.',
        'Choose three per-change measures: rework, review rounds and time to merge.',
        'Pull those numbers for the last twenty merged changes and show them in a table.',
        'Recommend which checks to keep, drop, or measure for another month.'
      ],
      rule: 'Show me the numbers before recommending anything.'
    }
  };
  var ORDER = ['review', 'cost', 'context', 'unattended', 'tests', 'access', 'ui', 'measure'];

  var form = document.querySelector('[data-as-form]');
  var lede = document.querySelector('[data-as-lede]');
  var results = document.getElementById('as-results');
  var errorEl = document.getElementById('as-error');
  var countEl = document.getElementById('as-count');
  var live = document.getElementById('as-live');
  if (!form || !results) return;

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function has(map, k) { return Object.prototype.hasOwnProperty.call(map, k); }

  function loadSaved() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!s || !has(WHO, s.who) || !has(USE, s.use) || !Array.isArray(s.problems)) return null;
      var seen = {}, probs = [];
      s.problems.forEach(function (p) {
        if (has(PROBLEMS, p) && !seen[p] && probs.length < MAX) { seen[p] = 1; probs.push(p); }
      });
      if (!probs.length) return null;
      return { who: s.who, use: s.use, problems: probs };
    } catch (e) { return null; }
  }
  function save(a) { try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function clearSaved() { try { sessionStorage.removeItem(KEY); } catch (e) {} }

  function contextLine(a) {
    return 'Context: I took the engineering assessment on kurenn.dev. ' + WHO[a.who].ctx + ' ' + USE[a.use].ctx + '.';
  }

  function buildPrompt(a, p) {
    var lines = [contextLine(a), '', 'Problem: ' + p.label + '.', 'Idea: ' + p.idea, '', 'Do this in my repo, in order:'];
    p.steps.forEach(function (s, i) { lines.push((i + 1) + '. ' + s); });
    lines.push('', p.rule);
    return lines.join('\n');
  }

  function mailtoHref(a) {
    var body = [
      'Hi Abraham,',
      '',
      'I took the AI engineering assessment on kurenn.dev.',
      '',
      'What I’m working with: ' + WHO[a.who].label,
      'How AI fits today: ' + USE[a.use].label,
      'What’s breaking: ' + a.problems.map(function (k) { return PROBLEMS[k].label; }).join('; '),
      '',
      'I’d like to go through it on a call.',
      ''
    ].join('\n');
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('kurenn.dev assessment') + '&body=' + encodeURIComponent(body);
  }

  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  function selectText(node) {
    try {
      var r = document.createRange();
      r.selectNodeContents(node);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) {}
  }

  function wireCopy(btn, pre, text) {
    var original = btn.textContent;
    var timer;
    function reset() { btn.textContent = original; }
    function done() {
      btn.textContent = 'Copied';
      announce('Copied');
      clearTimeout(timer);
      timer = setTimeout(reset, 1500);
    }
    function fallback() {
      selectText(pre);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) { done(); return; }
      announce('Text selected. Press Ctrl+C or Cmd+C to copy.');
      btn.textContent = 'Press Ctrl/Cmd+C';
      clearTimeout(timer);
      timer = setTimeout(reset, 4000);
    }
    btn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  function card(a, key) {
    var p = PROBLEMS[key];
    var art = el('article', 'tile as-card');
    var hid = 'as-card-' + key;
    art.setAttribute('aria-labelledby', hid);
    art.appendChild(el('p', 'meta as-said', 'You said: ' + p.label.toLowerCase()));
    var h = el('h2', 'as-title', p.title);
    h.id = hid;
    art.appendChild(h);
    art.appendChild(el('p', 'as-body', p.body));

    var seen = el('p', 'as-seen');
    seen.appendChild(el('strong', null, 'Seen: '));
    seen.appendChild(document.createTextNode(p.seen));
    art.appendChild(seen);

    if (p.link) {
      var rel = el('p', 'as-related');
      rel.appendChild(el('strong', null, 'Related: '));
      var link = el('a', null, p.link.replace(/^https?:\/\//, '') + ' ↗');
      link.href = p.link;
      link.target = '_blank';
      link.rel = 'noopener';
      rel.appendChild(link);
      art.appendChild(rel);
    }

    var text = buildPrompt(a, p);
    var det = el('details', 'as-prompt-wrap');
    det.appendChild(el('summary', null, 'Prompt for your agent'));
    var pre = el('pre', 'as-prompt', text);
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', 'Prompt for your agent: ' + p.label);
    det.appendChild(pre);
    var btn = el('button', 'btn', 'Copy');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy prompt: ' + p.label);
    det.appendChild(btn);
    art.appendChild(det);
    wireCopy(btn, pre, text);
    return art;
  }

  function showResults(a, moveFocus) {
    results.textContent = '';
    var h = el('h2', 'as-results-h', 'Your fixes');
    h.id = 'as-results-h';
    h.tabIndex = -1;
    results.appendChild(h);
    results.appendChild(el('p', 'meta', 'In the order you picked them. Open a prompt, copy it, and paste it into your agent from the root of your repo.'));

    a.problems.forEach(function (k) { results.appendChild(card(a, k)); });

    var call = el('section', 'tile as-call');
    call.setAttribute('aria-labelledby', 'as-call-h');
    var ch = el('h2', 'as-title', 'Want to go through it on a call?');
    ch.id = 'as-call-h';
    call.appendChild(ch);
    call.appendChild(el('p', null, 'Send me your answers and we can walk through them together. The link opens your email app with the message ready to send.'));
    var actions = el('div', 'actions');
    var mail = el('a', 'btn', 'Email me about it →');
    mail.href = mailtoHref(a);
    actions.appendChild(mail);
    call.appendChild(actions);
    var fb = el('p', 'meta');
    fb.appendChild(document.createTextNode('Nothing opened? Write to '));
    var addr = el('a', null, EMAIL);
    addr.href = 'mailto:' + EMAIL;
    fb.appendChild(addr);
    fb.appendChild(document.createTextNode('.'));
    call.appendChild(fb);
    results.appendChild(call);

    var again = el('div', 'actions');
    var restart = el('button', 'btn', 'Start over');
    restart.type = 'button';
    restart.setAttribute('data-as-restart', '');
    restart.addEventListener('click', startOver);
    again.appendChild(restart);
    results.appendChild(again);

    form.hidden = true;
    if (lede) lede.hidden = true;
    results.hidden = false;
    if (moveFocus) {
      h.focus({ preventScroll: true });
      h.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function readForm() {
    var who = form.querySelector('input[name="who"]:checked');
    var use = form.querySelector('input[name="use"]:checked');
    var probs = Array.prototype.map.call(form.querySelectorAll('input[name="problem"]:checked'), function (i) { return i.value; });
    return { who: who ? who.value : '', use: use ? use.value : '', problems: probs };
  }

  function syncChecks() {
    var boxes = form.querySelectorAll('input[name="problem"]');
    var n = form.querySelectorAll('input[name="problem"]:checked').length;
    Array.prototype.forEach.call(boxes, function (b) { b.disabled = n >= MAX && !b.checked; });
    if (countEl) countEl.textContent = n + ' of ' + MAX + ' selected.';
  }

  function showError(msg) {
    errorEl.textContent = msg;
  }

  function startOver() {
    clearSaved();
    form.reset();
    syncChecks();
    showError('');
    results.hidden = true;
    results.textContent = '';
    form.hidden = false;
    if (lede) lede.hidden = false;
    var first = form.querySelector('input[name="who"]');
    if (first) first.focus();
    announce('Questions restored.');
  }

  form.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'problem') syncChecks();
    showError('');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = readForm();
    var missing = [];
    if (!a.who) missing.push('question 1');
    if (!a.use) missing.push('question 2');
    if (!a.problems.length) missing.push('question 3 (pick at least one)');
    if (missing.length) {
      showError('Please answer ' + missing.join(', ') + ' before continuing.');
      return;
    }
    showError('');
    save(a);
    showResults(a, true);
  });

  // Reveal the questions (hidden until JS is available), then restore saved results.
  form.hidden = false;
  syncChecks();
  var saved = loadSaved();
  if (saved) showResults(saved, false);
  else clearSaved();
})();
