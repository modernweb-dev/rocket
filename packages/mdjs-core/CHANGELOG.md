# Change Log

## 0.9.5

### Patch Changes

- 5226ab0: Update `es-module-lexer` version.
- Updated dependencies [5226ab0]
  - @mdjs/mdjs-preview@0.5.8
  - @mdjs/mdjs-story@0.3.2

## 0.9.4

### Patch Changes

- e6c3d27: Support `js client` as an alias to `js script`

## 0.9.3

### Patch Changes

- 62637a8: Replaces `rehype-prism-template` with `rehype-prism` to get a newer version of prism with essential security updates

## 0.9.2

### Patch Changes

- 97cb38c: Add missing slash dependency

## 0.9.1

### Patch Changes

- 6221e5f: If your preview is followed by a code blocks marked as `story-code` then those will be shown when switching between multiple platforms

  ````md
  ```js preview-story
  // will be visible when platform web is selected
  export const JsPreviewStory = () =>
    html`
      <demo-wc-card>JS Preview Story</demo-wc-card>
    `;
  ```

  ```xml story-code
  <!-- will be visible when platform android is selected -->
  <Button
      android:id="@+id/demoWcCard"
      android:layout_width="wrap_content"
      android:layout_height="wrap_content"
      android:text="Android Code"
      style="@style/Widget.FooComponents.Demo.Wc.Card"
  />
  ```

  ```swift story-code
  // will be visible when platform ios is selected
  import DemoWc.Card

  let card = DemoWcButton()
  ```
  ````

- Updated dependencies [5c6b9c9]
- Updated dependencies [6221e5f]
  - @mdjs/mdjs-preview@0.5.3

## 0.9.0

### Minor Changes

