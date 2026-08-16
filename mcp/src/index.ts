#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  type ComponentEntry,
  type LoadedIndex,
  type Rule,
  type TokenEntry,
  getComponent,
  getRules,
  listSlugs,
  loadIndex,
  searchComponents,
  searchDocs,
  searchRules,
} from "./docs.js";
import { buildIndex } from "./indexer.js";
import { GENERATED_DIR, SOURCE, hasRepoSource } from "./paths.js";

/**
 * The generated JSON knowledge base is a build artifact, not a second source
 * of truth: it's gitignored and only ever produced by re-running the indexer
 * against the live MDX/examples/types/rules/tokens. In dev (running inside
 * the repo checkout) we rebuild it here whenever it's missing or any source
 * file is newer than what it was last built from, so the MCP always reflects
 * the current docs with zero manual "npm run index" step required. In a
 * published install there is no source to rebuild from — hasRepoSource is
 * false there — so we only ever read the snapshot bundled at publish time.
 */
async function ensureFreshIndex(): Promise<void> {
  if (!hasRepoSource) return;

  const metaPath = path.join(GENERATED_DIR, "index.meta.json");
  let stale = !existsSync(metaPath);

  if (!stale) {
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as {
      builtFrom?: Record<string, number>;
    };
    const builtFrom = meta.builtFrom ?? {};

    for (const [filePath, mtime] of Object.entries(builtFrom)) {
      if (!existsSync(filePath)) {
        stale = true;
        break;
      }
      const info = await stat(filePath);
      if (info.mtimeMs > mtime) {
        stale = true;
        break;
      }
    }

    if (!stale) {
      for (const dir of [SOURCE.pages, SOURCE.examples, SOURCE.types, SOURCE.rules, SOURCE.themeDir]) {
        if (!existsSync(dir)) continue;
        for (const file of await readdir(dir)) {
          const filePath = path.join(dir, file);
          const info = await stat(filePath);
          if (info.isFile() && !(filePath in builtFrom)) {
            stale = true;
            break;
          }
        }
        if (stale) break;
      }
    }

    // A brand-new component (new styles/*.css files) or a token registry
    // regenerated for the first time — same "unseen file" check as above,
    // just for the two additional sources buildTokens() depends on.
    if (!stale && existsSync(SOURCE.generatedTheme) && !(SOURCE.generatedTheme in builtFrom)) {
      stale = true;
    }
    if (!stale && existsSync(SOURCE.componentsDir)) {
      for (const entry of await readdir(SOURCE.componentsDir)) {
        const stylesDir = path.join(SOURCE.componentsDir, entry, "styles");
        if (!existsSync(stylesDir)) continue;
        for (const file of await readdir(stylesDir)) {
          if (!file.endsWith(".css")) continue;
          if (!(path.join(stylesDir, file) in builtFrom)) {
            stale = true;
            break;
          }
        }
        if (stale) break;
      }
    }
  }

  if (stale) {
    console.error("[gsl-components-mcp] index missing or stale — rebuilding from source...");
    const result = await buildIndex(GENERATED_DIR);
    console.error(`[gsl-components-mcp] index rebuilt: ${JSON.stringify(result)}`);
  }
}

// ───────────────────────── formatting ─────────────────────────

function formatExample(ex: { file: string; importName?: string; source: string }): string {
  const ownership = ex.importName
    ? `imported as \`${ex.importName}\``
    : "not referenced by any MDX \\`?raw\\` import — included by filename match";
  return `### \`${ex.file}\` (${ownership})\n\n\`\`\`tsx\n${ex.source.trimEnd()}\n\`\`\``;
}

function formatRuleLine(rule: Rule): string {
  return `- **[${rule.severity.toUpperCase()}] ${rule.title}** — ${rule.body.replace(/\s+/g, " ").trim()}`;
}

