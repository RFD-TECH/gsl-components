import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface InstallResult {
  name: string;
  changed: boolean;
  detail: string;
}

export async function readJsonIfExists(filePath: string): Promise<Record<string, unknown> | null> {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** Absolute path to this package's own compiled server entry (dist/mcp/index.js,
 * one level up from dist/mcp/installers/). Resolved from where THIS module is
 * actually loaded from, so it's correct no matter how the host project's package
 * manager lays out node_modules.
 *
 * `npx -y components-mcp` used to be used here, on the theory that npx would
 * resolve the already-installed local bin. That's false in non-hoisted/strict
 * node_modules layouts (e.g. a pnpm workspace where nothing at the repo root
 * directly depends on @rfdtech/components) — npx finds no local bin and silently
 * installs an unrelated same-named package from the npm registry instead. A
 * direct `node <absolute path>` has no such ambiguity. */
const SERVER_ENTRY_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "index.js");

/** The package's entry as the project itself addresses it. Under pnpm this is a
 * symlink into the store, so it keeps resolving after an upgrade moves the real
 * directory, which a version-stamped absolute path does not. */
const LINKED_ENTRY = "node_modules/@rfdtech/components/dist/mcp/index.js";

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

/** Entry path to write into a config that belongs to a project.
 *
 * Absolute paths are resolved on the machine that ran setup, so a config
 * carrying one is valid nowhere else: not on a colleague's checkout, not in CI,
 * and not after the package moves. A project-relative path is portable, and the
 * host launches these commands from the project root. The absolute path stays
 * as the last resort, for an install that genuinely lives outside the project. */
export function projectServerEntry(projectRoot: string): string {
  if (existsSync(path.join(projectRoot, LINKED_ENTRY))) return LINKED_ENTRY;

  const relative = path.relative(projectRoot, SERVER_ENTRY_PATH);
  const insideProject =
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
  return insideProject ? toPosix(relative) : SERVER_ENTRY_PATH;
}

/** The MCP server identity every installer wires up, consistently named across tools. */
export const MCP_SERVER_NAME = "rfdtech-ui";

/** Command for a project-scoped config: Claude Code, Cursor, opencode. */
export function mcpServerCommand(projectRoot: string): {
  command: string;
  args: string[];
} {
  return { command: "node", args: [projectServerEntry(projectRoot)] };
}

/** Command for a machine-scoped config (Codex writes to `~/.codex/config.toml`),
 * which has no project directory to be relative to. */
export const GLOBAL_MCP_SERVER_COMMAND = {
  command: "node",
  args: [SERVER_ENTRY_PATH],
};

/** Merge `{ mcpServers: { "rfdtech-ui": {...} } }` into an existing config object without touching anything else. */
export function mergeMcpServers(
  existing: Record<string, unknown> | null,
  projectRoot: string,
): {
  data: Record<string, unknown>;
  changed: boolean;
} {
  const command = mcpServerCommand(projectRoot);
  const data = existing && typeof existing === "object" ? { ...existing } : {};
  const servers = { ...(data.mcpServers as Record<string, unknown> | undefined) };
  const already = JSON.stringify(servers[MCP_SERVER_NAME]) === JSON.stringify(command);
  servers[MCP_SERVER_NAME] = command;
  data.mcpServers = servers;
  return { data, changed: !already };
}

/** Append `marker`-tagged content to a markdown file once; no-op if already present. */
export async function appendPointerOnce(
  filePath: string,
  marker: string,
  block: string,
  fallbackHeading: string
): Promise<boolean> {
  if (existsSync(filePath)) {
    const content = await readFile(filePath, "utf8");
    if (content.includes(marker)) return false;
    await writeFile(filePath, content.replace(/\s*$/, "") + "\n\n" + block, "utf8");
    return true;
  }
  await writeFile(filePath, `# ${fallbackHeading}\n\n${block}`, "utf8");
  return true;
}
