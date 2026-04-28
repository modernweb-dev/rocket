```js server
export const config = {
  path: '/reference/markdown-authoring',
  metadata: {
    title: 'Markdown Authoring',
    description:
      'Write Rocket Markdown Pages with server code, client code, demos, and expressions.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Authoring tip',
          description:
            'Use Markdown Pages for durable content first; add server code, browser code, and demos only where the page needs them.',
        },
      },
    },
  },
  menu: {
    iconName: 'markdown',
    order: 25,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Markdown Authoring

Markdown Pages are `.rocket.md` files with Page setup code plus Markdown content. Use them for
durable content, documentation, tutorials, landing pages, and component reference Pages that can
render ahead of time.

## Page skeleton

Start a Markdown Page with a `js server` fence that exports Page setup:

````markdown
```js server
export const config = {
  path: '/components/button',
  metadata: { title: 'Button' },
};

export { layout } from '@rocket/js/layout.js';
```

# Button

The Button Page is written in Markdown.
````

The `config.path` value controls the public route path. The file can live anywhere matched by
`includeGlobs`.

## Server code

`js server` code runs while Rocket loads and renders the Page. Use it for imports, Page config,
layouts, Registered Components, and values that Markdown should interpolate:

````markdown
```js server
import { resolve } from '@rocket/js/resolve.js';

export const config = {
  path: '/brand',
  metadata: { title: 'Brand' },
};

const logo = resolve('../assets/logo.svg', import.meta);
```

<img src="${logo}" alt="Brand logo" />
````

Prefer one setup block near the top of the Page. Multiple `js server` blocks are possible, but a
single block keeps the Page setup easy to scan.

## Browser code

`js client` code is emitted as browser module code for that Page:

````markdown
```js client
class InlineCounter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button type="button">Count: 0</button>';
  }
}

customElements.define('inline-counter', InlineCounter);
```

<inline-counter></inline-counter>
````

Use `js client` for Page-local Custom Elements, small browser behavior, and shared imports for
`js demo` blocks. Code in `js client` is not displayed as content.

## JavaScript Demos

`js demo` code blocks create JavaScript Demos and Standalone Demo URLs:

````markdown
```js client
import { html } from 'lit';
```

```js demo
export const primaryButton = () => html` <button type="button">Primary</button> `;
```
````

Each demo should export a named function. Demo names should be unique within the Markdown Page.

Rocket renders demos inside `<rocket-js-demo>` on the parent Page and also generates a Standalone
Demo URL:

```text
<page path>/_demo/<demo export name>/
```

Use [Demos](/reference/demos) for the full behavior, including source controls, shared setup, and
collision rules.

## Markdown and HTML

Markdown Pages support standard Markdown, GitHub-flavored Markdown, and raw HTML:

```md
## Usage

Use **strong copy** for important guidance.

<aside>
  This raw HTML stays part of the rendered Page.
</aside>
```

Markdown text can interpolate values from `js server` scope. Expressions inside fenced code examples
are displayed as code instead of being evaluated.

## Headings

Each Markdown Page should have one `h1`. Rocket uses it as a fallback title and builds the table of
contents from the remaining headings.

Rocket gives each rendered heading an `id` and appends a permalink anchor so readers can share a
specific section URL.

Heading levels should move one level at a time:

```md
# Page

## Section

### Detail
```

Use `link-text` to change menu or table-of-contents text:

```html
<h2 link-text="API">Application Programming Interface</h2>
```

Use `menu-exclude` to leave a heading out of the table of contents:

```html
<h2 menu-exclude>Internal implementation note</h2>
```

## Custom element ownership

When Markdown content contains an authored custom element tag with a hyphen, the Page must own that
tag in one of two ways.

Register reusable files through the Page's `components` export:

```js label="components export"
const cardFile = new URL('../components/AcmeCard.js', import.meta.url).href;

export const components = {
  'acme-card': {
    file: cardFile,
    className: 'AcmeCard',
    loading: 'server',
  },
};
```

Or define a Page-local Custom Element in the same Page's `js client` code:

```js label="Page-local Custom Element"
class InlineCounter extends HTMLElement {}
customElements.define('inline-counter', InlineCounter);
```

The same tag cannot be both a Registered Component and a Page-local Custom Element. Tags used only
inside `js demo` blocks do not satisfy ownership for tags in the parent Markdown content.

## Static and server-rendered Markdown

Markdown Pages build to static HTML by default:

```js label="Static Markdown Page config"
export const config = {
  path: '/docs/button',
};
```

Use `render: 'server'` only when the Markdown Page itself must render at request time:

```js label="Server-rendered Markdown config"
export const config = {
  path: '/docs/request-shaped',
  render: 'server',
};
```

Server-rendered Markdown Pages need a deployment adapter in production.

## Related docs

- [Pages](/reference/pages) documents Page config and route paths.
- [Components](/reference/components) documents Registered Components and Page-local Custom Elements.
- [Demos](/reference/demos) documents JavaScript Demos and Standalone Demo URLs.
