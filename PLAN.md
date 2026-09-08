# `@pearpages/credit` — plan

Extract the shared "Made by Pere Pages" footer into a published package, so 26 repos stop
re-deriving it by hand.

---

## The decision

**Publish it. Not as a web component. Not as copy-paste.**

A stylesheet that every site shares, plus two ten-line wrappers for the frameworks you
actually use.

---

## Why

The component already exists — `packages/site-kit/src/components/AuthorCard.astro` in the
orchard monorepo (`~/Projects/browser-plugins`). `sk-` is *site-kit*. It is
`private: true` and workspace-only, so nothing outside that monorepo can reach it.

The evidence that this is worth fixing: the heatmap demo's footer was built by reading
orchard's **computed styles in a browser**, because that was the only way to find them.
Against the real source, that copy drifted in five places within an hour:

| | canonical | the hand copy |
| --- | --- | --- |
| tokens | `--sk-ink-soft`, `--sk-accent` | `--page-muted`, `--page-accent` |
| hover | `a:hover { color: var(--sk-accent) }` | **missing entirely** |
| padding | `20px 24px 32px` | `20px 24px 0` |
| credit margin | `0 0 4px` | `0` |
| tagline | `<slot />` | dropped |

Copying by eye does not converge. And `~/Projects` holds 26 repos, so the fixed cost of a
package amortises easily.

---

## What it actually is, plainly

The footer is **two separate things**:

1. **How it looks** — colours, spacing, the pear icon. That is CSS.
2. **The tags on the page** — `<footer><p><img> Made by <a>Pere Pages</a></p></footer>`.
   That is HTML.

CSS cannot create HTML; it can only style HTML that already exists. So one file cannot do
the whole job.

```
credit.css      <- all the LOOK. one file. every site uses this.
react.tsx       <- ~10 lines. writes the HTML for you on React sites.
Credit.astro    <- ~10 lines. writes the HTML for you on Astro sites.
README.md       <- the 6 lines to paste on plain-HTML sites.
```

The CSS is the substance. The wrappers are almost nothing — each just emits those six
tags, so on React and Astro you write `<Credit />` and never touch markup.

> **The analogy.** The CSS is the *paint*. The wrappers are a *stencil*, so you don't draw
> the shape freehand every time. Plain-HTML sites draw freehand — but they use the same
> paint.

Without wrappers, every site pastes the HTML by hand; change the structure and you edit 26
repos. With them, `npm update` changes both the look and the tags.

---

## Why not a web component

It was the obvious candidate — framework-agnostic at runtime — but:

- **It renders client-side**, so the attribution link would be missing from the built HTML
  and gone entirely without JavaScript. Wrong trade for a credit linking to your own site.
- **It puts a script on Astro sites that ship none.** "No analytics, no JS" is part of the
  brand.
- **Shadow DOM fights theming.** The per-site accent colour becomes an API you must design
  and document, instead of a CSS custom property that already works.

Declarative Shadow DOM solves the first point only if something emits it at build time —
which means a framework component anyway, so the web component stops buying anything.

---

## Shape

Repo at `~/Projects/credit` (matches the heatmap convention: repo name = package name
without the scope).

```
~/Projects/credit
├── package.json
├── README.md                 the 6-line snippet for plain HTML
├── LICENSE                   MIT, as heatmap
├── src/
│   ├── credit.css.in         template; {{ICON}} replaced at build
│   ├── pearpages-icon.png    64×64, 5.3 kB
│   ├── react.tsx
│   └── astro/Credit.astro
└── scripts/build-css.mjs     inlines the icon as a data URI
```

```json
"exports": {
  "./credit.css": "./dist/credit.css",
  "./react":      { "types": "./dist/react.d.ts", "import": "./dist/react.js" },
  "./astro":      "./src/astro/Credit.astro"
}
```

The `.astro` file ships **as source** — Astro components are compiled by the consuming
project, which is how Astro component libraries are distributed. React is built with
`tsup`, matching the heatmap so both repos share one release shape.

