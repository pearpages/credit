# @pearpages/credit

The shared "Made by pearpages" footer, published so 26 repos stop re-deriving it by hand.
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
| `src/canonical-markup.ts` | the markup contract, asserted against **both** React and the README snippet. Test-only; never shipped |
| `scripts/build-css.mjs` | base64 + substitute. No dependencies, by design |

## Decisions that look wrong until you know why

**The icon is a `<span>` with a CSS `background`, not an `<img>`.** CSS cannot fill an
`<img>`, so a data-URI icon and an `<img src>` are mutually exclusive. The `<span>` is what
makes one stylesheet serve Astro, React and plain HTML identically, and it keeps the
plain-HTML snippet six lines instead of 7 kB of base64. The icon is decorative
(`aria-hidden`), so nothing is lost.

**Plain-HTML sites get a documented snippet, not a web component.** It was the obvious
candidate and `PLAN.md` rejects it in full (lines 70–82): a custom element renders
client-side, so the attribution link would be missing from the built HTML and gone without
JS; it puts a script on Astro sites that ship none; and shadow DOM turns `--sk-accent` from
a CSS custom property into an API you have to design. Declarative Shadow DOM fixes only the
first, and only if something emits it at build time — which means a framework component
anyway. So plain HTML loads the same `dist/credit.css` and hand-writes six tags.

**The README's plain-HTML snippets are tested, not prose.** `src/plain-html.test.ts` slices
the `### Plain HTML` section, pulls every ```` ```html ```` fence out of it, and runs each
through `expectCanonicalMarkup` — the same helper `src/react.test.tsx` uses. Three fences
are expected (base, tagline, `div`); **adding a fourth fails the count assertion until you
add its expectation to the `expected` array.** That is deliberate: a snippet nobody asserts
is exactly how the markup drifted before this package existed. The README links
`https://unpkg.com/@pearpages/credit@0/dist/credit.css` — the `@0` range, not a pin, so the
URL neither goes dead between releases nor needs editing at each one.

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

## Verified at 0.2.0

Re-run for 0.2.0 (the brand rename):

- `npm run build && npm run test:run && npm run lint && npm run check:package` all clean;
  publint "All good!", attw green on the `./react` entrypoint.
- `npm pack --dry-run` → 10 files, 16.5 kB. Both icons ship (for `./icon.*`); the
  stylesheet references neither. (It was 15.6 kB before the README grew a fuller
  plain-HTML section; `src/canonical-markup.ts` and `src/plain-html.test.ts` do not ship,
  since `files` lists `dist` and `src/astro` only.)
- The README's three plain-HTML fences are asserted against the React markup. Mutation-
  checked, not merely green: renaming the link text, swapping the icon `<span>` for an
  `<img>`, adding a second link inside `.sk-author__credit`, and adding a fourth fence each
  fail the suite.
- `curl -sSL https://unpkg.com/@pearpages/credit@0/dist/credit.css` → 200, 4176 B,
  `text/css`, resolving to 0.2.0, with the data URI and the `:hover` rule present.

Carried over from 0.1.0 — 0.2.0 changed one text string and some comments, so nothing
below can have moved:

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

**`publish.yml` works.** Run [34327520383](https://github.com/pearpages/credit/actions/runs/34327520383)
went green in 45 s on the annotated `v0.2.0` tag and published 0.2.0 at
2026-09-09T08:12Z. `npm view @pearpages/credit@0.2.0 dist` shows an `attestations` key, so
OIDC trusted publishing is attached and provenance is real. The `git merge-base
--is-ancestor` check held, which confirms `actions/checkout@v4` at `fetch-depth: 0` does
create `refs/remotes/origin/main`.

The trigger is the **push**, not the tag, and `git push --follow-tags` moves *annotated*
tags only. `v0.2.0` is annotated (`git for-each-ref refs/tags` reports objecttype `tag`);
`v0.1.0` is lightweight, and remains local-only — `--follow-tags` skips it in silence.
Either create tags with `git tag -a`, or push them explicitly with `git push origin <tag>`.

0.1.0 carries no provenance badge on npmjs.com — that started with 0.2.0, the first
OIDC-published version.

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
tag is safe and the bootstrapped `v0.1.0` tag does not fail.

## TODO

- [x] Publish 0.1.0 manually (done, via `--auth-type=legacy`).
- [x] Attach OIDC and release 0.2.0 (done 2026-09-09). The `v0.2.0` tag push ran
      `publish.yml` green in 45 s and published with provenance — see Releasing. This
      subsumed the never-needed `v0.1.0` smoke test; that tag is still local-only and
      pushing it now would only prove the skip path.

      Note `npm trust` does not exist in npm 10.9.8 (`Unknown command: "trust"`), so the
      command previously recorded here could not have worked as written. If the trusted
      publisher ever needs re-attaching, do it in the npmjs.com package settings UI.

      npm's warning at attach time still applies: *anyone with write access to the GitHub
      repo can publish*. Fine for a solo public repo; reconsider if collaborators are added.

- [ ] Step 2 — migrate orchard: six `AuthorCard` call sites (all pass taglines), then
      repoint the ten non-footer icon consumers at `@pearpages/credit/icon.png` and delete
      `packages/assets/pearpages-icon.png`. Re-run `pnpm sites:a11y`.
- [ ] Step 3 — migrate the heatmap demo. Needs `as="div"`; the credit sits inside an
      existing `<footer className="page__footer">`.
- [ ] Later: 6 more repos hand-copy this footer (`bitepals`, `cerdanya`, `fit-tracker`,
      `futbol-manager`, `masiablanca`, and heatmap's demo). Three render the pear at
      **16 px**, so a `--sk-author-icon-size` custom property or a `.sk-author--sm` modifier
      is needed before they can adopt. Decide when the first 16 px consumer migrates.
