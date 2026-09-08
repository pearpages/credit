export interface CreditProps {
  /**
   * The element to render. Defaults to `footer`, matching the canonical markup.
   * Pass `div` when the credit sits inside an existing `<footer>` -- nesting
   * footers is invalid HTML and yields a second `contentinfo` landmark.
   */
  as?: "footer" | "div";
  /** Optional tagline, rendered under the credit line. */
  children?: React.ReactNode;
}

/**
 * The shared "Made by Pere Pages" credit.
 *
 * Requires the stylesheet: `import "@pearpages/credit/credit.css"`.
 */
export function Credit({ as: Element = "footer", children }: CreditProps) {
  return (
    <Element className="sk-author">
      <p className="sk-author__credit">
        <span className="sk-author__icon" aria-hidden="true" />
        Made by <a href="https://pearpages.com">Pere Pages</a>
      </p>
      {children}
    </Element>
  );
}
