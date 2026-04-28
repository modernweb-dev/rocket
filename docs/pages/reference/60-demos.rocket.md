```js server
export const config = {
  path: '/reference/demos',
  metadata: {
    title: 'Demos',
    description:
      'Create JavaScript Demos and Request Demos from Markdown code blocks inside Rocket Pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Demo tip',
          description:
            'Use JavaScript Demos for browser-rendered examples and Request Demos for same-site GET responses; plain Code Blocks are better for setup code.',
        },
      },
    },
  },
  menu: {
    iconName: 'play-btn',
    order: 60,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Demos

Demos turn Markdown code fences into live reference material. Use them when readers need to see a
rendered result next to the source that produced it.

Rocket has two live demo frames:

- `js demo` creates a **JavaScript Demo** for browser-rendered component examples, interaction
  states, and small behavior samples.
- `js request-demo` creates a **Request Demo** for same-site `GET` responses, including
  request-time JavaScript Pages, JSON routes, generated SVG, and HTML endpoints.

Use a plain [Code Block](/reference/code-blocks) when the reader only needs source text.

## Choose the frame

Start with the output readers need to inspect, then choose the smallest frame that shows it.

<div class="demo-frame-grid" aria-label="Demo frame choices">
  <article class="demo-frame-card demo-frame-card-code">
    <div class="demo-frame-card-title">
      <rocket-icon library="bootstrap" name="code-square" aria-hidden="true"></rocket-icon>
      <strong class="demo-frame-card-heading">Code Block</strong>
    </div>
    <p>Use for setup code, commands, snippets, and any source-only example.</p>
    <dl>
      <div>
        <dt>Fence</dt>
        <dd><code>js</code>, <code>bash</code>, <code>ts</code></dd>
      </div>
      <div>
        <dt>Runs</dt>
        <dd>No</dd>
      </div>
    </dl>
  </article>
  <article class="demo-frame-card demo-frame-card-browser">
    <div class="demo-frame-card-title">
      <rocket-icon library="bootstrap" name="window" aria-hidden="true"></rocket-icon>
      <strong class="demo-frame-card-heading">JavaScript Demo</strong>
    </div>
    <p>Use for browser-rendered components, DOM examples, and interaction states.</p>
    <dl>
      <div>
        <dt>Fence</dt>
        <dd><code>js demo</code></dd>
      </div>
      <div>
        <dt>Runs</dt>
        <dd>Yes, in the browser</dd>
      </div>
    </dl>
  </article>
  <article class="demo-frame-card demo-frame-card-request">
    <div class="demo-frame-card-title">
      <rocket-icon library="bootstrap" name="arrow-left-right" aria-hidden="true"></rocket-icon>
      <strong class="demo-frame-card-heading">Request Demo</strong>
    </div>
    <p>Use for same-site request output rendered by an iframe.</p>
    <dl>
      <div>
        <dt>Fence</dt>
        <dd><code>js request-demo</code></dd>
      </div>
      <div>
        <dt>Runs</dt>
        <dd>No; the iframe requests the target URL</dd>
      </div>
    </dl>
  </article>
</div>

## JavaScript Demos

A JavaScript Demo renders browser output from a named function export. It is the right frame for
small live examples where the preview and the source code should stay together.

### Basic authoring

````markdown
```js demo
import { html } from 'lit';

export const simpleButton = () => html`<button type="button">Click me</button>`;
```
````

Rocket renders the demo inside `<rocket-js-demo>` and displays the source code:

```js demo
import { html } from 'lit';

