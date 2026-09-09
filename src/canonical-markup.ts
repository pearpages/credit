/**
 * The single definition of "correct credit markup".
 *
 * Three copies of these six tags exist — `src/react.tsx`, `src/astro/Credit.astro`
 * and the plain-HTML snippet in `README.md`. Only the React one was ever asserted,
 * so the other two could drift in silence: exactly the failure this package was
 * built to end. Every copy is now checked against this one function.
 *
 * It compares structure and text, never raw HTML. JSX drops the newline between
 * the icon <span> and "Made by"; hand-written HTML keeps it. Flex layout collapses
 * that whitespace, so an outerHTML diff would fail on a difference nobody can see.
 */
export interface CanonicalMarkupOptions {
  as?: "footer" | "div";
  tagline?: string;
}

const collapse = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim();

export function expectCanonicalMarkup(
  root: Element,
  { as = "footer", tagline }: CanonicalMarkupOptions = {},
): void {
  expect(root.tagName).toBe(as.toUpperCase());
  expect(root.classList.contains("sk-author")).toBe(true);

  const credit = root.querySelector(".sk-author__credit")!;
  expect(credit).not.toBeNull();
  expect(credit.tagName).toBe("P");
  expect(collapse(credit.textContent)).toBe("Made by pearpages");

  // Decorative, and painted by a CSS background — an <img> here would render the
  // pear behind a broken src.
  const icon = credit.querySelector(".sk-author__icon")!;
  expect(icon).not.toBeNull();
  expect(icon.tagName).toBe("SPAN");
  expect(icon.getAttribute("aria-hidden")).toBe("true");
  expect(icon.childNodes).toHaveLength(0);

  // `.sk-author__credit a` is a descendant selector: a second link would silently
  // inherit the bold and the accent underline, so there must be exactly one.
  const links = credit.querySelectorAll("a");
  expect(links).toHaveLength(1);
  expect(collapse(links[0].textContent)).toBe("pearpages");
  expect(links[0].getAttribute("href")).toBe("https://pearpages.com");

  const children = [...root.children];
  expect(children).toHaveLength(tagline ? 2 : 1);
  expect(children[0]).toBe(credit);
  if (tagline) expect(collapse(children[1].textContent)).toBe(tagline);
}
