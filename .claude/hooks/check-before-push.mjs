// Claude Code PreToolUse hook: before Claude pushes a branch or opens a
// pull request, run the local checks that CI runs, and block the command
// when one fails. Registered in .claude/settings.json.
//
// Claude Code sends the tool call as JSON on stdin. Exit code 0 lets the
// command run; exit code 2 blocks it and sends stderr back to Claude.
// Claude Code treats any other exit code as a non-blocking error and lets
// the command run, so every failure of this script exits with 2: a broken
// hook never lets an unchecked push through.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// `git push` (but not a branch deletion) and `gh pr create`, anywhere in
// the command, for example after `cd` or in a chain with `&&`.
const GATED = /\bgh\s+pr\s+create\b|\bgit\s+push\b(?![^;&|\n]*\s(--delete|-d)\b)/;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

process.on("uncaughtException", (error) => block(`check-before-push: ${error.message}`));

// The checks, in the order CI runs them. The Rust checks run once the
// Tauri project exists (card DF1): at the root or in src-tauri/.
function checks() {
  const list = [{ name: "line endings", cmd: "node", args: ["scripts/check-line-endings.mjs"] }];
  const manifest = ["Cargo.toml", join("src-tauri", "Cargo.toml")].find((p) =>
    existsSync(join(repoRoot, p)),
  );
  if (manifest) {
    const m = ["--manifest-path", manifest];
    list.push(
      { name: "cargo clippy", cmd: "cargo", args: ["clippy", ...m, "--all-targets", "--", "-D", "warnings"] },
      { name: "cargo test", cmd: "cargo", args: ["test", ...m] },
    );
  }
  return list;
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let command;
try {
  command = JSON.parse(raw)?.tool_input?.command;
} catch {
  block("check-before-push: could not read the tool call from stdin.");
}

if (typeof command !== "string" || !GATED.test(command)) process.exit(0);

for (const check of checks()) {
  const run = spawnSync(check.cmd, check.args, { cwd: repoRoot, encoding: "utf8" });
  if (run.error) block(`check-before-push: could not run ${check.cmd}: ${run.error.message}`);
  if (run.status !== 0) {
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim().slice(-4000);
    block(
      `Blocked: ${check.name} failed, so this push or pull request did not run.\n` +
        `Fix the problem, commit, and run the command again.\n\n${output}`,
    );
  }
}

process.exit(0);
