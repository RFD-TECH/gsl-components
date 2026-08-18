import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { SKILL_SOURCE_PATH, SKILL_IMAGE_SOURCE_PATH } from "../paths.js";
import * as claude from "./claude.js";
import * as cursor from "./cursor.js";
import * as codex from "./codex.js";
import * as opencode from "./opencode.js";
import { type InstallResult, projectServerEntry } from "./util.js";

export async function runSetup(cwd: string = process.cwd()): Promise<void> {
  console.log("rfdui setup — detecting AI tools...\n");

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

  if (results.length === 0) {
    // Deliberately not `npx components-mcp`: that name belongs to an unrelated
    // package on the public registry, and npx reaches for it whenever the local
    // bin is not resolvable, which is exactly the case here.
    console.log(
      "No supported AI tool detected (looked for .claude/, .mcp.json, .cursor/, ~/.codex/, " +
        "opencode.json, ~/.config/opencode).\n" +
        "The MCP server is still available directly: run `rfdui mcp`, or point your tool at\n" +
        `  node ${projectServerEntry(cwd)}`
    );
    return;
  }

  for (const r of results) {
    console.log(`${r.changed ? "✓" : "•"} ${r.name}: ${r.detail}`);
  }
}
