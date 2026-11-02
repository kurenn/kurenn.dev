# DESIGN — kurenn.dev / variant: index

**Direction: "The index."** Swiss minimal. A gallery wall more than a website: ink on bone, one family, and very large type that does the navigating. No color.

**Worldview (copy spine):** "I believe AI will make the world better, and these are the systems I'm building toward it." The index lists the belief and the systems as one ordered set, 01–06.

## Color: none
Tokens: `surface · elevated · elevated-2 · ink · ink2 · ink3 · hairline · muted · accent · accent-ink`
- **bone** (default, light): `#F6F5F1 · #FBFAF7 · #EDEBE6 · #111110 · #4A4945 · #6E6C66 · #DEDCD6 · #A3A19A · #111110 · #F6F5F1`
- **carbon** (dark): `#111110 · #191917 · #222220 · #EEEDE9 · #A9A7A1 · #8C8A84 · #2A2927 · #55534F · #EEEDE9 · #111110`
Accent = ink. Primary button = solid ink. Status: shipping = filled ink dot, building = outlined dot. Error text is the only hue (validation and the GitHub-down state).

## Typography
**Instrument Sans** only (400/500/600), tabular numerals, hierarchy from size and weight alone. Index items at `clamp(2.25rem, min(5.4vw, 10vh), 5.75rem)`, weight 500, tracking −0.035em. Metadata: 12px uppercase, tracked +0.08em, ink3. No mono.

## Grid, spacing, depth
12-column grid (24px gutters, 1360px max, 40px side margins; 20px on phones). Strict left alignment. Hairline rules only between sections and list rows. Radius 0, no shadows, no cards, no boxed tables.

## Layout
- **index** (default): home = numbered index (cols 1–7) + detail pane (cols 9–12). The pane shows the belief at rest and swaps on hover/focus to the hovered item's promise, first sentence, status, date and link.
- **list**: the belief sits above the index; every row shows its promise inline; no pane. Projects collapse to name + promise; repo rows drop descriptions. Below 960px every screen uses list behavior.
- Nav: no top bar on home ("Abraham Kuri" left, "Contact" right; the index *is* the nav). Inner pages: name left, numbered section links right (`01 Manifesto · 02 Projects · 03 Open source · 04 Contact`), current one underlined.

## Motion: calm
Pane crossfade (opacity only, 180ms out / 240ms in), sibling index items dim to ink3 on hover, underline-color transitions. The manifesto overlay fades in; no slides. Reduced motion: instant swaps.

## Icons & imagery
None. Text links ("GitHub · X · LinkedIn", "↗" for external) replace icons. No imagery.

## Signature move
**The index as navigation:** six enormous numbered lines, and a quiet pane beside them that answers "what is this?" for whatever your cursor is on.
