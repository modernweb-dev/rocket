# @rocket/engine

## 0.2.6

### Patch Changes

- 8dedc56: Add `engine.getVersion()` method
- 390335d: Improve title tag handling

## 0.2.5

### Patch Changes

- 93503ed: HTML in headings will be ignored for the menu
  Some examples:

  - `<h1>Hello <em>Word</em></h1>` => `Hello Word`
  - `<h1>Hello <strong>World</strong> of <span>JS <em>(JavaScript)</em></span>!</h1>` => `Hello World of JS (JavaScript)!`

- 3032ba9: Menus now support special characters in markdown headings.

  Examples:

  ```md
  # Fun Errors & Feedback

  # &lt;some-button>
  ```

## 0.2.4

### Patch Changes

- 09a47b4: Prevent fatal error because of simultaneous write to file.

  When the browser requested a file to be rendered and that file also needed an update in the "rocket header" (the top of the file) then it could be that the watcher trigger a simultaneous render of the file while the first render was still in progress.

  The solution is that the watcher ignores changes to a file until a full render is finished.

## 0.2.3

### Patch Changes

- 379f08f: Remove the lit workaround to globally load the `global-dom-shim` in the "main thread".
  Which means only the worker that does the actual SSR rendering will load it.

## 0.2.2

### Patch Changes

- 6f88d8e: Get rid of the `rehype-prism` workaround by using latest esm version of mdjs that uses `rehype-prism-plus`
- Updated dependencies [35ed64d]
- Updated dependencies [6f88d8e]
  - @mdjs/core@0.20.0

## 0.2.1

### Patch Changes

- 367529c: Make sure user provided content in the folder `site/public/*` wins over public folders content provided by plugins.

## 0.2.0

### Minor Changes

- 5226ab0: Initial public beta version.

### Patch Changes

- Updated dependencies [5226ab0]
  - @mdjs/core@0.9.5
