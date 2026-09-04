import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { type InstallResult, mergeMcpServers, readJsonIfExists, writeJson } from "./util.js";

export function detect(cwd: string): boolean {
  return existsSync(path.join(cwd, ".cursor"));
}

async function installRule(
  cwd: string,
  slug: string,
  description: string,
  skillSourcePath: string
): Promise<boolean> {
  const rulesDir = path.join(cwd, ".cursor", "rules");
  await mkdir(rulesDir, { recursive: true });
  const rulesPath = path.join(rulesDir, `${slug}.mdc`);
  const skill = await readFile(skillSourcePath, "utf8");
  const mdc = `---\ndescription: ${description}\nglobs: ["**/*.tsx", "**/*.ts"]\nalwaysApply: false\n---\n\n${skill}`;
  const rulesChanged = !existsSync(rulesPath) || (await readFile(rulesPath, "utf8")) !== mdc;
  await writeFile(rulesPath, mdc, "utf8");
  return rulesChanged;
}

export async function install(
  cwd: string,
  skillSourcePath: string,
  skillImageSourcePath: string
): Promise<InstallResult> {
  const mcpJsonPath = path.join(cwd, ".cursor", "mcp.json");
  const existing = await readJsonIfExists(mcpJsonPath);
  const { data, changed: mcpChanged } = mergeMcpServers(existing, cwd);
  await writeJson(mcpJsonPath, data);

  const rulesChanged = await installRule(
    cwd,
    "rfdtech-ui",
    "GSL (@rfdtech/components) usage rules",
    skillSourcePath
  );
  const imageRulesChanged = await installRule(
    cwd,
    "image-to-components",
    "Translate screenshots/mockups into GSL (@rfdtech/components) components",
    skillImageSourcePath
  );

  const changed = mcpChanged || rulesChanged || imageRulesChanged;
  return {
    name: "Cursor",
    changed,
    detail:
      `.cursor/mcp.json${mcpChanged ? " (updated)" : " (already set)"}, ` +
      `.cursor/rules/rfdtech-ui.mdc${rulesChanged ? " (updated)" : " (already set)"}, ` +
      `.cursor/rules/image-to-components.mdc${imageRulesChanged ? " (updated)" : " (already set)"}`,
  };
}
