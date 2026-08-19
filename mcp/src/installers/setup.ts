import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { PACKAGE_VERSION, SKILL_SOURCE_PATH, SKILL_IMAGE_SOURCE_PATH } from "../paths.js";
import * as claude from "./claude.js";
import * as cursor from "./cursor.js";
import * as codex from "./codex.js";
import * as opencode from "./opencode.js";
import {
  type InstallResult,
  MCP_SERVER_NAME,
  mcpServerCommand,
  readJsonIfExists,
  writeJson,
} from "./util.js";

/** Records which version a project was last set up with, so the next install
 * can tell an upgrade from a re-run. Lives next to the skills setup already
 * writes, and is rewritten on every run. */
const VERSION_STAMP = [".ai", "rfdui.json"];

async function readStampedVersion(cwd: string): Promise<string | null> {
  const stamp = await readJsonIfExists(path.join(cwd, ...VERSION_STAMP));
  const version = stamp?.version;
  return typeof version === "string" ? version : null;
}

/** Printed as the last thing an install says, because an upgrade is the one
 * moment the codemod is worth running and the moment nobody goes looking for
 * it. An agent that reads nothing else reads the tail of its own install log. */
function upgradeNotice(from: string, to: string): string {
  const rule = "=".repeat(70);
  return [
    "",
    rule,
    `  @rfdtech/components upgraded: ${from} -> ${to}`,
    "",
    "  Run the codemod before writing or editing any UI code:",
    "",
    "    npx rfdui migrate           # dry run, prints every change it would make",
    "    npx rfdui migrate --write   # apply",
    "",
    "  It rewrites what is mechanical and reports, with a file and line, what",
    "  needs a decision. For the breaking changes it cannot rewrite, read the",
    '  migration guide: get_component("migration-v2") over MCP, or',
    "  https://gsl-components.vercel.app/docs/migration-v2",
    "",
    "  Using the MCP server? Call its `migrate` tool instead of the CLI.",
    rule,
    "",
  ].join("\n");
}

export async function runSetup(cwd: string = process.cwd()): Promise<void> {
  console.log("rfdui setup — detecting AI tools...\n");

  // Read before anything is written: the stamp is what the previous install
  // left behind, and it is about to be overwritten with the current version.
  const previousVersion = await readStampedVersion(cwd);

  // Always drop the cross-tool skills, regardless of which specific tool (if any) is detected.
  const aiDir = path.join(cwd, ".ai");
  await mkdir(aiDir, { recursive: true });
  await copyFile(SKILL_SOURCE_PATH, path.join(aiDir, "SKILL.md"));
  await copyFile(SKILL_IMAGE_SOURCE_PATH, path.join(aiDir, "image-to-components.md"));
  console.log("✓ .ai/SKILL.md, .ai/image-to-components.md written\n");

  const results: InstallResult[] = [];
  if (claude.detect(cwd))
    results.push(await claude.install(cwd, SKILL_SOURCE_PATH, SKILL_IMAGE_SOURCE_PATH));
  if (cursor.detect(cwd))
    results.push(await cursor.install(cwd, SKILL_SOURCE_PATH, SKILL_IMAGE_SOURCE_PATH));
  if (codex.detect()) results.push(await codex.install());
  if (opencode.detect(cwd)) results.push(await opencode.install(cwd));

  await writeJson(path.join(cwd, ...VERSION_STAMP), { version: PACKAGE_VERSION });

  if (results.length === 0) {
    // Deliberately not `npx components-mcp`: that name is an unrelated package
    // on the registry, which npx reaches for when the local bin is missing.
    console.log(
      "No supported AI tool detected (looked for .claude/, .mcp.json, .cursor/, ~/.codex/, " +
        "opencode.json, ~/.config/opencode).\n" +
        "\nTo wire the rfdtech-ui MCP server by hand, add this to the project's .mcp.json:\n" +
        `\n${JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: mcpServerCommand(cwd) } }, null, 2)}\n` +
        "\nThen re-run `npx rfdui setup` to drop the skills alongside it."
    );
  } else {
    for (const r of results) {
      console.log(`${r.changed ? "✓" : "•"} ${r.name}: ${r.detail}`);
    }
    // A written config is not a running server: hosts read it at startup, and
    // Claude Code asks the user to approve a project-scoped one first.
    console.log(
      `\nRestart your AI tool to connect the ${MCP_SERVER_NAME} MCP server ` +
        "(Claude Code will ask the user to approve it once)."
    );
  }

  // A first install has nothing to migrate; only a version that moved does.
  if (previousVersion && previousVersion !== PACKAGE_VERSION) {
    console.log(upgradeNotice(previousVersion, PACKAGE_VERSION));
  }
}
