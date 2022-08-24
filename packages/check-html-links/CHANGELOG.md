# check-html-links

## 0.2.4

### Patch Changes

- 97d5fb2: Add external links validation via the flag `--validate-externals`.

  You can/should provide an optional `--absolute-base-url` to handle urls starting with it as internal.

  ```bash
  # check external urls
  npx check-html-links _site --validate-externals

  # check external urls but treat links like https://rocket.modern-web.dev/about/ as internal
  npx check-html-links _site --validate-externals --absolute-base-url https://rocket.modern-web.dev
  ```

## 0.2.3

### Patch Changes

- 5043429: Ignore `<a href="tel:9999">` links
- f08f926: Add missing `slash` dependency
- a0e8edf: Ignore links containing not http schema urls like `sketch://`, `vscode://`, ...

  ```html
  <a href="sketch://add-library?url=https%3A%2F%2Fmyexample.com%2Fdesign%2Fui-kit.xml"></a>
  <a href="vscode://file/c:/myProject/package.json:5:10"></a>
  ```

- 1949b1e: Ignore plain and html encoded mailto links

  ```html
  <!-- source -->
  <a href="mailto:address@example.com">contact</a>

  <!-- html encoded -->
  <a
    href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;"
    >contact</a
  >
  ```

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
