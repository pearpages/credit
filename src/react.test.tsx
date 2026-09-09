import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Credit } from "./react";

describe("Credit", () => {
  it("renders the canonical markup", () => {
    const { container } = render(<Credit />);
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("FOOTER");
    expect(root).toHaveClass("sk-author");

    const credit = root.querySelector(".sk-author__credit")!;
    expect(credit.tagName).toBe("P");
    expect(credit).toHaveTextContent("Made by pearpages");

    const link = screen.getByRole("link", { name: "pearpages" });
    expect(link).toHaveAttribute("href", "https://pearpages.com");
  });

  it("marks the icon decorative, so it is not announced", () => {
    const { container } = render(<Credit />);
    const icon = container.querySelector(".sk-author__icon")!;

    expect(icon.tagName).toBe("SPAN");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toBeEmptyDOMElement();
  });

  it("renders a tagline after the credit line", () => {
    const { container } = render(
      <Credit>
        <p>Open source, no analytics, one orchard.</p>
      </Credit>,
    );
    const children = [...container.firstElementChild!.children];

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveClass("sk-author__credit");
    expect(children[1]).toHaveTextContent("Open source, no analytics, one orchard.");
  });

  it("renders no tagline when given no children", () => {
    const { container } = render(<Credit />);
    expect(container.firstElementChild!.children).toHaveLength(1);
  });

  // Nesting <footer> is invalid HTML and produces a second contentinfo landmark,
  // which is why consumers with their own footer need the escape hatch.
  it("renders a div when asked, for use inside an existing footer", () => {
    const { container } = render(<Credit as="div" />);
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-author");
  });

  it.each(["footer", "div"] as const)("has no axe violations as a %s", async (as) => {
    const { container } = render(<Credit as={as}>{<p>Tagline.</p>}</Credit>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