---

## Design decisions worth keeping

**One stylesheet, shared by all three targets.** This is the point of the whole exercise:
if Astro, React and plain HTML all load the same `credit.css`, drift between them is
structurally impossible rather than merely discouraged.

**Icon inlined as a data URI** (~7 kB base64). Removes asset resolution from the problem
entirely — Astro's image pipeline, Vite's, and a plain `<link>` from a CDN all render
identically. The current Astro version imports the PNG through Astro's optimiser, which is
exactly the kind of per-framework difference this avoids.

**Keep the `sk-` prefix** on classes and tokens, even though the package is no longer
called site-kit. Orchard already sets `--sk-ink-soft` and `--sk-accent`; renaming buys
nothing and forces a change in the one repo already doing it right.

**Keep the `#667` fallbacks** — `var(--sk-ink-soft, #667)` — so it looks correct on a site
that configures nothing.

**Keep the tagline slot** — `<slot />` in Astro, `children` in React — so orchard's "Open
source, no analytics, one orchard." keeps working and sites that want credit-only pass
nothing.

The canonical CSS to move out of `AuthorCard.astro`'s scoped `<style>`:

```css
.sk-author            { padding: 20px 24px 32px; text-align: center; font-size: 13px;
                        color: var(--sk-ink-soft, #667); }
.sk-author__credit    { display: flex; align-items: center; justify-content: center;
                        gap: 8px; margin: 0 0 4px; }
.sk-author__icon      { width: 22px; height: 22px; border-radius: 6px; }
.sk-author__credit a  { color: inherit; font-weight: 700;
                        text-decoration-color: var(--sk-accent, #667); }
.sk-author__credit a:hover { color: var(--sk-accent, #667); }
```

---

## Sequencing

Three separate pieces of work. Do not land them together.

**1. Create and publish the package.** Copy the heatmap's `publish.yml`, its
`check:package` script (publint + arethetypeswrong) and its MIT licence — that pipeline is
proven, and consistency across your repos is worth more than any improvement. Stop here
and inspect the published artifact before touching any consumer.

**2. Migrate orchard.** Replace `AuthorCard.astro`'s body with the package, or delete it
and import `@pearpages/credit/astro` at its call sites. Before deleting
`pearpages-icon.png` from `@browser-plugins/assets`, check nothing else uses it — the
plugin icons live in that package too.

Orchard is the truer test: it originated the markup, it uses the tagline slot, and it is
Astro rather than Vite.

**3. Migrate the heatmap demo.** Replace the inline `sk-author` block in
`demo/src/App.tsx`, the `.sk-author` rules in `demo/src/app.scss`, and
`demo/public/pearpages-icon.png`. This repairs the five drifts above as a side effect,
rather than fixing them twice.

---

## Verification

```bash
npm run build && npm run check:package    # publint + attw, as in heatmap
npm pack --dry-run                        # dist/ + src/astro only, no stray icon
```

Then in **each** consumer — the point is that all three render identically:

```js
getComputedStyle(document.querySelector('.sk-author')).padding;          // 20px 24px 32px
getComputedStyle(document.querySelector('.sk-author__credit')).margin;   // 0px 0px 4px
const icon = document.querySelector('.sk-author__icon');
[icon.naturalWidth, icon.getBoundingClientRect().width];                 // 64, 22
```

Hover the link and confirm it takes `--sk-accent` — that is the rule the hand copy missed,
so it is the one most worth checking. Confirm a site setting neither token falls back to
`#667` and still looks right. Confirm orchard's tagline still renders under the credit.

---

## The simpler alternative

If the wrappers feel like too much: ship **only `credit.css`** and paste the six lines of
HTML everywhere. You still get centrally-updated styling and icon — the parts that
actually change — and you accept that a structural change means touching each site.

With 26 repos I don't think that is the right trade, but it is meaningfully simpler and
the choice is yours.
