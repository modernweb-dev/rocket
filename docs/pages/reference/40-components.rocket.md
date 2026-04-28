```js server
export const config = {
  path: '/reference/components',
  metadata: {
    title: 'Components',
    description:
      'Register custom elements for server rendering, browser loading, hydration, and demos.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Component tip',
          description:
            'Register reusable custom elements in the components export; use page-local definitions only for one-off examples.',
        },
      },
    },
  },
  menu: {
    linkText: 'Components',
    iconName: 'puzzle',
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Components

Rocket works with custom elements in two different ways:

- **Registered Components** are owned by a Page's explicit `components` export and use a Loading
  Strategy.
- **Page-local Custom Elements** are defined directly in a Markdown Page's `js client` code and are
  not managed by Rocket's component loader.

Use Registered Components for reusable files, server rendering, client loading, and hydration. Use
Page-local Custom Elements for small one-off browser behavior that belongs to one Markdown Page.

## Registered Components

A Registered Component entry maps a tag name to:

- `file`: the module that exports the component class.
- `className`: the named export to use, or `default` for a default export.
- `loading`: the Loading Strategy.

For project components referenced from a Page, create an absolute file URL with `new URL`:

````markdown
```js server
export const config = {
  path: '/components/button',
  metadata: { title: 'Button' },
};

import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

const acmeButtonFile = new URL('../components/AcmeButton.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-button': {
    file: acmeButtonFile,
    className: 'AcmeButton',
    loading: 'server',
  },
};

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

# Button

<acme-button href="/setup">Read setup</acme-button>
````

Do not rely on a relative string such as `./components/AcmeButton.js` from Page code. Component
loading is performed by Rocket-owned modules and adapters, so `new URL(..., import.meta.url).href`
keeps the file location unambiguous.

## Component modules

The module should export the class named by `className`:

```js label="src/components/AcmeButton.js"
import { LitElement, html } from 'lit';

export class AcmeButton extends LitElement {
  static properties = {
    href: { type: String },
  };

  render() {
    return html`<a href=${this.href}><slot></slot></a>`;
  }
}
```

Do not call `customElements.define` in a module used as a Registered Component. The Page owns the
tag name, and Rocket defines it according to the Loading Strategy.

## Loading Strategies

| Loading Strategy | First render                                                 | Browser code                                | Use when                                                              |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------- |
| `server`         | Rocket renders the component while rendering the Page        | No component module is shipped for that tag | The HTML is the complete experience                                   |
| `client`         | The browser imports the module before the tag becomes useful | Loaded immediately                          | The component needs browser-only state before it can render useful UI |
| `hydrate:*`      | Rocket renders HTML first                                    | Loaded when the Hydration Strategy resolves | Initial HTML is useful and interaction can wait                       |

### `server`

```js label="server Loading Strategy"
'acme-callout': {
  file: acmeCalloutFile,
  className: 'AcmeCallout',
  loading: 'server',
}
```

Use `server` for badges, callouts, static cards, menus, formatted text, and other components whose
rendered HTML is enough.

The module must be safe to import in Rocket's server environment. Guard browser globals such as
`window`, `document`, and `localStorage`.

### `client`

```js label="client Loading Strategy"
'acme-editor': {
  file: acmeEditorFile,
  className: 'AcmeEditor',
  loading: 'client',
}
```

Use `client` for browser-only widgets such as editors, maps, command palettes, authenticated
controls, and components that cannot render meaningful initial HTML.

### `hydrate:*`

```js label="hydrate:* Loading Strategy"
'acme-tabs': {
  file: acmeTabsFile,
  className: 'AcmeTabs',
  loading: 'hydrate:onVisible',
}
```

Use `hydrate:*` when Rocket should render useful HTML first and make it interactive later.

Supported Hydration Strategies include:

- `hydrate:onClientLoad`
- `hydrate:onVisible`
- `hydrate:onClick`
- `hydrate:onFocus`
- `hydrate:onMedia('(max-width: 768px)')`

Hydration conditions can be combined:

```js label="Hydration strategy combinations"
loading: 'hydrate:onVisible||onClick';
loading: "hydrate:onVisible&&onMedia('(min-width: 1024px)')";
```

Component Hydration requires stable server HTML. The component should tolerate being rendered on the
server and later upgraded in the browser with matching initial state.

## Rocket-owned components

Rocket ships `rocket-icon` as a built-in Registered Component for trusted SVG icons. See
[Rocket Icon](/reference/rocket-icon) for authoring, loading behavior, Icon Libraries, and generated
asset output.

## Page-local Custom Elements

For a small one-off element in a Markdown Page, define the tag in `js client`:

````markdown
```js client
class InlineCounter extends HTMLElement {
  connectedCallback() {
    let count = 0;
    this.innerHTML = `<button type="button">Count: 0</button>`;
    this.querySelector('button').addEventListener('click', event => {
      count += 1;
      event.currentTarget.textContent = `Count: ${count}`;
    });
  }
}

customElements.define('inline-counter', InlineCounter);
```

<inline-counter></inline-counter>
````

Rocket validates Page-local ownership from literal `customElements.define('tag-name', ClassName)`
calls in that Page's `js client` code. If the tag name is computed, Rocket cannot prove ownership.

## Markdown validation

Markdown Pages are strict about authored custom element tags. Any tag name containing a hyphen must
be owned by the Page:

- A matching key in the Page's `components` export, or
- A matching literal `customElements.define` call in the Page's `js client` code.

A tag cannot use both ownership models at the same time. Tags that appear only inside `js demo`
blocks do not satisfy ownership for the parent Markdown Page.

## JavaScript Pages

JavaScript Pages use the same explicit `components` export when they render Registered Components:

```js label="src/pages/components/tabs.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

const acmeTabsFile = new URL('../components/AcmeTabs.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-tabs': {
    file: acmeTabsFile,
    className: 'AcmeTabs',
    loading: 'hydrate:onVisible',
  },
};

export default async (_request, { pageData }) => {
  pageData.content = html`
    <h1>Tabs</h1>
    <acme-tabs></acme-tabs>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const config = {
  path: '/components/tabs',
};
```

This example can stay static because the path is concrete and the response can be rendered once
during the build. Add `render: 'server'` when the JavaScript Page needs request-time data,
adapter context, or route parameters.

## Debugging

- Missing export: confirm the module exports the exact `className`.
- Unregistered custom element error: add a `components` entry or a literal Page-local
  `customElements.define` call.
- Browser-only code fails during render: guard it or use `client`.
- Hydration does not happen: check the `hydrate:*` condition, browser console, and network requests
  for the component module.

For a decision guide, see [Component Loading](/component-loading).

For Markdown-specific ownership rules and code fence behavior, see
[Markdown Authoring](/reference/markdown-authoring).
