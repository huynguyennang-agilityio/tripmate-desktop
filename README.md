# tripmate-desktop

TripMate Desktop app (Tauri) for macOS, Windows, and Linux.

The Tauri project, CI, and the rules for contributors come with card
DF1 ([tasks/EPIC-11.md](tasks/EPIC-11.md)).

## Checks before a push

A Claude Code hook runs the local checks before Claude runs `git push`
or `gh pr create` in this repository, and blocks the command when one
fails, with the failing output. It is registered in
`.claude/settings.json` and lives in
`.claude/hooks/check-before-push.mjs`.

| Check | Runs |
|-------|------|
| `node scripts/check-line-endings.mjs`: no changed file, and every text file LF | Always |
| `cargo clippy --all-targets -- -D warnings` | Once a `Cargo.toml` exists at the root or in `src-tauri/` |
| `cargo test` | Once a `Cargo.toml` exists at the root or in `src-tauri/` |

Deleting a remote branch is not checked. The hook needs Node.js; CI
stays the gate on `main`.

`.gitattributes` stores and checks out every text file with LF on every
OS, whatever `core.autocrlf` is.
