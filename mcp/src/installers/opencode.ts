import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  type InstallResult,
  appendPointerOnce,
  mcpServerCommand,
  readJsonIfExists,
  writeJson,
} from "./util.js";

export function detect(cwd: string): boolean {
  return (
    existsSync(path.join(cwd, "opencode.json")) ||
    existsSync(path.join(os.homedir(), ".config", "opencode"))
  );
}

// Verified against https://opencode.ai/docs/mcp-servers/ and
// https://opencode.ai/docs/config/: top-level `mcp` key in a project-root
// `opencode.json`, each entry `{ type: "local", command: [...], enabled }`.
export async function install(cwd: string): Promise<InstallResult> {
  const configPath = path.join(cwd, "opencode.json");
  const existing = await readJsonIfExists(configPath);
  const isNewFile = !existing;
  const data = existing && typeof existing === "object" ? { ...existing } : {};
  if (isNewFile) data.$schema ??= "https://opencode.ai/config.json";
  const mcp = { ...(data.mcp as Record<string, unknown> | undefined) };
  const command = mcpServerCommand(cwd);
  const desired = {
    type: "local",
    command: [command.command, ...command.args],
    enabled: true,
  };
  const already = JSON.stringify(mcp["rfdtech-ui"]) === JSON.stringify(desired);
  mcp["rfdtech-ui"] = desired;
  data.mcp = mcp;
  await writeJson(configPath, data);

  const agentsChanged = await appendPointerOnce(
    path.join(cwd, "AGENTS.md"),
    "rfdtech-ui",
    "<!-- rfdtech-ui -->\nUse the `rfdtech-ui` MCP server (`search_components`, `get_component`, " +
      "`get_rules`) before building UI with `@rfdtech/components`. Given a screenshot, image, " +
      "mockup, or description of a screen to build, decompose it and map every element to an " +
      "existing `@rfdtech/components` component/variant via the MCP before writing markup — " +
      "only build custom UI if the user explicitly asks for it.\n",
    "Agent notes"
  );

  const changed = !already || agentsChanged;
  return {
    name: "OpenCode",
    changed,
    detail: `opencode.json${already ? " (already set)" : " (updated)"}, AGENTS.md${agentsChanged ? " (updated)" : " (already set)"}`,
  };
}
