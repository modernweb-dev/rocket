```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--tools/20--markdown-javascript/10--overview.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/web').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Overview

```js script
import '@mdjs/mdjs-story/define';
import '@mdjs/mdjs-preview/define';
import { html } from '@mdjs/mdjs-story';
```

Markdown JavaScript (mdjs) is a format that allows you to use JavaScript with Markdown, to create interactive demos. It does so by "annotating" JavaScript that should be executed in Markdown.

To annotate we use a code block with `js script`.

````md
```js script
// execute me
```
````

## Web Components

One very good use case for that can be web components.
HTML already works in Markdown so all you need is to load a web components definition file.

You could even do so within the same Markdown file.

````md
## This is my-card

Here's an example of the component:

```html preview-story
<my-card>
  <h2>Hello world!</h2>
  <button>Click me!</button>
</my-card>
```
````

You can even execute some JavaScript:

````md
## This is my-el

<my-el></my-el>

```js script
import { LitElement, html } from 'https://unpkg.com/lit-element?module';

class MyEl extends LitElement {
  render() {
    this.innerHTML = '<p style="color: red">I am alive</p>';
  }
}

customElements.define('my-el', MyEl);
```
````

## Demo Support (Story)

mdjs comes with some additional helpers you can choose to import:

````md
```js script
import '@mdjs/mdjs-story/define';
import '@mdjs/mdjs-preview/define';
```
````

Once loaded you can use them like so:

### Story

The code snippet will actually get executed at that place and you will have a live demo

````md
```js story
export const JsStory = () => html` <demo-wc-card>JS Story</demo-wc-card> `;
```
````

````md
```html story
<demo-wc-card>HTML Story</demo-wc-card>
```
````

#### Full Code Support

````md
```js story
export const JsStory = () => {
  const calculateSomething = 12;
  return html`
    <demo-wc-card .header="\\${`Something: \\${calculateSomething}`}">JS Story</demo-wc-card>
  `;
};
```
````

### Preview Story

Will become a live demo wrapped in a container with a show code button.

````md
```js preview-story
export const JsPreviewStory = () => html` <demo-wc-card>JS Preview Story</demo-wc-card> `;
```
````

````md
```html preview-story
<demo-wc-card>HTML Preview Story</demo-wc-card>
```
````

Here is a live example from [demo-wc-card](https://www.npmjs.com/package/demo-wc-card).

```js preview-story
import 'demo-wc-card/demo-wc-card.js';
export const header = () => {
  return html` <demo-wc-card .header=${'my new header'}></demo-wc-card> `;
};
```

```js story-code
// not defined for android
```

```js story-code
// not defined for ios
```

#### Story Code

If your preview is followed by a code blocks marked as `story-code` then those will be shown when switching between multiple platforms

````md
```js preview-story
// will be visible when platform web is selected
export const JsPreviewStory = () => html` <demo-wc-card>JS Preview Story</demo-wc-card> `;
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

See it in action by opening up the code block and switching platforms

```js preview-story
// will be visible when platform web is selected
export const JsPreviewStory = () => html` <demo-wc-card>JS Preview Story</demo-wc-card> `;
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

## Supported Systems

### Storybook

Please check out [@open-wc/demoing-storybook](https://open-wc.org/demoing/) for a fully integrated setup.

It includes [storybook-addon-markdown-docs](https://open-wc.org/demoing/storybook-addon-markdown-docs.html) which uses mdjs under the hood.

### Chrome Extension (currently only for GitHub)

See live demos directly inside GitHub pages, Markdown files, issues, pull requests...

Please check out [mdjs-viewer](https://github.com/open-wc/mdjs-viewer).

## Build mdjs

### Basic

mdjs offers two more "basic" integrations

#### `mdjsDocPage`

Creates a full blown HTML page by passing in the Markdown.

```js
const { mdjsDocPage } = require('@mdjs/core');

const page = await mdjsDocPage(markdownString);
/*
<html>
  ... // load styles/components for mdjs, start stories
  <body>
    <h1>Some Markdown</h1>
  </body>
</html>
*/
```

#### `mdjsProcess`

Pass in multiple Markdown documents and you get back all the JavaScript code and rendered HTML.

```js
const { mdjsProcess } = require('@mdjs/core');

const data = await mdjsProcess(markdownString);
console.log(data);
/*
{
  jsCode: "
    import '@mdjs/mdjs-story/mdjs-story.js';
    ...
  ",
  html: '<h1>Markdown One</h1>',
}
*/
```

### Advanced

mdjs is build to be integrated within the [unifiedjs](https://unifiedjs.com/) system.

```js
const unified = require('unified');
const markdown = require('remark-parse');
const htmlStringify = require('remark-html');
const mdjsParse = require('@mdjs/core');

const parser = unified().use(markdown).use(mdjsParse).use(htmlStringify);
const result = await parser.process(body);
const { jsCode } = result.data;
console.log(result.contents);
// <h1>This is my-el></h1>
// <my-el></my-el>
console.log(jsCode);
// customElements.define('my-el', class extends HTMLElement {
// ...
```
