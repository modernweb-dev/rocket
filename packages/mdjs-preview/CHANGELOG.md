# @mdjs/mdjs-preview

## 0.5.9

### Patch Changes

- ab24361: Add server folder to the published npm package

## 0.5.8

### Patch Changes

- 5226ab0: Update lit version & add a server template for `@rocket/cli@0.20+`.

## 0.5.7

### Patch Changes

- f4d83fe: add overridable `renderFunction` to mdjs-preview

## 0.5.6

### Patch Changes

- e81b77f: Change theme attribute into preview-theme attribute to separate theme styling of the preview section and the full mdjs viewer.
- 456b8e7: Add css variable to style border-color of the mdjs-viewer

## 0.5.5

### Patch Changes

- 445b028: Update to latest lit, @open-wc, @lion packages

## 0.5.4

### Patch Changes

- 15a82c0: Enable including script files into the simulator via `<script src=".." mdjs-use>`
- 15a82c0: Allow only a limited set of characters for simulator includes `[a-zA-Z0-9\/\-_]`.
  Notably, there is no:

  - `:` to prevent `http://...` includes
  - `.` so filenames as `this.is.my.js` are not supported. Also includes will be without file endings which will be added automatically

## 0.5.3

### Patch Changes

- 5c6b9c9: The Platform and Size controls are now moved above the preview.
  For the web platform we added a special "inline" size.
  Only when platform=web & size=webInline it will render to dom.
  On all other selections it will render the preview via an iframe.

  ```js
  sizes: [
    {
      key: 'webInline',
      name: 'Inline',
      platform: 'web',
      width: 360,
      height: 640,
      dpr: 1,
    },
    {
      // ...
    },
  ];
  ```

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

## 0.5.2

### Patch Changes

- 0987a41: - Make [slot="content"] selector more specific
- 0987a41: Fix styling in darkmode

## 0.5.1

### Patch Changes

- fbcedde: Get a scoped registry for the internal accordion element to no longer pollute the global registry with a `lion-accordion` element.

## 0.5.0

### Minor Changes

- e1e96ac: **BREAKING CHANGE** Update to [lit](https://lit.dev/) 2

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

- 814b5d2: **BREAKING CHANGE** Render stories to light dom

  ```js
  export const story = html`
    <p>my story</p>
  `;
  ```

  ```html
  <!-- before -->
  <mdjs-preview>
    #shadow-root (open)
      <div id="wrapper">
        <div>
          <p>my story</p>
        </div>
      </div>
      <!-- more internal dom -->

    <code><!-- ... --></code>
  </mdjs-preview>

  <!-- after -->
  <mdjs-preview>
    #shadow-root (open)
      <div id="wrapper">
      <!-- more internal dom -->

    <code><!-- ... --></code>
    <div slot="story">
      <p>my story</p>
    </div>
  </mdjs-preview>
  ```

## 0.4.2

### Patch Changes

- 72f631a: Improve customizations by hiding empty themes, platforms and adding parts to be styled.
- 74dd8d1: Autoheight will not grow bigger than the current size height
- 72f631a: Add a copy code button

## 0.4.1

### Patch Changes

- 0f6709a: Make sure initial settings are taken from the element if nothing is yet stored

## 0.4.0

### Minor Changes

- edb1abf: Reworking completely by

  - slotting in the highlighted code
  - open story in dedicated window
  - enabling an simulation mode that can render the story in an iframe
  - share settings between all simulators
  - option to remember simulator settings
  - force side effect import via `/define`

## 0.3.2

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages

## 0.3.1

### Patch Changes

- ee6b404: Pass on the shadowRoot to the story function

## 0.3.0

### Minor Changes

- 15e0abe: Clean up dependencies - add Types
