# tripmate-desktop -- Rules for Contributors and AI Agents

The TripMate Desktop client: a Tauri 2 shell in Rust for macOS, Windows,
and Linux. It runs the static build of `tripmate-web` in a native window.
The screens are the Web build; this repository holds only what the PRD
lists for Desktop (DESK-01 to DESK-07, EPIC-12).

## Read first

Product documents live in `../tripmate-docs/` (cloned side by side) and
are never copied here. Read them in place:

- `../tripmate-docs/CLAUDE.md`, section "Working on several machines":
  the shared rules every session follows (language, decisions, status,
  secrets, who pushes).
- `../tripmate-docs/GLOSSARY.md`: domain terms; use them in names and messages.
- `../tripmate-docs/docs/architecture.md`, sections 3 and 8.3: what the
  Desktop client does and does not do.
- `../tripmate-docs/docs/security.md`, `docs/test-strategy.md`.
- `../tripmate-docs/docs/development-flow.md`: task files, cards, risk
  levels, the four agents (section 2.3), what is written where (section 2.4).
- The task of the card being built: `tasks/<epic>.md` in this repository
  (for example `tasks/EPIC-11.md`).
- The spec of the epic being built:
  `../tripmate-docs/docs/specs/<epic>/spec.md` (the platform work is
  EPIC-11, sections 2.9, 2.12 and 4.3).

When a document does not decide something, stop and ask the product
owner; do not guess.

## Language

- Talk with the product owner in Vietnamese.
- Write code, comments, commits, pull requests and documents in English.

## How a card is built

Each card runs four agents, each in a new session with no memory of the
others; only files and the comments on the pull request pass between
them. The roles are in `.claude/agents/`.

Each agent's model is set in its role file: `code-agent` runs on Sonnet;
`test-agent`, `test-check-agent`, and `diff-review-agent` run on Opus
(development-flow.md, section 2.3). Do not override it when starting an
agent.

1. Test agent (`test-agent.md`): one test per case of the task, a test
   commit with the trailer `Agent: test`, each new test shown failing.
2. Code agent (`code-agent.md`): code until every test passes, the
   local checks, the decisions.
3. Test-check agent (`test-check-agent.md`), locally: the tests against
   the task, the code against the tests. Its report goes in the pull
   request description; a test problem goes to a new test agent
   session, a code problem to the code agent.
4. Pull request, opened by the code agent when the report is clean and
   the product owner says so. CI runs.
5. Diff review, round 1 (`diff-review-agent.md`): findings on the pull
   request at file and line, and a summary comment with the impact and
   the risk level.
6. The code agent fixes each round 1 finding, or replies with the
   reason it does not apply, and pushes.
7. Diff review, round 2, in a new session: the diff since round 1 and
   the replies; nothing is fixed. A defect asks the product owner to
   review; every other finding is a note.
8. Notes: `tasks/<epic>-notes/<card>.md`, one file per card, written by
   the round 2 agent, committed by the code agent in the card's pull
   request, and settled when the epic closes.

A card never changes its task file `tasks/<epic>.md`; a correction goes
through a planning pull request and the product owner's approval.

## Setup

- Rust: the toolchain is pinned in `rust-toolchain.toml` (1.100.0, with
  `clippy` and `rustfmt`). Install `rustup`; the first `cargo` command in
  the repository installs the pinned toolchain.
- Node.js 24, only for `scripts/` and the hook. No `package.json`, no
  `npm install`.
