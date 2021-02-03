---
'check-html-links': minor
---

Uses a class for the CLI and adding the following options:
- `--root-dir` the root directory to serve files from. Defaults to the current working directory 
- `--ignore-link-pattern` do not check links matching the pattern
- `--continue-on-error` if present it will not exit with an error code - useful while writing or for temporary passing a ci

BREAKING CHANGE:
- Exists with an error code if a broken link is found
