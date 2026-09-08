// Inlines the pear into credit.css as a data URI and writes dist/credit.css.
//
// The WebP is committed pre-encoded, so this script only base64-encodes and has
// no dependencies -- no sharp, no cwebp, nothing for CI to install. To regenerate
// the icon itself:  cwebp -q 90 -alpha_q 100 pearpages-icon.png -o pearpages-icon.webp
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const at = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const [template, icon] = await Promise.all([
  readFile(at("src/credit.css.in"), "utf8"),
  readFile(at("src/pearpages-icon.webp")),
]);

const dataUri = `data:image/webp;base64,${icon.toString("base64")}`;
const css = template.replace("{{ICON}}", dataUri);

if (css.includes("{{ICON}}") || !css.includes(dataUri)) {
  throw new Error("build-css: {{ICON}} placeholder was not substituted");
}

await mkdir(at("dist"), { recursive: true });
await writeFile(at("dist/credit.css"), css);

console.log(`build-css: dist/credit.css (${css.length} B, icon ${icon.length} B)`);
