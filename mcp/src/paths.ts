import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const thisFileUrl = import.meta.url;
const __dirname = path.dirname(fileURLToPath(thisFileUrl));
// Running via `tsx src/*.ts` keeps the .ts extension in the module URL; a
// compiled build (dist/*.js, whether tested locally or installed from npm)
// does not. This tells us which layer we're running from without relying on
// directory naming.
const isDevSource = thisFileUrl.endsWith(".ts");

// mcp/src/paths.ts (dev) and mcp/dist/paths.js (build output, local or
// published) both sit exactly one level inside the `mcp/` package dir, which
// in a repo checkout sits at the repo root alongside `demo/` and `src/`. When
// installed from npm, this resolves into node_modules and none of those
// sibling dirs exist — that absence is how we detect "published" mode.
const REPO_ROOT = path.resolve(__dirname, "..", "..");

/** This package's own version. `REPO_ROOT` is the package root in both layouts
 * (dev `mcp/src/`, published `dist/mcp/`), so the same lookup works for each.
 * Setup compares it against the version a project was last set up with, which
 * is the only moment anyone can be told an upgrade just happened. */
export const PACKAGE_VERSION: string = (() => {
  try {
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
})();

export const SOURCE = {
  pages: path.join(REPO_ROOT, "demo/docs/pages"),
  examples: path.join(REPO_ROOT, "demo/docs/previews/examples"),
  types: path.join(REPO_ROOT, "src/types"),
  rules: path.join(REPO_ROOT, "demo/docs/rules"),
  themeDir: path.join(REPO_ROOT, "src/styles/theme"),
  componentsDir: path.join(REPO_ROOT, "src/components"),
  // The generated, authoritative registry of every --clet-* token cletTheme()
  // actually accepts (global + per-component) — see
  // scripts/generate-theme-tokens.mjs. Parsed for token IDENTITY/grouping;
  // actual values still come from the theme CSS files (global) and each
  // component's own styles/*.css (component-scoped).
  generatedTheme: path.join(REPO_ROOT, "src/generated/components.theme.ts"),
};

/**
 * True only when this package is running from inside the gsl-components repo
 * checkout (dev, or a local `npm run build` test) — i.e. there is live source
 * to index. False when installed as a dependency (published, no sibling
 * demo/src dirs), in which case we must never attempt to rebuild and only
 * ever read the generated snapshot bundled at publish time.
 */
export const hasRepoSource = existsSync(SOURCE.pages) && existsSync(SOURCE.types);

/**
 * Where the generated JSON knowledge base lives.
 * - Dev (tsx from src): mcp/generated — gitignored, rebuilt from live source.
 * - Local dist / published dist: <dist>/generated — bundled at publish time
 *   via `files: ["dist"]`, since the source it was built from won't travel.
 */
export const GENERATED_DIR = isDevSource
  ? path.join(__dirname, "..", "generated")
  : path.join(__dirname, "generated");

/**
 * The hand-authored skill doc. Same dev/dist split as GENERATED_DIR: in dev
 * it's read straight from mcp/skill/ (committed source); in a build/publish
 * it's read from the copy bundled next to the compiled JS.
 */
export const SKILL_SOURCE_PATH = isDevSource
  ? path.join(__dirname, "..", "skill", "SKILL.md")
  : path.join(__dirname, "skill", "SKILL.md");

/**
 * The hand-authored image/text-to-components skill doc. Same dev/dist split
 * as SKILL_SOURCE_PATH; `prepare-dist.mjs` copies the whole `skill/` dir so
 * this travels to the published tarball automatically.
 */
export const SKILL_IMAGE_SOURCE_PATH = isDevSource
  ? path.join(__dirname, "..", "skill", "image-to-components.md")
  : path.join(__dirname, "skill", "image-to-components.md");