function formatTokenValues(t: TokenEntry): string {
  const values = [
    t.base ? `base=${t.base}` : null,
    t.light ? `light=${t.light}` : null,
    t.dark ? `dark=${t.dark}` : null,
  ].filter(Boolean);
  return values.length ? ` ${values.join(", ")}` : "";
}

function formatComponent(idx: LoadedIndex, entry: ComponentEntry): string {
  const { meta } = entry;
  const parts: string[] = [];

  parts.push(`# ${meta.title}`);
  if (meta.description) parts.push(meta.description);

  const facts = [
    meta.category ? `**Category:** ${meta.category}` : null,
    meta.since ? `**Since:** ${meta.since}` : null,
    meta.status ? `**Status:** ${meta.status}` : null,
    meta.import ? `**Import:** \`${meta.import}\`` : null,
  ].filter(Boolean);
  if (facts.length) parts.push(facts.join(" · "));
  if (meta.keywords.length) parts.push(`**Keywords:** ${meta.keywords.join(", ")}`);
  if (meta.related.length) parts.push(`**Related:** ${meta.related.join(", ")}`);

  parts.push("---");
  parts.push(entry.docs);

  if (entry.examples.length) {
    parts.push("---");
    parts.push(
      `## All examples (${entry.examples.length})\n\n` + entry.examples.map(formatExample).join("\n\n")
    );
  }

  if (entry.types) {
    parts.push("---");
    parts.push(
      `## Authoritative type source (\`src/types/${meta.slug}.ts\`)\n\n` +
        "This is the real TypeScript source — if it ever disagrees with a prop table above, trust this.\n\n" +
        `\`\`\`ts\n${entry.types.trimEnd()}\n\`\`\``
    );
  }

  const rules = entry.ruleIds.map((id) => idx.rulesById[id]).filter((r): r is Rule => Boolean(r));
  if (rules.length) {
    parts.push("---");
    parts.push(`## Usage rules\n\n${rules.map(formatRuleLine).join("\n")}`);
  }

  return parts.join("\n\n");
}

function formatRulesByCategory(byCategory: Record<string, Rule[]>): string {
  const categories = Object.keys(byCategory).sort();
  if (categories.length === 0) return "No rules found.";
  return categories
    .map((cat) => `## ${cat}\n\n${byCategory[cat].map(formatRuleLine).join("\n")}`)
    .join("\n\n");
}

function notFound(slug: string, idx: LoadedIndex) {
  return {
    content: [
      {
        type: "text" as const,
        text: `No component doc found for slug "${slug}". Available slugs:\n${listSlugs(idx)
          .map((s) => `- ${s}`)
          .join("\n")}`,
      },
    ],
    isError: true,
  };
}

// ───────────────────────── server ─────────────────────────