export const simpleButton = () => html`<button type="button">Click me</button>`;
```

Every export in a `js demo` block becomes one demo. The export name also becomes part of the
generated Standalone Demo URL.

<div class="demo-rule-grid" aria-label="JavaScript Demo authoring rules">
  <article>
    <strong>Exports</strong>
    <p>Use named function exports only. Keep export names unique within the Markdown Page.</p>
  </article>
  <article>
    <strong>Execution</strong>
    <p>The demo function runs in the browser as part of the Page's generated browser module.</p>
  </article>
  <article>
    <strong>Shape</strong>
    <p>Return DOM, Lit templates, or browser-side behavior that belongs in the live frame.</p>
  </article>
</div>

### Source labels

Add `label="..."` when the displayed demo source should show a Code Block Label:

````markdown
```js demo label="components/simple-button.js"
export const simpleButton = () => html`<button type="button">Click me</button>`;
```
````

The label belongs to the displayed source code. JavaScript Demo frames do not show a separate demo
title by default.

### Shared setup

All demos on a Markdown Page are bundled into that Page's browser module. Put shared imports or
setup code in `js client` when several demos need the same values:

````markdown
```js client
import { html } from 'lit';
```

```js demo
export const primaryButton = () => html`<button type="button">Primary</button>`;
```

```js demo
export const secondaryButton = () => html`<button type="button">Secondary</button>`;
```
````

The demo function receives an options object. `wrapperRef` points at the JavaScript Demo element:

````markdown
```js demo
export const measuredDemo = ({ wrapperRef }) => {
  wrapperRef.dataset.ready = 'true';
  return html`<p>Ready</p>`;
};
```
````

### Component Pages

Use demos on component Pages when readers need to compare live states with source code:

````markdown
```js client
import { html } from 'lit';
```

```js demo
export const primaryAction = () => html` <acme-button href="/setup">Read setup</acme-button> `;
```
````

For components rendered inside demos, use a Loading Strategy that defines the element in the
browser, such as `client` or `hydrate:*`. Server-only components are best shown directly in Markdown
when their rendered HTML is the complete experience.

## Standalone Demo URLs

Every named JavaScript Demo export also gets a generated **Standalone Demo URL**:

```text
<page path>/_demo/<demo export name>/
```

For this Page, Rocket generates:

```text
/reference/demos/_demo/simpleButton/
```

Standalone Demo URLs are public, stable child paths. They require the trailing slash. Query-string
forms such as `?standaloneDemo=simpleButton` are not the public URL contract.

<div class="demo-detail-grid" aria-label="Standalone Demo URL behavior">
  <article>
    <strong>Static Pages</strong>
    <p>Static Markdown Pages write physical Standalone Demo documents during <code>rocket build</code>.</p>
  </article>
  <article>
    <strong>Server Pages</strong>
    <p>Server-rendered Markdown Pages use the same URL shape through the deployment adapter and Page Runtime.</p>
  </article>
  <article>
    <strong>Rendered output</strong>
    <p>The Standalone Demo document renders only the live demo, without source, controls, navigation, or docs chrome.</p>
  </article>
  <article>
    <strong>Collision policy</strong>
    <p>If a configured Page collides with a generated demo path, the build fails instead of choosing precedence.</p>
  </article>
</div>

Avoid configuring Pages under a Page's reserved `_demo` segment unless you are intentionally checking
for a collision.

## Request Demos

Use a Request Demo when the thing to inspect is a same-site request and response. The frame displays
`GET` plus the authored request path, renders the response in a lazy iframe, keeps the source
collapsed behind `Source`, and keeps controls for opening and copying the request path in the
Source row.

````markdown
```js request-demo url="/request-time-javascript-pages/demo/build-info.json?source=reference" label="docs/pages/guides/requestTimeBuildInfo.rocket.js" height=240
export const config = {
  path: '/request-time-javascript-pages/demo/build-info.json',
  render: 'server',
};

export default function content() {
  return {
    renderedAt: new Date().toISOString(),
    runtime: 'server',
  };
}
```
````

```js request-demo url="/request-time-javascript-pages/demo/build-info.json?source=reference" label="docs/pages/guides/requestTimeBuildInfo.rocket.js" height=240
export const config = {
  path: '/request-time-javascript-pages/demo/build-info.json',
  render: 'server',
};

export default function content() {
  return {
    renderedAt: new Date().toISOString(),
    runtime: 'server',
  };
}
```

### Request metadata

<div class="demo-metadata-grid" aria-label="Request Demo metadata">
  <article>
    <strong><code>url</code></strong>
    <p>Required. Must be a site-root path beginning with <code>/</code>. Query strings are supported.</p>
  </article>
  <article>
    <strong><code>height</code></strong>
    <p>Optional. Accepts a positive integer pixel value and sets the initial iframe response height. The default is <code>240px</code>.</p>
  </article>
  <article>
    <strong><code>label</code></strong>
    <p>Optional. Labels the displayed source code. The request path remains separate in the frame header.</p>
  </article>
</div>

Hashes, relative paths, protocol-relative URLs, and external URLs are rejected. Rocket does not
validate that the target exists in the Page registry, so Request Demos can point at adapter routes,
intentional 404 examples, or future routes.

Request Demo source is visible Markdown content only. Rocket does not execute it, extract it as
`js server` or `js client` setup, bundle it as browser demo code, parse it as a JavaScript Demo, or
validate it as a Page module.

## Tips

- Use demos for rendered examples, not long tutorials.
- Keep data small and local; demos run in the browser.
- Use Request Demos for request-time responses instead of hand-written iframe figures.
- Prefer Registered Components for reusable component files.
- Remember that custom element tags used in the parent Markdown content still need Page ownership
  through `components` or `js client`.
