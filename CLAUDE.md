# @pearpages/credit

The shared "Made by Pere Pages" footer, published so 26 repos stop re-deriving it by hand.
`PLAN.md` holds the original rationale; this file holds the conventions and the decisions
that are easy to undo by accident.

## Layout

| path | |
| --- | --- |
| `src/credit.css.in` | **the canonical source.** `{{ICON}}` is substituted at build |
| `src/pearpages-icon.webp` | 1978 B, inlined into the CSS as a data URI |
| `src/pearpages-icon.png` | 5346 B, orchard's exact bytes, for the `./icon.png` export |
| `src/react.tsx` | ~15-line wrapper, built by tsup |
| `src/astro/Credit.astro` | ~15-line wrapper, **shipped as source** — Astro components are compiled by the consuming project |
| `scripts/build-css.mjs` | base64 + substitute. No dependencies, by design |

## Decisions that look wrong until you know why

**The icon is a `<span>` with a CSS `background`, not an `<img>`.** CSS cannot fill an
`<img>`, so a data-URI icon and an `<img src>` are mutually exclusive. The `<span>` is what
makes one stylesheet serve Astro, React and plain HTML identically, and it keeps the
plain-HTML snippet six lines instead of 7 kB of base64. The icon is decorative
(`aria-hidden`), so nothing is lost.

**The build order is `tsup && node scripts/build-css.mjs`, never the reverse.** tsup runs
with `clean: true` and will delete a `dist/credit.css` written before it.

**The WebP is committed pre-encoded.** That keeps `sharp`/`cwebp` out of devDependencies
and out of CI. To regenerate:

```bash
cwebp -q 90 -alpha_q 100 src/pearpages-icon.png -o src/pearpages-icon.webp
```

Re-encode the **64×64 PNG**, not the 387×498 master in `my-blog-v3/archive/` — downscaling
the master measures larger and changes the pear's appearance.

**Keep the `sk-` prefix.** It is *site-kit*, from the orchard monorepo where this
originated. Orchard already sets `--sk-ink-soft` / `--sk-accent` in every site's
`theme.css`; renaming would break the one repo already doing it right.

**Keep the `#667` fallbacks**, and keep documenting that dark sites must set
`--sk-ink-soft`. `#667` is 5.63:1 on white (AA pass) but 3.36:1 on near-black (fail). No
single fallback is right for both grounds.

**`sideEffects` is `["**/*.css"]`, not `false`** (heatmap uses `false`): a bundler may drop
a stylesheet imported purely for its side effect otherwise.

**React peers are optional.** Astro and plain-HTML consumers should not get a peer warning
about a framework they do not use.

## Verified at 0.1.0

- `npm run build && npm run test:run && npm run lint && npm run check:package` all clean;
  publint "All good!", attw green on the `./react` entrypoint.
- `npm pack --dry-run` → 10 files, 15.6 kB. Both icons ship (for `./icon.*`); the
  stylesheet references neither.
- All five exports resolve from a real `file:` install.
- Browser: padding `20px 24px 32px`, credit margin `0px 0px 4px`, icon box 22×22, WebP data
  URI, default underline present, `:hover` takes `--sk-accent`, `as="div"` produces no
  nested `<footer>`.
- Real Astro build: renders server-side with no JS, and Astro inlines the whole stylesheet —
  the built page is a single 3710 B `index.html` with **no image file at all**.
- The re-encoded pear is indistinguishable from orchard's PNG at 4× magnification.

## Not verified

`forced-colors: active` was not exercised — the `@media` rule that collapses the icon ships
as a defensive measure. Check it in DevTools → Rendering if it ever matters.

## Releasing

`main` publishes nothing. A `v*` tag runs `.github/workflows/publish.yml`, which uses npm
trusted publishing (OIDC) — no token in the repo — and skips greenly if the tag is not an
ancestor of `main`.

0.1.0 was published manually to bootstrap this: npm cannot attach a trusted publisher to a
package that does not exist yet ([npm/cli#8544](https://github.com/npm/cli/issues/8544) is
still open), so exactly one authenticated publish was unavoidable.

**If you ever need to publish by hand again, use `--auth-type=legacy`:**

```bash
npm publish --access public --auth-type=legacy
```

The default web flow prints an `npmjs.com/auth/cli/<uuid>` link that 404s instead of
redirecting to login ([npm/cli#6242](https://github.com/npm/cli/issues/6242), closed as
registry-side). `legacy` restores the in-terminal OTP prompt and sidesteps it.

`publish.yml` skips publishing when the version is already on the registry, so re-running a
tag is safe and the bootstrapped `v0.1.0` tag does not fail. Note that `0.1.0` carries no
provenance badge on npmjs.com -- that starts with the first OIDC-published version.

## TODO

- [x] Publish 0.1.0 manually (done, via `--auth-type=legacy`).
- [ ] Attach OIDC: `npm trust github @pearpages/credit --file publish.yml --repo pearpages/credit --allow-publish`, then push the `v0.1.0` tag.
- [ ] Step 2 — migrate orchard: six `AuthorCard` call sites (all pass taglines), then
      repoint the ten non-footer icon consumers at `@pearpages/credit/icon.png` and delete
      `packages/assets/pearpages-icon.png`. Re-run `pnpm sites:a11y`.
- [ ] Step 3 — migrate the heatmap demo. Needs `as="div"`; the credit sits inside an
      existing `<footer className="page__footer">`.
- [ ] Later: 6 more repos hand-copy this footer (`bitepals`, `cerdanya`, `fit-tracker`,
      `futbol-manager`, `masiablanca`, and heatmap's demo). Three render the pear at
      **16 px**, so a `--sk-author-icon-size` custom property or a `.sk-author--sm` modifier
      is needed before they can adopt. Decide when the first 16 px consumer migrates.