- Tauri 2 prerequisites by platform:
  - Windows: Visual Studio Build Tools 2022 with the "Desktop development
    with C++" workload, and the WebView2 runtime (already on Windows 11).
  - macOS: Xcode Command Line Tools (`xcode-select --install`).
  - Linux (Debian and Ubuntu): `sudo apt-get install -y libwebkit2gtk-4.1-dev
    libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
    (CI installs the same packages).

## Commands

| Command | What it does | CI check |
|---------|--------------|----------|
| `cargo build` | Builds the shell (debug) | `clippy` and `test` compile it |
| `cargo run` | Runs the app; opens a window with the placeholder page | -- |
| `cargo clippy --all-targets -- -D warnings` | Clippy's default lints on code and tests; any warning, clippy or rustc, fails | `clippy` (with `--locked`) |
| `cargo test` | Unit tests in `src/` and integration tests in `tests/` | `test` (with `--locked`) |
| `node scripts/check-line-endings.mjs` | Fails when the tree has any changed file, or any text file has a CRLF or mixed ending | -- |

A Claude Code hook runs the checks for you. Before Claude runs `git push`
or `gh pr create` in this repository, the `PreToolUse` hook in
`.claude/settings.json` runs the line-endings check, `cargo clippy` and
`cargo test` (`.claude/hooks/check-before-push.mjs`), and blocks the
command when one fails, with the failing output. Fix the problem, commit,
and run the command again; never work around the hook. Deleting a remote
branch is not checked. CI stays the gate on `main`.

## CI

`.github/workflows/ci.yml` runs on every pull request to `main` and on
every push to `main`, on `ubuntu-latest`. Each job is a check required on
`main`; the check's name is the job's name:

| Job | Runs |
|-----|------|
| `clippy` | `cargo clippy --locked --all-targets -- -D warnings` |
| `test` | `cargo test --locked` |

There is no separate build job: both compile the crate. Installers and
the build for each platform come with DESK-07. Third-party actions are
pinned to a full commit SHA with the version in a comment.

## Flow checks

`.github/workflows/flow.yml` runs the checks of development-flow.md,
section 2.3 (EPIC-11 spec, section 2.12), by calling the backend's reusable
`flow-checks.yml`; `.github/workflows/risk-gate.yml` (`pull_request_target`)
calls the backend's `risk-gate-check.yml`. Both are pinned to the same full
commit SHA of `tripmate-backend`; moving the pin is a normal pull request.
The checks required on `main`, with `clippy` and `test`, are
`flow / failing-first`, `flow / test-lock`, and `gate / risk-gate`.
`flow / mutation` is skipped here (no rule files) and `flow / risk-gate` is
always skipped; never require them.

- `failing-first`: each test file a test commit adds (trailer `Agent: test`)
  is run on its own at that commit with `cargo test --locked --test <file>`
  and must fail there, and a run of 0 tests is an error.
- `test-lock`: a commit without the trailer `Agent: test` must not change,
  skip, or delete a test of a test commit. The lock covers each test file
  as a whole: any change to it by a commit without the trailer breaks it.
  A test commit changes files under `tests/` only.
- `risk-gate`: a High path changed and the pull request has no
  `human-approved` label. Only the product owner adds that label; Claude
  Code never does. A push removes it.
- The path list is `.github/risk-paths.toml`. High: `.github/**`,
  `scripts/**`, every `CLAUDE.md`, `.claude/**`, `Cargo.toml`, `Cargo.lock`,
  `rust-toolchain.toml`, `build.rs`, `tauri.conf.json`, `capabilities/**`,
  `.gitattributes`. Low: `src/**`, `tests/**`, `ui/**`, `icons/**`,
  `tasks/**`, `README.md`, `.gitignore`. A path no rule names is High.
  `src/**` is Low, so a command or a lint attribute added there passes the
  gate; see the two rules in Conventions, which the diff review enforces.

### Rust tests

- The test agent writes integration tests as `tests/<card>-<subject>.rs`
  with the case ID in each test's name, for example `tests/DESK01-window.rs`
  with `fn desk01_1_...`; one file per test commit file. The checks read
  only the top-level `tests/*.rs`, because each file is its own Cargo test
  target.
- Helpers go under `tests/common/` (for example `tests/common/mod.rs`).
  They are support files of the test commit: only a commit with the trailer
  `Agent: test` may change them.
- Unit tests inside `src/` (`#[cfg(test)]`) are the code agent's own. They
  are not covered by failing first or the lock.
- Never skip a test (`#[ignore]`, a `cfg` switch that turns it off): a
  test that should not run fails instead.

## Folder layout

The crate is at the repository root, so Cargo's `tests/` folder is also
the folder the flow checks treat as tests.

```text
tripmate-desktop/
├── .claude/agents/        the four agent roles
├── .github/               workflows (ci, flow, risk-gate) and risk-paths.toml
├── capabilities/          what the web view may call (default.json)
├── icons/                 app icons
├── scripts/               Node scripts run by the hook and on every machine
├── src/
│   ├── main.rs            entry point; calls lib.rs
│   └── lib.rs             pub fn run(), the Tauri builder
├── tasks/                 <epic>.md task files (planning pull requests
│                          only) and <epic>-notes/<card>.md notes files
├── tests/                 integration tests of the test agent
├── ui/index.html          placeholder page (frontendDist) until DESK-01
├── build.rs, Cargo.toml, Cargo.lock, rust-toolchain.toml
└── tauri.conf.json
```

## Conventions

- No secret ever lives in this client; the repository is public. Never
  commit a `.env` file, a token, a key, a signing key or a password.
- No money, voting, or Gap logic in this client (architecture.md, section
  3): the Rust shell does only what the PRD lists for Desktop; the backend
  owns the rules.
- Add no Tauri plugin and no capability beyond what the card needs. A
  capability widens what the web view may call, so it is a High path.
- A `#[tauri::command]` is reachable from every window until the app
  declares an app manifest. The card that adds the first command declares
  it in `build.rs` (`tauri_build::Attributes::new().app_manifest(AppManifest::new().commands(&[...]))`),
  lists every command there, and grants each one in `capabilities/**`.
  Both are High paths. An empty manifest gates nothing (tauri-build 2.7.6,
  `src/acl.rs` lines 421-425), so never add one without a real command.
  Until then, the diff review checks that no command is added without this.
- Lint attributes (`#[allow]`, `#[expect]`, `#![allow]`, `#![expect]`) in
  `src/**` are a known limit of the Low level: they can switch off the
  `clippy` gate. The diff review checks each one; one that silences a
  warning without a reason in the code is a finding.
- Commit `Cargo.lock`. Use `--locked` in CI and in checks you run before a push.
- Shared scripts are Node (`.mjs`), never PowerShell or bash, so they run
  the same on Windows and macOS.
- Branch `<type>/<ID>-<short-name>`, for example `chore/DF1-desktop-repository-ci`;
  every commit message and pull request title starts with the card ID
  (development-flow.md, section 2.5).
- The test commit carries the trailer `Agent: test`. No other commit
  changes, skips, or deletes a test of the test agent.
- Push only when the product owner says so.

## Windows and macOS

The work runs on Windows and on macOS.

- `.gitattributes` stores and checks out every text file with LF on every
  OS, whatever `core.autocrlf` is; image and font files are binary.
  Editors must keep LF.
- After any change, `git status --porcelain` must show only the files you
  meant to change; `node scripts/check-line-endings.mjs` checks a clean tree.
- Use `path` and `node:` APIs in scripts, never hard-coded `/` or `\`
  separators or shell-specific commands.
