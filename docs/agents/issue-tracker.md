# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Agent loop execution state is recorded as an `Agent state:` line near the top of each issue file.
- Agent working method is recorded as an optional `Workflow:` line near the top of each issue file.
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

Example issue metadata:

```md
# Issue Title

Status: ready-for-agent
Agent state: pending
Workflow: content
Type: AFK
```

## Agent workflow

`Workflow:` selects how the automated agent should approach implementation. It does not change issue eligibility, `Agent state:`, or verification gates.

Allowed `Workflow:` values:

- `tdd` - behavior and code changes. This is the default when `Workflow:` is missing.
- `content` - documentation, website copy, examples, navigation, and static content changes. The agent implements directly, does not force a red-green-refactor loop, and adds or updates tests only when they protect executable behavior or prevent a meaningful regression. The normal verification gates still run; content-specific checks such as docs builds, preview builds, link/path inspection, or screenshots are selected based on the touched surface and issue acceptance criteria.

The `Workflow:` field name is case-sensitive. Workflow values are trimmed and normalized to lowercase; write them lowercase in issue files. Multiple `Workflow:` lines or unknown workflow values are issue metadata errors and stop issue-loop planning. The workflow declared in the issue is the durable source of truth; the loop does not provide a CLI override in v1.

When introducing `Workflow:` for an existing content-heavy feature directory, update the affected pending issues to `Workflow: content` during triage so the next loop run uses the intended workflow immediately.

For v1, `Workflow: tdd` maps to the repo's TDD skill prompt, while `Workflow: content` uses inline loop prompt instructions rather than a separate skill file.

## Agent loop state

`Status:` and `Agent state:` are separate state machines:

- `Status:` records whether the issue is suitable for delegation (`ready-for-agent`, `needs-info`, `ready-for-human`, etc.).
- `Agent state:` records whether an automated agent loop has already worked the issue.

Allowed `Agent state:` values:

- `pending` - eligible for an agent loop once `Status: ready-for-agent` and blockers are satisfied
- `done` - completed by an agent loop
- `blocked` - attempted by an agent loop but stopped because human input or another blocker is needed

Missing `Agent state:` is treated as `pending` for compatibility with existing issue files.

Do not use a durable `in-progress` state for the serial local agent loop. A clean commit is the completion boundary for completed issues; a dirty worktree means the run did not finish cleanly.

Agent run notes may be appended to the issue file under `## Agent Run Notes`.

For a completed issue, the agent updates the issue file by setting `Agent state: done`, checking all completed acceptance criteria, and appending run notes. The wrapper rejects an `issue_done` result if any acceptance criterion remains unchecked.

For automated agent loops, the wrapper script selects the next issue deterministically before invoking the agent. The agent receives one exact issue path and must not choose additional issues on its own.

The local Codex implementation is a single Node executable exposed as `scripts/codex-issue-loop.js` and package scripts `ai:do`, `ai:do-loop`, and `ai:check`.

By default, `npm run ai:do` runs at most one issue. Longer runs require an explicit `--max <count>` or the `ai:do-loop` package script.

The feature directory argument is optional when `.scratch/` contains exactly one feature directory with an `issues/` folder. A bare feature slug such as `component-hydration` resolves to `.scratch/component-hydration`; paths such as `.scratch/component-hydration` are also accepted.

Use `npm run ai:check` or `--dry-run` to print branch/worktree status, issue selection, skipped issue reasons, checks, and the Codex invocation without invoking Codex or modifying files.

Use `--timeout-minutes <count>` to bound a Codex invocation. The default timeout is 60 minutes. Timeout stops the loop without changing issue state because the worktree may contain partial agent edits.

Before invoking Codex, the loop writes `.scratch/<feature-slug>/.codex-issue-loop/active-run.json` with the selected issue, result path, transcript path, starting commit, and start time. The marker is operational state only; it is ignored by git and is removed after the wrapper successfully validates and commits or records the agent result.