async function main() {
  await ensureFreshIndex();
  const idx = await loadIndex();

  const server = new McpServer({
    name: "gsl-components-docs",
    version: "2.0.0",
  });

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "Lists every GSL component/guide doc page — slug, title, category, and description. Start here.",
    },
    async () => {
      const lines = listSlugs(idx).map((slug) => {
        const { meta } = idx.components[slug];
        return `- ${slug}: ${meta.title}${meta.category ? ` [${meta.category}]` : ""}${
          meta.description ? ` — ${meta.description}` : ""
        }`;
      });
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description:
        "Lexical search over component name, keywords, description, and doc headings. Use this before " +
        "inventing a UI element — try phrases like \"table pagination\", \"confirmation dialog\", \"date range\".",
      inputSchema: {
        query: z.string().describe('Free-text search, e.g. "wizard steps" or "otp verification".'),
      },
    },
    async ({ query }) => {
      const results = searchComponents(idx, query);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `No components matched "${query}".` }] };
      }
      const text = results
        .map((r) => `- ${r.slug}: ${r.name}${r.description ? ` — ${r.description}` : ""} (score ${r.score})`)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description:
        "The full picture for one component: description, props/types reference (authoritative source, " +
        "not just the prose table), design tokens context, EVERY known example (not just the ones the MDX " +
        "page shows), and any usage rules (do/don't). Use this before writing code against a component.",
      inputSchema: {
        slug: z
          .string()
          .describe('Doc page slug, e.g. "button", "table", "date-range-selector".'),
      },
    },
    async ({ slug }) => {
      const entry = getComponent(idx, slug);
      if (!entry) return notFound(slug, idx);
      return { content: [{ type: "text", text: formatComponent(idx, entry) }] };
    }
  );

  server.registerTool(
    "get_component_examples",
    {
      title: "Get component examples",
      description:
        "Just the example source files for a component — every one known (explicit MDX examples plus any " +
        "matching orphan example files), without the full prose doc.",
      inputSchema: {
        slug: z.string().describe('Doc page slug, e.g. "table", "form".'),
      },
    },
    async ({ slug }) => {
      const entry = getComponent(idx, slug);
      if (!entry) return notFound(slug, idx);
      if (entry.examples.length === 0) {
        return { content: [{ type: "text", text: `No examples found for "${slug}".` }] };
      }
      const text = `# ${entry.meta.title} — examples (${entry.examples.length})\n\n${entry.examples
        .map(formatExample)
        .join("\n\n")}`;
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "get_component_types",
    {
      title: "Get component types",
      description:
        "The authoritative TypeScript prop/type source for a component, straight from src/types/<slug>.ts — " +
        "trust this over any hand-written MDX prop table if they ever disagree.",
      inputSchema: {
        slug: z.string().describe('Doc page slug, e.g. "button", "date-range-selector".'),
      },
    },
    async ({ slug }) => {
      const entry = getComponent(idx, slug);
      if (!entry) return notFound(slug, idx);
      if (!entry.types) {
        return {
          content: [
            { type: "text", text: `No dedicated src/types/${entry.meta.slug}.ts file for "${slug}".` },
          ],
        };
      }
      return {
        content: [
          { type: "text", text: `\`\`\`ts\n// src/types/${entry.meta.slug}.ts\n${entry.types.trimEnd()}\n\`\`\`` },
        ],
      };
    }
  );

  server.registerTool(
    "get_rules",
    {
      title: "Get rules",
      description:
        "Design/usage rules (do/don't) — either the whole corpus, one category (components, forms, " +
        "theming, tokens, layout, accessibility), or every rule tagged to one component slug.",
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe('Optional: a rules category (e.g. "forms") or a component slug (e.g. "dialog"). Omit for everything.'),
      },
    },
    async ({ topic }) => {
      const byCategory = getRules(idx, topic);
      return { content: [{ type: "text", text: formatRulesByCategory(byCategory) }] };
    }
  );

  server.registerTool(
    "migrate",
    {
      title: "Migrate to the 2.3 layout shell",
      description:
        "Runs the library's own codemod over a consuming app: moves AppLayout/AppHeader/Sidebar onto " +
        "the 2.3 shell, swaps MetricCard and Table onto their soft variants, renames AppHeaderProfile " +
        "to ProfilePopover and gslTheme to cletTheme, and deletes the elements the shell no longer " +
        "declares (AppHeaderBranding, SidebarFooter) along with any import they leave unused. " +
        "Defaults to a dry run. Point `path` at the REPOSITORY ROOT, not one app: in a monorepo the " +
        "layout shell often lives in a shared package. Anything needing a human decision is returned " +
        "as a note rather than rewritten, and those notes are the follow-up work.",
      inputSchema: {
        path: z
          .string()
          .describe("Repository root to migrate. Use the workspace root, not a single app directory."),
        write: z
          .boolean()
          .optional()
          .describe("Apply the edits. Omit or false to preview them first."),
        preserve: z
          .boolean()
          .optional()
          .describe(
            "Pin the pre-2.3 appearance instead of adopting the shell: AppLayout to \"panel\", the brand header to \"primary\"."
          ),
      },
    },
    async ({ path: root, write, preserve }) => {
      const { runMigrate } = await import("./migrate.js");
      const result = await runMigrate({
        root,
        write: write ?? false,
        preserve: preserve ?? false,
      });
      const lines = [
        `${result.changes.length} change(s) across ${result.filesChanged} file(s), ${result.filesScanned} scanned (${preserve ? "preserve" : "adopt"} mode).`,
      ];
      if (result.changes.length) {
        lines.push(
          "",
          "## Changes",
          ...result.changes.map((c) => `- ${c.file}:${c.line} ${c.description}`)
        );
      }
      if (result.notes.length) {
        lines.push(
          "",
          "## Needs a decision (not rewritten)",
          ...result.notes.map((n) => `- ${n.file}:${n.line} ${n.message}`)
        );
      }
      if (!write && result.filesChanged > 0) {
        lines.push("", "Nothing was written. Re-run with write: true to apply.");
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.registerTool(
    "search_rules",
    {
      title: "Search rules",
      description: "Free-text search over every rule's title, body, and tagged components.",
      inputSchema: {
        query: z.string().describe('Free-text search, e.g. "required fields" or "modal padding".'),
      },
    },
    async ({ query }) => {
      const results = searchRules(idx, query);
      if (results.length === 0) return { content: [{ type: "text", text: `No rules matched "${query}".` }] };
      return { content: [{ type: "text", text: results.map(formatRuleLine).join("\n") }] };
    }
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get design tokens",
      description:
        "Every --gsl-* design token gslTheme() actually accepts — global tokens (color/radius/shadow/" +
        "z-index/font) plus every component-scoped token (e.g. Card's `padding`, AppHeader's `bg`), with " +
        "base/light/dark values where known. To override any of these at runtime, use the type-safe " +
        "`gslTheme()` helper (see get_component(\"theme\")) rather than hand-writing CSS.",
      inputSchema: {
        component: z
          .string()
          .optional()
          .describe(
            'Optional: a component slug (e.g. "card") to list only that component\'s own tokens. Omit for everything, global tokens first.'
          ),
      },
    },
    async ({ component }) => {
      const wanted = component?.trim().toLowerCase();
      const entries = Object.entries(idx.tokens).filter(
        ([, t]) => !wanted || t.component === wanted
      );
      if (entries.length === 0) {
        return { content: [{ type: "text", text: `No tokens found${wanted ? ` for component "${wanted}"` : ""}.` }] };
      }
      const globalLines = entries
        .filter(([, t]) => t.scope === "global")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, t]) => `- \`${name}\` [${t.group}]${formatTokenValues(t)}`);
      const componentLines = entries
        .filter(([, t]) => t.scope === "component")
        .sort(([a, ta], [b, tb]) => (ta.component ?? "").localeCompare(tb.component ?? "") || a.localeCompare(b))
        .map(([name, t]) => `- \`${name}\` [${t.component}, ${t.group}]${formatTokenValues(t)}`);
      const parts: string[] = [];
      if (globalLines.length) parts.push(`## Global\n\n${globalLines.join("\n")}`);
      if (componentLines.length) parts.push(`## Component-scoped\n\n${componentLines.join("\n")}`);
      return { content: [{ type: "text", text: parts.join("\n\n") }] };
    }
  );

  server.registerTool(
    "search_docs",
    {
      title: "Search docs",
      description:
        "Full-text search across every component's doc prose and headings — broader than search_components, " +
        "useful when you're not sure which component owns a concept (e.g. \"virtual scrolling\", \"URL state\").",
      inputSchema: {
        query: z.string().describe('Free-text search, e.g. "URL driven pagination".'),
      },
    },
    async ({ query }) => {
      const results = searchDocs(idx, query);
      if (results.length === 0) return { content: [{ type: "text", text: `No docs matched "${query}".` }] };
      const text = results
        .map(
          (r) =>
            `- ${r.slug}: ${r.name}${
              r.matchedHeadings.length ? ` — matched: ${r.matchedHeadings.join(", ")}` : ""
            }`
        )
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
