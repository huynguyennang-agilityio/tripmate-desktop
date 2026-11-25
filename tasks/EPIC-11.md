# tripmate-desktop -- EPIC-11 Tasks: Platform Foundation

**Document type:** Task file\
**Epic:** EPIC-11, first part, Phase 1\
**Repository:** `tripmate-desktop`\
**Machine:** Windows\
**Spec:** [EPIC-11 spec](https://github.com/huynguyennang-agilityio/tripmate-docs/blob/main/docs/specs/epic-11/spec.md)\
**Status:** Proposed\
**Version:** 1.0

The tasks of EPIC-11 in this repository, in the order they start. Each task holds everything its Trello card will say ([development-flow.md](https://github.com/huynguyennang-agilityio/tripmate-docs/blob/main/docs/development-flow.md), section 1). The behaviour, the design, the order of the cards across repositories, and the checkpoints are in the spec, section 6.

Test case levels are the letters of [test-strategy.md](https://github.com/huynguyennang-agilityio/tripmate-docs/blob/main/docs/test-strategy.md), section 2. A case of level M has no automated test; it is shown once by hand and listed under Manual checks.

| Task | Title | Size | Risk | Depends on | Wave |
|------|-------|------|------|------------|------|
| [DF1](#df1) | Desktop repository and CI | S | High | F14 | 2 |

## DF1

**DF1 Desktop repository and CI**

**Facts**

| Fact | Value |
|------|-------|
| Epic | EPIC-11 |
| Repository | `tripmate-desktop` |
| Machine | Windows, wave 2 |
| Size | S |
| Risk | High: it adds CI, `CLAUDE.md`, and the agent roles |
| Depends on | F14 |
| Requirements | -- |
| Spec sections | 2.9, 2.12, 4.3 |

**Scope**

- A Tauri 2 project that builds.
- `cargo clippy` and `cargo test`, and the flow checks of 2.12, required on `main`.
- `CLAUDE.md`, `.gitattributes`, and the four agent roles (4.3).

**Leaves out**

- The window that loads the Web build, and installers: DESK-01 and DESK-07 in EPIC-12.

**Done when**

A Tauri 2 project that builds; the checks of 2.9 and 2.12 required on `main`; `CLAUDE.md` and the four agent roles (4.3). The window that loads the Web build is DESK-01, in EPIC-12.

**Test cases**

| Case | Kind | Given | Expected | Level |
|------|------|-------|----------|-------|
| DF1-1 | Main | The Tauri 2 project with no problem | It builds; `cargo clippy` and `cargo test` pass, and each is required on `main` | M |
| DF1-2 | Error | A clippy warning | The check fails | M |

**Manual checks**

- [ ] DF1-1: The Tauri 2 project with no problem → It builds; `cargo clippy` and `cargo test` pass, and each is required on `main`
- [ ] DF1-2: A clippy warning → The check fails

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-11-25 | First version: the 1 task of EPIC-11 in this repository, moved from the EPIC-11 spec, sections 6 and 7, with scope, what each leaves out, the reason for its risk level, and its manual checks. The skeleton tasks write four agent roles, as development-flow.md now says. |
