import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expectCanonicalMarkup, type CanonicalMarkupOptions } from "./canonical-markup";

// The README *is* the plain-HTML deliverable — PLAN.md lists it as "the 6 lines to paste
// on plain-HTML sites". So it gets tested like one, against the same contract as React.
// cwd, not import.meta.url: under the jsdom transform that is an http: URL, not a file one.
const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");

const section = (() => {
  const start = readme.indexOf("### Plain HTML");
  expect(start).toBeGreaterThan(-1);
  const rest = readme.slice(start);
  const end = rest.search(/\n## /); // the next top-level heading, never a ### one
  return end === -1 ? rest : rest.slice(0, end);
})();

const snippets = [...section.matchAll(/```html\n([\s\S]*?)```/g)].map((m) => m[1]);

// What each fence in the section is demonstrating, in document order. Adding a snippet
// without adding its expectation here fails the length check below rather than sliding
// through unasserted.
const expected: { name: string; options: CanonicalMarkupOptions }[] = [
  { name: "the base snippet", options: {} },
  {
    name: "the tagline variant",
    options: { tagline: "Open source, no analytics, one orchard." },
  },
  { name: "the div variant", options: { as: "div" } },
];

describe("the plain-HTML snippets in README.md", () => {
  it("has one fence for each documented variant", () => {
    expect(snippets).toHaveLength(expected.length);
  });

  it.each(expected.map((e, i) => [e.name, i] as const))(
    "%s matches the canonical markup",
    (_name, i) => {
      const host = document.createElement("div");
      host.innerHTML = snippets[i]; // the <link> lines parse away harmlessly

      const root = host.querySelector(".sk-author")!;
      expect(root).not.toBeNull();
      expectCanonicalMarkup(root, expected[i].options);
    },
  );

  it("never renders the icon as an <img>", () => {
    // A CSS background cannot fill an <img>; one would paint the pear behind a broken
    // src. Checked on the fences only — the prose deliberately names the mistake.
    for (const snippet of snippets) expect(snippet).not.toMatch(/<img/);
  });

  it("links the stylesheet from somewhere a reader can actually fetch", () => {
    expect(snippets[0]).toContain(
      'href="https://unpkg.com/@pearpages/credit@0/dist/credit.css"',
    );
    expect(section).not.toContain("/path/to/");
  });
});
