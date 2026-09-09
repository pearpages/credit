import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expectCanonicalMarkup } from "./canonical-markup";
import { Credit } from "./react";

// The structural assertions live in expectCanonicalMarkup so that this component, the
// Astro wrapper and the README snippet are all held to one definition of the markup.
describe("Credit", () => {
  it("renders the canonical markup", () => {
    const { container } = render(<Credit />);
    expectCanonicalMarkup(container.firstElementChild!);
  });

  it("renders a tagline after the credit line", () => {
    const { container } = render(
      <Credit>
        <p>Open source, no analytics, one orchard.</p>
      </Credit>,
    );
    expectCanonicalMarkup(container.firstElementChild!, {
      tagline: "Open source, no analytics, one orchard.",
    });
  });

  // Nesting <footer> is invalid HTML and produces a second contentinfo landmark,
  // which is why consumers with their own footer need the escape hatch.
  it("renders a div when asked, for use inside an existing footer", () => {
    const { container } = render(<Credit as="div" />);
    expectCanonicalMarkup(container.firstElementChild!, { as: "div" });
  });

  it.each(["footer", "div"] as const)("has no axe violations as a %s", async (as) => {
    const { container } = render(<Credit as={as}>{<p>Tagline.</p>}</Credit>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
