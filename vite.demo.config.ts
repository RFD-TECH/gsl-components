import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light",
                dark: "github-dark",
              },
              keepBackground: false,
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
  root: "demo",
  resolve: {
    alias: {
      "@rfdtech/components": resolve(__dirname, "src/index.ts"),
      demo: resolve(__dirname, "demo"),
    },
  },
  server: {
    port: 5179,
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
