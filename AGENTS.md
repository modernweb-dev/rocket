## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default mattpocock/skills triage label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain documentation layout. See `docs/agents/domain.md`.

### Source and test files

Prefer colocated tests. For `src/foo.js`, put the test in `src/foo.test.js`. For nested modules, keep the test next to the source file it covers.

Name source files after their primary export. Use `camelCase` for functions and plain modules, and `UpperCamelCase` for classes and custom elements:

- `src/mySuperFunction.js`
- `src/mySuperFunction.test.js`
- `src/MyElement.js`
- `src/MyElement.test.js`

For new Node tests, prefer `describe` and `it` from `node:test`:

```js
import { describe, it } from 'node:test';

describe('Test addressList', () => {
  it('01: finds default address', async () => {
    // ...
  });
});
```

Use numbered `it` cases (`01:`, `02:`, etc.) when a module has multiple behavior examples. Keep test names behavior-focused.

### Commit messages

Use a small Conventional Commits style:

`<type>(<module>): <short message>`

Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`.

`<module>` is a short lowercase area such as `api`, `ui`, `docs`, `deploy`, or `tdd`. Keep the message short, use imperative or present-tense wording, and do not end it with a period.

Examples:

```txt
feat(auth): add login redirect
fix(deploy): handle missing env file
docs(setup): clarify build command
test(loop): cover retry failure path
refactor(cli): simplify command parsing
chore(deps): update lockfile
ci(release): add publish workflow
```
