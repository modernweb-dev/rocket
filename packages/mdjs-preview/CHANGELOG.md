# @mdjs/mdjs-preview

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
