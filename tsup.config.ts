import { defineConfig } from "tsup";

export default defineConfig({
  entry: { react: "src/react.tsx" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  external: ["react", "react-dom"],
});
