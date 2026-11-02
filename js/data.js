/*
 * Data layer — every project, repo and manifesto section lives here.
 * app.js renders the lists (systems board, project sections, repo table, manifesto) from it.
 */
(function () {
  const DATA = {
    links: {
      github: 'https://github.com/kurenn',
      x: 'https://x.com/kurenn',
      linkedin: 'https://www.linkedin.com/in/abraham-kuri-vargas-b41a2126/',
      email: 'kuri@coba.ai',
    },

    // Order is the brief's order: DevLoop first (speaks to developers).
    projects: [
      {
        id: 'devloop', name: 'DevLoop', short: 'Build with confidence.',
        promise: 'Create reliable code that ships in one shot.',
        body: 'DevLoop is an attempt to create a virtuous development flow where developers can move quickly, experiment with AI, and still feel confident in the code they ship.',
        status: 'shipping', state: 'Open source', updated: '2026-10-13',
        loop: ['plan', 'critique', 'build', 'gate', 'review', 'rate', 'PR'],
        meta: [['Repo', 'kurenn/dev-loop'], ['Runs in', 'Claude Code'], ['Language', 'Python']],
        cta: 'Explore DevLoop', url: 'https://github.com/kurenn/dev-loop', external: true,
      },
      {
        id: 'olympus', name: 'Olympus', short: 'Automate workflows.',
        promise: 'Automate any business workflow imaginable.',
        body: 'Olympus gives people across an organization the ability to delegate work to AI, connect company knowledge, and automate the workflows that consume their time, so they can spend more of their lives doing meaningful work.',
        status: 'building', state: 'In development', updated: null,
        loop: ['delegate', 'connect', 'automate'],
        meta: [['For', 'Whole organizations'], ['Access', 'Private']],
        cta: 'Explore Olympus', url: 'https://tryolympus.ai', external: true,
      },
      {
        id: 'coba', name: 'Coba', short: 'Make transactions seamless.',
        promise: 'Make US–Mexico transactions seamless.',
        body: 'Coba exists because financial institutions should work better. It is an attempt to remove the friction, fragmentation, and outdated processes that make moving money between the United States and Mexico unnecessarily difficult.',
        status: 'building', state: 'In development', updated: null,
        loop: ['USD', 'MXN'],
        meta: [['Corridor', 'United States ↔ Mexico'], ['Access', 'Private']],
        cta: 'Explore Coba', url: 'https://www.coba.ai/', external: true,
      },
      {
        id: 'claude-prototype', name: 'Claude Prototype', short: 'Make beautiful prototypes.',
        promise: 'Create beautiful prototypes that can become real products.',
        body: 'Claude Prototype helps developers create prototypes that do not feel like AI slop: prototypes beautiful enough for demos and structured well enough to continue toward production.',
        status: 'shipping', state: 'v0.12.0', updated: '2026-10-28',
        loop: ['discover', 'build', 'assess', 'ship'],
        meta: [['Repo', 'kurenn/claude-prototype'], ['Runs in', 'Claude Code'], ['Build step', 'None']],
        cta: 'Explore Claude Prototype', url: 'https://github.com/kurenn/claude-prototype', external: true,
      },
    ],

    // Real public repos (github.com/kurenn), most recently pushed first.
    repos: [
      { name: 'claude-prototype', lang: 'HTML', stars: 8, pushed: '2026-10-28', desc: 'A Claude Code skill to prototype web apps end-to-end with zero build step.' },
      { name: 'dev-loop', lang: 'Python', stars: 0, pushed: '2026-10-13', desc: 'The virtuous development loop for Rails: Opus plan, Sonnet army, Codex review, Opus rating, fix, PR.' },
      { name: 'dossier-cli', lang: 'Go', stars: 0, pushed: '2026-10-08', desc: 'Command-line client for a Dossier vault’s API. Single static binary, every share with an expiry.' },
      { name: 'trawl', lang: 'Rust', stars: 0, pushed: '2026-10-07', desc: 'Sync Google Drive and pCloud folders by link into a local library. Tauri v2 + React.' },
      { name: 'roundhouse', lang: 'Shell', stars: 1, pushed: '2026-09-18', desc: 'Rails specialist team for Claude Code. 7–34× cheaper than claude-on-rails across 10 tasks.' },
      { name: 'trove', lang: 'TypeScript', stars: 2, pushed: '2026-09-17', desc: 'Self-hosted desktop library for 3D-print models. Tauri v2 + React.' },
      { name: 'slack-tui', lang: 'Go', stars: 3, pushed: '2026-09-14', desc: 'A keyboard-first, vim-modal Slack client for your terminal.' },
      { name: 'omacall', lang: 'Rust', stars: 0, pushed: '2026-09-10', desc: 'Peer-to-peer video calls between machines. No account, no server, no third party.' },
      { name: 'murmur', lang: 'TypeScript', stars: 3, pushed: '2026-06-25', desc: 'Local-first voice-to-text dictation with whisper.cpp.' },
      { name: 'colorplate', lang: 'Python', stars: 3, pushed: '2026-06-09', desc: 'Turn SVG/PNG logos into layered, gap-free multicolor STL plates.' },
      { name: 'rails-audit', lang: 'Ruby', stars: 2, pushed: '2026-05-07', desc: 'Rails stability audit skill: 18 dimensions, severity-ranked report, fix sequence.' },
      { name: 'boorails', lang: 'Shell', stars: 9, pushed: '2026-05-05', desc: 'Rails review skills for Claude Code.' },
      { name: 'patchcaptain', lang: 'Ruby', stars: 1, pushed: '2026-03-11', desc: 'Captures Rails exceptions and opens a pull request with an AI-proposed fix.' },
    ],

    notes: [
      { title: 'field-notes', desc: 'What running AI agents against real codebases actually taught me: the failures, the bills, and the checks that turned out to be lying.', url: 'https://github.com/kurenn/field-notes' },
      { title: 'roundhouse / BENCHMARK.md', desc: 'How a tiered Sonnet team compares with a single-agent swarm on 10 representative Rails tasks.', url: 'https://github.com/kurenn/roundhouse/blob/main/BENCHMARK.md' },
    ],

    manifesto: {
      title: 'I believe AI will take over the world. In a good way.',
      signed: 'Abraham Kuri · October 2026',
      sections: [
        { id: 's1', h: 'It will reshape the work we do.', p: [
          'AI is going to change industries and the jobs inside them. The change is already here: in the code I write, in how teams plan, in what companies decide to hire for. Pretending otherwise protects nobody.',
        ] },
        { id: 's2', h: 'Parts of it will hurt.', p: [
          'Some roles will shrink before new ones are obvious. People who did everything right will feel the floor move under them. Optimism doesn’t mean looking away from that. It means taking the transition seriously enough to build better ways through it.',
        ] },
        { id: 's3', h: 'The long run is worth it.', p: [
          'Every big shift in tools has widened who gets to make things: the printing press, the spreadsheet, the web. AI is the largest version of that pattern I will see in my lifetime.',
          'Over time, I believe what people gain in the ability to make, learn and fix things will outweigh the disruption by a wide margin.',
        ] },
        { id: 's4', h: 'It should make people more capable.', p: [
          'I want AI to give human creativity more reach. A designer who ships the app. An operator who automates the busywork that ate their week. A two-person company that competes like a fifty-person one.',
          'That is the future I want to help build: more people making more of the things they imagine.',
        ] },
        { id: 's5', h: 'Software is still the bottleneck.', p: [
          'Between what someone wants to create and what they can actually build sits a pile of friction. Setup. Glue code. Processes nobody designed. Tools that don’t talk to each other.',
          'That gap is where I spend my time. Every system I build is an attempt to make it smaller.',
        ] },
      ],
      closing: 'The future will not be created by people waiting to see what happens. It will be created by people who start building.',
    },
  };

  window.Data = { all: DATA };
})();
