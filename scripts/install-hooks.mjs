#!/usr/bin/env node
// Points git at the committed .husky directory so the hooks in it actually run.
// This is what husky itself does; doing it here keeps the repo dependency-free.
// Silent and non-fatal everywhere it doesn't apply: a tarball install, a CI
// checkout with no .git, or a consumer installing this package from a git URL.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

try {
  if (!existsSync(".husky")) process.exit(0);
  execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
  execFileSync("git", ["config", "core.hooksPath", ".husky"], { stdio: "ignore" });
} catch {
  // Not a git checkout, or git is unavailable. Nothing to wire up.
}
