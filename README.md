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

```html
<link rel="stylesheet" href="/path/to/@pearpages/credit/dist/credit.css" />

<footer class="sk-author">
  <p class="sk-author__credit">
    <span class="sk-author__icon" aria-hidden="true"></span>
    Made by <a href="https://pearpages.com">pearpages</a>
  </p>
</footer>
```

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
