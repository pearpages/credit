[![npm version](https://img.shields.io/npm/v/@pearpages/credit.svg)](https://www.npmjs.com/package/@pearpages/credit)
[![Build Status](https://github.com/pearpages/credit/actions/workflows/publish.yml/badge.svg)](https://github.com/pearpages/credit/actions/workflows/publish.yml)
[![License](https://img.shields.io/npm/l/@pearpages/credit.svg)](./LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/@pearpages/credit.svg)](https://www.npmjs.com/package/@pearpages/credit)

# Credit

The shared "Made by pearpages" footer — one stylesheet, plus a thin wrapper for React and
Astro. The pear rides inside the CSS as a data URI, so no site has to resolve an asset path.

## Installation

```bash
npm install @pearpages/credit
```

## Getting started

### Astro

```astro
---
import Credit from '@pearpages/credit/astro';
---

<Credit>
  <p>Open source, no analytics, one orchard.</p>
</Credit>
```

The stylesheet is imported by the component, so there is nothing else to wire up.

### React

```tsx
import '@pearpages/credit/credit.css';
import { Credit } from '@pearpages/credit/react';

<Credit>
  <p>Open source, no analytics, one orchard.</p>
</Credit>;
```

React imports the CSS explicitly where Astro does not — the bundler would otherwise inline
the stylesheet into the JS, which is the one thing this package exists to prevent.

### Plain HTML

No component and no script — one stylesheet, six tags:

```html
<link rel="stylesheet" href="https://unpkg.com/@pearpages/credit@0/dist/credit.css" />

<footer class="sk-author">
  <p class="sk-author__credit">
    <span class="sk-author__icon" aria-hidden="true"></span>
    Made by <a href="https://pearpages.com">pearpages</a>
  </p>
</footer>
```

`@0` tracks the latest `0.x`, so the styling and the pear stay current without anyone
editing the page. A site that installs from npm can point at
`/node_modules/@pearpages/credit/dist/credit.css` instead.

**With a tagline** — a plain sibling after the credit line, which is what `children` and
`<slot />` emit. It takes no class of its own; it inherits the centring, colour and size
from `.sk-author`.

```html
<footer class="sk-author">
  <p class="sk-author__credit">
    <span class="sk-author__icon" aria-hidden="true"></span>
    Made by <a href="https://pearpages.com">pearpages</a>
  </p>
  <p>Open source, no analytics, one orchard.</p>
</footer>
```

**Inside an existing `<footer>`** — swap the outer tag for a `<div>`, for the reason given
under [Props](#props). No rule in the stylesheet selects an element, so this is a one-word
change and nothing else moves.

```html
<div class="sk-author">
  <p class="sk-author__credit">
    <span class="sk-author__icon" aria-hidden="true"></span>
    Made by <a href="https://pearpages.com">pearpages</a>
  </p>
</div>
```

Two things the stylesheet cannot survive:

- **Leave the icon `<span>` empty.** The pear is a CSS `background`, not an `<img>`, so an
  `<img class="sk-author__icon">` paints it behind a broken `src`.
- **Keep `.sk-author__credit` to one link.** The rule is the descendant selector
  `.sk-author__credit a`, so a second link there silently takes the bold and the accent
  underline.

These snippets are not decoration: `src/plain-html.test.ts` parses them out of this file
and asserts them against the same contract as the React component, so they cannot drift
from it.

## Props

| prop | type | default | |
| --- | --- | --- | --- |
| `as` | `'footer' \| 'div'` | `'footer'` | Use `div` when the credit sits inside an existing `<footer>` — nesting footers is invalid HTML and produces a second `contentinfo` landmark. |
| children / `<slot />` | — | — | Optional tagline, rendered under the credit line. |

## Theming

Two custom properties, no package API:

| token | |
| --- | --- |
| `--sk-ink-soft` | the footer text |
| `--sk-accent` | the link underline, and the link colour on hover |

```css
:root {
  --sk-ink-soft: #706c5a;
  --sk-accent: #38702d;
}
```

**On a dark background you must set `--sk-ink-soft`.** The built-in `#667` fallback is
correct on a light ground (5.63:1) but fails WCAG AA on a dark one (3.36:1). Something like
`--sk-ink-soft: #a19d8c` passes at 6.40:1.

## The icon

The footer's pear is a WebP data URI inside `credit.css` — one request delivers both the
styling and the image, and no site keeps its own copy. For favicons, OG cards and anything
else needing a real file, the raw asset is exported too:

```js
import icon from '@pearpages/credit/icon.png';   // 64×64, for Safari favicons and OG generation
import icon from '@pearpages/credit/icon.webp';  // 64×64, smaller, for anything modern
```

## Local development

```bash
npm install
npm run build          # tsup, then inline the icon into dist/credit.css
npm run test:run
npm run check:package  # publint + arethetypeswrong
```

The icon is committed pre-encoded so the build needs no image toolchain. To regenerate it:

```bash
cwebp -q 90 -alpha_q 100 src/pearpages-icon.png -o src/pearpages-icon.webp
```

## Releasing

| trigger | what happens |
| --- | --- |
| push to `main` | nothing publishes |
| push a `v*` tag | `publish.yml` builds, tests, and publishes to npm |

The trigger is the **push**, not the tag. `git tag` alone leaves the tag in your local
repo where GitHub never sees it, and no run starts.

```bash
npm version minor                # bumps package.json and creates an annotated tag
git push --follow-tags
```

Tagging by hand instead? Make it annotated. `--follow-tags` carries annotated tags only
and skips lightweight ones without saying so:

```bash
git tag -a v0.2.0 -m "v0.2.0"
git push origin main
git push origin v0.2.0
```

Publishing uses npm trusted publishing (OIDC), so there is no token in the repo. The
workflow skips — greenly — if the tag is not an ancestor of `main`, or if the version is
already on the registry. **A green run is therefore not proof of a publish**; confirm on
the registry:

```bash
npm view @pearpages/credit@0.2.0 version
```

## License

MIT © pearpages