If a later run finds a dirty worktree and the active-run marker points to a valid `issue_done` or `blocked` result JSON for the same issue, the wrapper performs Agent Loop Recovery automatically before selecting more issues. Recovery reuses the normal result validation path, commits completed tracked changes with the agent's `commitSubject`, reruns the normal post-commit checks for completed issues, and requires a clean worktree before continuing.

Use `--recover-active-run` to recover the active result and exit without selecting more issues. Use `--resume-active-run` when the active run has partial uncommitted work but no valid result JSON; this re-invokes Codex for the same selected issue with resume instructions and consumes one `--max` iteration.

The loop runs Codex non-interactively with `codex -a never exec -s workspace-write`. If an issue requires network access, external credentials, destructive commands, or human judgment, the agent must mark the issue blocked instead of waiting for interaction.

The loop runs on the current branch for v1. It refuses to start from a dirty worktree unless it can recover a marked active run or the caller explicitly uses `--resume-active-run`; it refuses to run on `main` unless invoked with `--allow-main`.

Before invoking Codex, the loop runs baseline `npm run types`, `npm test`, and `npm run lint` checks by default. Known-red repos may bypass this gate with `--skip-baseline-checks`.

An issue is eligible for selection when:

- `Status: ready-for-agent`
- `Agent state:` is missing or `pending`
- every issue listed under `## Blocked by` has `Agent state: done`

When multiple issues are eligible, choose the lowest numbered issue file first.

Blocker references may use the issue stem, markdown filename, or feature-relative/full issue path. `None - can start immediately` means unblocked. Unresolved or ambiguous blocker references stop the loop before invoking Codex.

Each completed issue must be committed before the loop advances to another issue. The loop starts only from a clean worktree or an explicit active-run continuation, treats a clean commit as the completion boundary, and stops if it cannot create a commit or cannot return to a clean worktree after committing.

The sandboxed Codex child must not run `git add` or `git commit`; it may not be able to write to `.git`. The wrapper script owns git commits after it validates the child result.

Issue-loop commit subjects follow the mini Conventional Commits format in `AGENTS.md`. For completed issues, the agent returns a `commitSubject` in the final JSON and the wrapper uses it as the commit subject. The subject should describe the implementation change, not the issue-loop mechanics.

Before returning a completed issue, the agent must run the full checks with capped failure output:

- `npm run types > /tmp/codex-types.log 2>&1 || (tail -120 /tmp/codex-types.log && false)`
- `npm test > /tmp/codex-test.log 2>&1 || (tail -120 /tmp/codex-test.log && false)`
- `npm run lint > /tmp/codex-lint.log 2>&1 || (tail -120 /tmp/codex-lint.log && false)`

Passing checks should produce minimal output inside the Codex session. Failing checks may expose the relevant tail of the log, but full check logs should not be pasted into issue notes.

Wireit-backed scripts may report that they skipped work because the cache is valid. Treat that as a passing check: Wireit only reuses a result when the command's declared inputs and outputs say the previous result still applies.

After the agent exits, the wrapper script verifies the run before selecting another issue. For completed issues, the wrapper validates the issue state, commits tracked changes, reruns `npm run types`, `npm test`, and `npm run lint`, and then requires a clean worktree. Blocked issues may finish without a git commit when the only durable update is in ignored local issue-tracker files; the wrapper rejects blocked results that leave tracked implementation changes.

The wrapper uses `codex exec --output-schema` and reads a structured JSON result from the agent instead of parsing free-form prose.

Operational logs and the active-run marker for the loop are written under `.scratch/<feature-slug>/.codex-issue-loop/` and ignored by git. Durable progress belongs in issue files and completed-issue commits, not in the log directory.

If an agent cannot complete an issue, it must set `Agent state: blocked`, update `Status:` when the blocker changes the issue's delegability (`needs-info` or `ready-for-human`), append a precise `## Agent Run Notes` entry, and leave the changes uncommitted for the wrapper. Blocked issues are not retried by the loop until a human changes their state.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
