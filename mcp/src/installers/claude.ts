import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  type InstallResult,
  appendPointerOnce,
  mergeMcpServers,
  readJsonIfExists,
  writeJson,
} from "./util.js";

export function detect(cwd: string): boolean {
  return existsSync(path.join(cwd, ".claude")) || existsSync(path.join(cwd, ".mcp.json"));
}

async function installSkill(cwd: string, slug: string, skillSourcePath: string): Promise<boolean> {
  const skillDir = path.join(cwd, ".claude", "skills", slug);
  await mkdir(skillDir, { recursive: true });
  const skillDest = path.join(skillDir, "SKILL.md");
  const skillSource = await readFile(skillSourcePath, "utf8");
  const skillChanged = !existsSync(skillDest) || (await readFile(skillDest, "utf8")) !== skillSource;
  await copyFile(skillSourcePath, skillDest);
  return skillChanged;
}

export async function install(
  cwd: string,
  skillSourcePath: string,
  skillImageSourcePath: string
): Promise<InstallResult> {
  const mcpJsonPath = path.join(cwd, ".mcp.json");
  const existing = await readJsonIfExists(mcpJsonPath);
  const { data, changed: mcpChanged } = mergeMcpServers(existing, cwd);
  await writeJson(mcpJsonPath, data);

  const skillChanged = await installSkill(cwd, "rfdtech-ui", skillSourcePath);
  const imageSkillChanged = await installSkill(cwd, "image-to-components", skillImageSourcePath);

  const claudeMdChanged = await appendPointerOnce(
    path.join(cwd, "CLAUDE.md"),
    "rfdtech-ui",
    "<!-- rfdtech-ui -->\nBefore writing UI code, see `.claude/skills/rfdtech-ui/SKILL.md` for " +
      "`@rfdtech/components` conventions (search components, use authoritative types, follow the rules). " +
      "Given a screenshot, image, mockup, or description of a screen to build, see " +
      "`.claude/skills/image-to-components/SKILL.md` first.\n",
    "Project notes"
  );

  const changed = mcpChanged || skillChanged || imageSkillChanged || claudeMdChanged;
  return {
    name: "Claude Code",
    changed,
    detail:
      `.mcp.json${mcpChanged ? " (updated)" : " (already set)"}, ` +
      `.claude/skills/rfdtech-ui/SKILL.md${skillChanged ? " (updated)" : " (already set)"}, ` +
      `.claude/skills/image-to-components/SKILL.md${imageSkillChanged ? " (updated)" : " (already set)"}, ` +
      `CLAUDE.md${claudeMdChanged ? " (updated)" : " (already set)"}`,
  };
}
