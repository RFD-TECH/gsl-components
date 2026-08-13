#!/usr/bin/env node
// Pre-commit gate for the habits a generated diff tends to leave behind.
// Only added lines are inspected, so existing code is never re-litigated and
// the check stays actionable: every failure is something in this commit.
import { execFileSync } from "node:child_process";

const SOURCE = /\.(?:m?[jt]sx?|css|scss)$/;

// A block above the first line of code explains the module and is welcome.
// Anything after that is narration sitting in the middle of logic.
const MAX_COMMENT_RUN = 3;

// Names that are clear at a glance despite being short.
const SHORT_NAME_ALLOWED = new Set([
  "i", "j", "k", "n", "x", "y", "z", "id", "el", "fn", "db", "ok", "to", "up",
  "on", "at", "px", "py", "ms", "kb", "mb", "ref", "key", "map", "set", "ts",
]);

const DECLARATION = /(?:^|[;{(\s])(?:const|let|var)\s+([A-Za-z_$][\w$]?)\s*[=:]/g;
const COMMENT = /^\s*(?:\/\/|\/\*|\*(?!\/)|\*\/|\{\/\*)/;

// JSDoc documents the symbol underneath it and is read by the docs indexer, so
// it is API surface rather than narration however long it runs.
const JSDOC = /^\s*\/\*\*/;

// Escaped, so this file does not trip its own rule.
const DASH = /[\u2014\u2013]/;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** Added lines of a staged file, paired with their line number in the result. */
function addedLines(file) {
  const diff = git(["diff", "--cached", "-U0", "--", file]);
  const lines = [];
  let next = 0;
  for (const row of diff.split("\n")) {
    const hunk = row.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) {
      next = Number(hunk[1]);
      continue;
    }
    if (row.startsWith("+") && !row.startsWith("+++")) {
      lines.push({ no: next, text: row.slice(1) });
      next += 1;
    }
  }
  return lines;
}

/** Line number of the first real code in the staged file, 1-based. */
function firstCode(file) {
  const content = git(["show", `:${file}`]).split("\n");
  let inBlock = false;
  for (let index = 0; index < content.length; index += 1) {
    const text = content[index].trim();
    if (!text) continue;
    if (index === 0 && text.startsWith("#!")) continue;
    if (inBlock) {
      if (text.includes("*/")) inBlock = false;
      continue;
    }
    if (text.startsWith("/*")) {
      if (!text.includes("*/")) inBlock = true;
      continue;
    }
    if (text.startsWith("//")) continue;
    return index + 1;
  }
  return content.length + 1;
}

const failures = [];
const staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACM"])
  .split("\n")
  .filter((f) => f && SOURCE.test(f));

for (const file of staged) {
  const lines = addedLines(file);
  const firstCodeLine = firstCode(file);

  let run = [];
  const flushRun = () => {
    if (
      run.length > MAX_COMMENT_RUN &&
      run[0].no > firstCodeLine &&
      !JSDOC.test(run[0].text)
    ) {
      failures.push(
        `${file}:${run[0].no}  ${run.length}-line comment block in the middle of the code. ` +
          `Cut it to ${MAX_COMMENT_RUN} lines or move it to the top of the file.`,
      );
    }
    run = [];
  };

  for (const line of lines) {
    if (COMMENT.test(line.text)) {
      if (run.length && line.no !== run[run.length - 1].no + 1) flushRun();
      run.push(line);
    } else {
      flushRun();
    }

    if (DASH.test(line.text)) {
      failures.push(`${file}:${line.no}  em or en dash. Use a comma, a colon, or two sentences.`);
    }

    for (const match of line.text.matchAll(DECLARATION)) {
      const name = match[1];
      if (!SHORT_NAME_ALLOWED.has(name)) {
        failures.push(`${file}:${line.no}  single-letter name "${name}". Name it for what it holds.`);
      }
    }
  }
  flushRun();
}

if (failures.length) {
  console.error(`\nBlocked ${failures.length} issue(s) in staged changes:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nFix them, or commit with --no-verify if you genuinely mean it.\n");
  process.exit(1);
}
