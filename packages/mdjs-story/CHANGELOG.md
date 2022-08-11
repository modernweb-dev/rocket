# @mdjs/mdjs-story

## 0.3.2

### Patch Changes

- 5226ab0: Update lit version & add a server template for `@rocket/cli@0.20+`.

## 0.3.1

### Patch Changes

- 445b028: Update to latest lit, @open-wc, @lion packages

## 0.3.0

### Minor Changes

- 814b5d2: **BREAKING CHANGE** Render stories to light dom

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

- e1e96ac: **BREAKING CHANGE** Update to [lit](https://lit.dev/) 2

  If your main lit-html version is 1.x be sure to import html for your story rendering from `@mdjs/mdjs-story`.

  ````md
  ```js script
  import { html } from '@mdjs/mdjs-story';
  ```

  ```js story
  export const foo = () =>
    html`
      <demo-element></demo-element>
    `;
  ```
  ````

## 0.2.0

### Minor Changes

- 604a80e: Force `/define`Ï entrypoint via export map

## 0.1.2

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages

## 0.1.1

### Patch Changes

- ee6b404: Pass on the shadowRoot to the story function

## 0.1.0

### Minor Changes

- 15e0abe: Clean up dependencies - add Types
