import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type InstallResult, GLOBAL_MCP_SERVER_COMMAND } from "./util.js";

const CODEX_DIR = path.join(os.homedir(), ".codex");
const CONFIG_PATH = path.join(CODEX_DIR, "config.toml");
const MARKER = "[mcp_servers.rfdtech-ui]";

export function detect(): boolean {
  return existsSync(CODEX_DIR);
}

// Codex config is TOML. Rather than pull in a TOML parser/writer for one
// block, we do a text-level idempotent append — safe because we only ever
// check for and add our own uniquely-named `[mcp_servers.rfdtech-ui]` table
// and never touch any other section.
export async function install(): Promise<InstallResult> {
  await mkdir(CODEX_DIR, { recursive: true });
  const existing = existsSync(CONFIG_PATH) ? await readFile(CONFIG_PATH, "utf8") : "";

  if (existing.includes(MARKER)) {
    return { name: "Codex", changed: false, detail: "~/.codex/config.toml (already set)" };
  }

  const block = `\n${MARKER}\ncommand = ${JSON.stringify(GLOBAL_MCP_SERVER_COMMAND.command)}\nargs = ${JSON.stringify(GLOBAL_MCP_SERVER_COMMAND.args)}\n`;
  await writeFile(CONFIG_PATH, existing.replace(/\s*$/, "") + "\n" + block, "utf8");
  return { name: "Codex", changed: true, detail: "~/.codex/config.toml (updated)" };
}
