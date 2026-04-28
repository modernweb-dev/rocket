# Codex issue loop is local and repo-specific

The automated issue loop for this repo is a local `scripts/codex-issue-loop.js` Node executable instead of a dependency on a general agent orchestration library such as Sandcastle. The loop deliberately optimizes for the repo's local markdown issue tracker, Codex CLI, serial execution, schema-validated results, and per-issue commit boundaries; broader sandbox providers, branch strategies, and parallel orchestration can be added later if the local workflow proves insufficient.

The loop keeps interrupted-run continuation state in an ignored `.scratch/<feature>/.codex-issue-loop/active-run.json` marker instead of a durable issue `in-progress` state. A valid completed result can be recovered automatically at the wrapper boundary, while partial dirty work requires an explicit resume command so the wrapper does not guess whether unrelated local edits belong to the selected issue.
