# check-html-links

## 0.2.2

### Patch Changes

- 66c2d78: fix: windows path issue

## 0.2.1

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages

## 0.2.0

### Minor Changes

- 750418b: Uses a class for the CLI and adding the following options:

  - `--root-dir` the root directory to serve files from. Defaults to the current working directory
  - `--ignore-link-pattern` do not check links matching the pattern
  - `--continue-on-error` if present it will not exit with an error code - useful while writing or for temporary passing a ci

  BREAKING CHANGE:

  - Exists with an error code if a broken link is found

## 0.1.2

### Patch Changes

- f343c50: When reading bigger files, especially bigger files with all content on one line it could mean a read chunk is in the middle of a character. This can lead to strange symbols in the resulting string. The `hightWaterMark` is now increased from the node default of 16KB to 256KB. Additionally, the `hightWaterMark` is now synced for reading and parsing.

## 0.1.1

### Patch Changes

- eb74110: Add info about how many files and links will be checked

## 0.1.0

### Minor Changes

- cd22231: Initial release