- 70bb7a1: BREAKING CHANGE: Update to latest plugins manager to get type safe options

  There is no longer a name string as a key for a plugin. It is identified by it's function/class. You will need to adjust your code if you are adding or adjusting plugins.

  ```diff
  - addPlugin({ name: 'my-plugin', plugin: myPlugin, options: { myFlag: true }, location: 'top' });
  + addPlugin(myPlugin, { myFlag: true }, { location: 'top' });
  - adjustPluginOptions('my-plugin', { myFlag: true });
  + adjustPluginOptions(myPlugin, { myFlag: true });
  ```

  For more details please see the [Changelog](https://github.com/modernweb-dev/rocket/blob/main/packages/plugins-manager/CHANGELOG.md#030) of the plugins-manager package.

### Patch Changes

- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
  - plugins-manager@0.3.0

## 0.8.2

### Patch Changes

- a5661b8: Updates dependencies

## 0.8.1

### Patch Changes

- d91e46b: update dependencies
- 9978ea7: Improves typings for `addPlugin`
- Updated dependencies [9978ea7]
  - plugins-manager@0.2.3

## 0.8.0

### Minor Changes

- 814b5d2: **BREAKING CHANGE** Stories of `story` and `preview-story` are now rendered to light dom instead of shadow dom to allow usage of a scoped registry for the internal dom

  ```js
  export const story = html`
    <p>my story</p>
  `;
  ```

  ```html
  <!-- before -->
  <mdjs-story>
    #shadow-root (open)
    <p>my story</p>
  </mdjs-story>

  <!-- after -->
  <mdjs-story>
    <p>my story</p>
  </mdjs-story>
  ```

- e1e96ac: **BREAKING CHANGE** The default renderer for `story` and `preview-story` updated to [lit](https://lit.dev/) 2

  If your main lit-html version is 1.x be sure to import html for your story rendering from `@mdjs/mdjs-preview`.

  ````md
  ```js script
  import { html } from '@mdjs/mdjs-preview';
  ```

  ```js preview-story
  export const foo = () =>
    html`
      <demo-element></demo-element>
    `;
  ```
  ````

### Patch Changes

- Updated dependencies [e1e96ac]
- Updated dependencies [814b5d2]
- Updated dependencies [814b5d2]
- Updated dependencies [e1e96ac]
  - @mdjs/mdjs-preview@0.5.0
  - @mdjs/mdjs-story@0.3.0

## 0.7.2

### Patch Changes

- ce9b12e: Support importing via es module

  ```js
  import { mdjsProcess } = from '@mdjs/core';
  ```

## 0.7.1

### Patch Changes

- 2b7f1ee: Add support for pathprefix

## 0.7.0

### Minor Changes

- a8e66d8: Extract building of the JavaScript setup code into a unified plugin called mdjsSetupCode
- fe6a929: For the story preview keep the original code block around to get code highlighting from the main document. This enables styling and reduces the code complexity.

### Patch Changes

- a8e66d8: You can provide a highlightCode function to the mdjsSetupCode unified plugin
- Updated dependencies [edb1abf]
- Updated dependencies [604a80e]
  - @mdjs/mdjs-preview@0.4.0
  - @mdjs/mdjs-story@0.2.0

## 0.6.2

### Patch Changes

- 897892d: bump dependencies
- b68923b: Add gfm to support markdown tables

## 0.6.1

### Patch Changes

- Updated dependencies [a8c7173]
  - plugins-manager@0.2.0

## 0.6.0

### Minor Changes

- b9a6274: Use new dependency [plugins-manager](https://www.npmjs.com/package/plugins-manager) to add, remove or adjust plugins.

  Removals:

  - Removed own add plugin helper again
  - Removed deprecated export of `mdjsProcessPlugins` please us `setupPlugins` option instead

### Patch Changes

- Updated dependencies [b9a6274]
  - plugins-manager@0.1.0

## 0.5.1

### Patch Changes

- 6cf6ef2: Adds a helper for adding remark plugins

## 0.5.0

### Minor Changes

- 15e0abe: Remove of resolveToUnpkg.js and mdjsTransformer.js - add Types

### Patch Changes

- Updated dependencies [15e0abe]
  - @mdjs/mdjs-preview@0.3.0
  - @mdjs/mdjs-story@0.1.0

## 0.4.1

### Patch Changes

- 17e9e7dc: Change type distribution workflow

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.3.3...@mdjs/core@0.4.0) (2020-09-12)

### Features

- **core:** replace exporting plugins array with setup functions ([44de89e](https://github.com/open-wc/open-wc/commit/44de89e01092835248425f6c53255337061a935a))

## [0.3.3](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.3.2...@mdjs/core@0.3.3) (2020-06-13)

### Bug Fixes

- **core:** auto load mdjs-preview/story if not defined by user ([6849afd](https://github.com/open-wc/open-wc/commit/6849afd5e20f8cdb7d54db2a1c22f384657055fd))
- **core:** use js of md files even if there are no stories ([6d12de5](https://github.com/open-wc/open-wc/commit/6d12de5dbeeceedfd54709c37eba890c5f160e64))

## [0.3.2](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.3.1...@mdjs/core@0.3.2) (2020-05-23)

### Bug Fixes

- **core:** export type for plugins ([c8ea754](https://github.com/open-wc/open-wc/commit/c8ea754153e2da4e73fa1f6a927c7b24108bf658))

## [0.3.1](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.3.0...@mdjs/core@0.3.1) (2020-05-16)

### Bug Fixes

- **core:** use types everywhere, export interfaces ([3f4ba8b](https://github.com/open-wc/open-wc/commit/3f4ba8b2293d2fa29d8ac8b210abf2dc3727a008))

# [0.3.0](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.2.0...@mdjs/core@0.3.0) (2020-05-09)

### Bug Fixes

- **core:** having a js or html code block alone does not mean mdjs ([427ea5e](https://github.com/open-wc/open-wc/commit/427ea5eb2947ff461f2a3c69cd74bad9f3a2d24a))
- **core:** limit Story.type to js|html and make it optional ([f0191d1](https://github.com/open-wc/open-wc/commit/f0191d1ad0974e667e730e4df8ff2f7930fa082f))

### Features

- **core:** mimic github syntax highlighting, upoptimized code view ([a9879f8](https://github.com/open-wc/open-wc/commit/a9879f84b46726fe20de3240d11b534e9776bc70))
- **core:** support html preview/-stories ([c820f17](https://github.com/open-wc/open-wc/commit/c820f1718115a4f376c6541edec44c41d1ed7d8d))

# [0.2.0](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.9...@mdjs/core@0.2.0) (2020-05-07)

### Bug Fixes

- **core:** update @mdjs/mdjs-preview with no css side effect for buttons ([c21abf6](https://github.com/open-wc/open-wc/commit/c21abf640b34e98c216c374e70741e7e7a6a6a72))

### Features

- **core:** allow to fully customize used plugins ([bd3c443](https://github.com/open-wc/open-wc/commit/bd3c44321a9e866aadf42d59ca8d5c788401c786))
- **core:** no jsCode if no stories, no auto import of wc ([9eab522](https://github.com/open-wc/open-wc/commit/9eab52224edf618ef3bb956db18ed4ade98a3ac6))

## [0.1.9](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.8...@mdjs/core@0.1.9) (2020-04-12)

**Note:** Version bump only for package @mdjs/core

## [0.1.8](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.7...@mdjs/core@0.1.8) (2020-04-05)

**Note:** Version bump only for package @mdjs/core

## [0.1.7](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.6...@mdjs/core@0.1.7) (2020-03-26)

**Note:** Version bump only for package @mdjs/core

## [0.1.6](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.5...@mdjs/core@0.1.6) (2020-03-24)

**Note:** Version bump only for package @mdjs/core

## [0.1.5](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.4...@mdjs/core@0.1.5) (2020-03-19)

**Note:** Version bump only for package @mdjs/core

## [0.1.4](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.3...@mdjs/core@0.1.4) (2020-03-15)

**Note:** Version bump only for package @mdjs/core

## [0.1.3](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.2...@mdjs/core@0.1.3) (2020-03-15)

**Note:** Version bump only for package @mdjs/core

## [0.1.2](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.1...@mdjs/core@0.1.2) (2020-03-11)

**Note:** Version bump only for package @mdjs/core

## [0.1.1](https://github.com/open-wc/open-wc/compare/@mdjs/core@0.1.0...@mdjs/core@0.1.1) (2020-03-10)

**Note:** Version bump only for package @mdjs/core

# 0.1.0 (2020-03-08)

### Features

- add Markdown with JavaScript (mdjs) ([5547ebc](https://github.com/open-wc/open-wc/commit/5547ebc00c02c5c34725030865dc3fd5a02aae80))
