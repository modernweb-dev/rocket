# Changelog

## 0.2.0

### Minor Changes

- cf8eecd: Add a full blog system on top of Page Collections:
  - **Page Feeds**: archive Pages can export `feed` to publish a Page Collection as an Atom feed at `<page path>/feed.xml`, served in development and emitted during static builds.
  - **Static Params**: parameterized static JavaScript Pages can export `staticParams` to enumerate concrete output documents (for example one tag archive per tag) that build statically and join the Sitemap.
  - **Atlas blog layouts**: `atlasPostLayout` renders posts with a byline (date, authors, tag links) and `atlasBlogIndexLayout` renders the paginated post list with feed link, both exported from `@rocket/js/layouts/atlasBlog.js`.

- 1d98f7c: Add Atlas Layout Head Content to documentation, hero, blog post, blog index, and not-found layouts. Shared layout data can now define a synchronous `headContent` callback that receives the current `PageData` and returns trusted Lit markup appended at the end of `<head>`.

  Rename the document helper's direct head fragment option from `headerContent` to `headContent`. The obsolete name is removed without a compatibility alias.

- 60e2434: Reliability, correctness, and cleanup pass across the framework.

  CLI:
  - `rocket --help` now shows the `rocket` name, version, and command descriptions.
  - Expected errors print a clean message instead of a stack trace (set `ROCKET_DEBUG=1` for the full error).
  - Missing `rocket-config.js` now suggests `npx rocket init` instead of failing with `ERR_MODULE_NOT_FOUND`.
  - `rocket build --output-dir` refuses to write (and clear) directories outside the project root on every build path.
  - `rocket start` now observes the dev-server child process: crashes no longer leave a hung parent, restarts wait for the old process to exit before respawning, and SIGINT/SIGTERM shut down cleanly and restore the terminal.

  Core pipeline:
  - `node_modules` is excluded from Page discovery again (the guard was unreachable with the default empty `excludeRegex`).
  - `PageData` copies Page Metadata per render, so setting `pageData.title` no longer mutates the shared Page Registry across requests.
  - Titles derived from paths with a trailing slash (e.g. `/docs/`) no longer fall back to `Home`.
  - The generated `import { html } from 'lit'` detection now parses the module instead of using a regex that false-positived on imports like `htmlEscape`.
  - A ```js demo code block without exports now reports a clear authoring error instead of crashing.
  - `demo label="..."` code blocks are now consistently detected for Standalone Demo URLs.
  - Dynamic paths (e.g. `/blog/:slug/`) no longer clobber their parent menu entry.
  - Invalid Registered Component `loading` values now fail with an error naming the component.
  - `includeGlobs` is validated and the user config object is no longer mutated; config import works on Windows via file URLs.
  - `treeFromPages` page trees are computed lazily and route `URLPattern`s are cached per route path.

  Components and hydration:
  - `hydrate:onHover` now actually hydrates (it was parsed but never wired).
  - Click/focus/hover hydration triggers now match light-DOM descendants of the host element.
  - The hydration loader no longer leaks a `MediaQueryList` listener per element, and cleanup runs whenever any element hydrated.
  - `rocket-drawer` closed state is removed from the tab order and accessibility tree, closes on Escape, and manages focus.
  - `rocket-social-link` validates the icon name, caches SVG file reads, and lists supported names in its error.
  - The Social Preview Playground prefers the selected Page's title/description, debounces typing, and skips redundant iframe reloads and `history.replaceState` calls.
  - The markdown import hook sends module-dependency messages explicitly fire-and-forget (awaiting a reply can deadlock Node's module-hooks thread), and `makeAsyncPort`'s `sendAndWait` now returns the reply promise instead of a resolvers object.

  Layouts and generated output:
  - The default layout uses `<nav aria-label="Site">` and `<main>` landmarks; `defaultHtmlMenu` renders valid nested lists and no-link sections as text. `treeToHtml` item functions now receive the rendered child list as a fifth argument and must place it inside the returned item.
  - The Atlas hero layout no longer injects a hardcoded `/examples` nav link when `navLinks` is not configured.
  - The Atlas 404 layout reuses the shared header logo renderer (correct alt text) and guards against a missing logo.
  - Social Preview Image builds reuse one Chromium instance across captures, and Linux falls back to a locally installed browser when the bundled Chromium is unavailable.
  - Redirect sources/targets containing whitespace are rejected at config time (they would corrupt Netlify `_redirects`).
  - The dev server caches Public Asset discovery instead of re-walking `public/` on every request.

## 0.1.2

### Patch Changes

- 990eaf2: Add project-owned stylesheet hooks to Atlas layout data and wire `rocket init` to scaffold a central theme stylesheet. The initializer also supports an explicit `--yes` path for converting CommonJS package metadata to ESM, and the docs now cover constrained dev-server fallbacks and curl Page smoke tests.

## 0.1.1

### Patch Changes

- 2a8a631: Harden rocket init for Atlas docs starters and existing Rocket sites, add demo/icon helpers, start flags, and standalone demo build validation.

Rocket uses Changesets for release notes. Public package changes should include a changeset so the
release PR can update this file with the final version and package notes.

## 0.1.0

- Starts Rocket's current public alpha as `@rocket/js`.
- Marks the package as alpha before `1.0.0`.
- Introduces the AI-assisted setup path, explicit Page config docs, static output docs, and Web
  Component documentation examples.
