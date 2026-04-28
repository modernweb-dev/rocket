```js server
export const config = {
  path: '/component-loading',
  metadata: {
    title: 'Component Loading Strategies',
    description: 'Choose how Rocket renders, loads, and hydrates custom elements.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Loading tip',
          description:
            'Start with server loading. Move to client or hydrate only when the component needs browser state or interaction.',
        },
      },
    },
  },
  menu: {
    linkText: 'Component Loading',
    iconName: 'cpu',
    parent: '/guides',
    order: 10,
  },
};

import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

const loadingStrategyDemoFile = new URL('./components/LoadingStrategyDemos.js', import.meta.url)
  .href;

export const components = {
  ...atlasDocComponents,
  'rocket-server-loading-demo': {
    file: loadingStrategyDemoFile,
    className: 'ServerLoadingStrategyDemo',
    loading: 'server',
  },
  'rocket-client-loading-demo': {
    file: loadingStrategyDemoFile,
    className: 'ClientLoadingStrategyDemo',
    loading: 'client',
  },
  'rocket-hydrated-loading-demo': {
    file: loadingStrategyDemoFile,
    className: 'HydratedLoadingStrategyDemo',
    loading: 'hydrate:onClick',
  },
};

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Component Loading Strategies

A **Registered Component** maps one custom element tag to a module file, an exported class name, and
a **Loading Strategy**. The `loading` value is the choice that controls whether Rocket renders that
component on the server, loads it only in the browser, or renders it first and hydrates it later.

**Component Hydration** is the middle path. Rocket renders useful HTML first, emits browser
activation code, and hydrates matching elements when their **Hydration Strategy** resolves. A
Hydration Strategy exists only after `hydrate:`; for `hydrate:onClick`, the Hydration Strategy is
`onClick`.

## Live demos

The three cards below are Registered Components on this Markdown Page. They use the same component
module, but each tag has a different Loading Strategy in this Page's explicit `components` export.

<section
  aria-label="Live loading strategy comparison"
  style="display: grid; gap: 1rem; margin: 1.5rem 0;"
>
  <rocket-server-loading-demo></rocket-server-loading-demo>
  <rocket-client-loading-demo>
    Client placeholder before the browser module loads.
  </rocket-client-loading-demo>
  <rocket-hydrated-loading-demo></rocket-hydrated-loading-demo>
</section>

Use the cards as a quick check:

- `server` renders useful HTML during the build or server render and ships no component module for
  that tag.
- `client` waits for browser JavaScript before the component renders its real UI.
- `hydrate:*` renders useful HTML first, then lets Component Hydration activate it later.

## At a glance

| Loading value | First HTML                    | Browser module                              | Use when                                        |
| ------------- | ----------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `server`      | Rendered by Rocket            | Not shipped for that tag                    | The HTML is the complete experience             |
| `client`      | Placeholder or unresolved tag | Loaded immediately                          | Browser state is needed before useful UI exists |
| `hydrate:*`   | Rendered by Rocket            | Loaded when the Hydration Strategy resolves | Initial HTML matters and interaction can wait   |

## Choose `server`

Choose `server` when the HTML is the complete experience.

```js label="server Loading Strategy"
'acme-badge': {
  file: acmeBadgeFile,
  className: 'AcmeBadge',
  loading: 'server',
}
```

This is the right default for badges, formatted text, static charts, documentation callouts, menu
items, and any component whose output does not need browser state or event handlers. A Site Author
gets fast initial HTML and avoids shipping JavaScript for that component.

The component module still needs to be safe to import while Rocket renders the Page. Avoid browser
globals such as `window`, `document`, and `localStorage` unless they are guarded behind browser-only
code paths.

Do not choose `server` for a component that must respond to clicks, read browser APIs, manage focus,
or update after the Page loads.

## Choose `client`

Choose `client` when the component has no useful server-rendered state.

```js label="client Loading Strategy"
'acme-command-palette': {
  file: acmeCommandPaletteFile,
  className: 'AcmeCommandPalette',
  loading: 'client',
}
```

This fits browser-only widgets such as command palettes, authenticated controls, editors, maps, and
components that need local storage, viewport APIs, or client-side data before they can render useful
content. The tradeoff is that the Page has less useful HTML until the browser imports the component
module and defines the custom element.

Use client-only loading intentionally. If the component can render meaningful initial HTML, prefer
`server` or `hydrate:*`.

## Choose `hydrate:*`

Choose `hydrate:*` when the Page should show useful HTML immediately and become interactive later.

```js label="hydrate:* Loading Strategy"
'acme-filter-panel': {
  file: acmeFilterPanelFile,
  className: 'AcmeFilterPanel',
  loading: 'hydrate:onVisible',
}
```

The part after `hydrate:` is the Hydration Strategy. It controls when the server-rendered Registered
Component becomes interactive in the browser:

- `hydrate:onClientLoad` for interaction that must be ready as soon as possible.
- `hydrate:onVisible` for below-the-fold or expensive components.
- `hydrate:onClick` for panels, menus, and controls that can activate on first intent.
- `hydrate:onFocus` for fields and form controls.
- `hydrate:onMedia('(max-width: 768px)')` for responsive behavior that only applies at specific
  viewport sizes.

Component Hydration has more moving parts than `server` or `client`: the component must produce
stable server HTML, tolerate being upgraded in the browser, and keep its initial state consistent
across both environments. Use it when that complexity buys a better Site Author outcome: fast
content plus deferred interactivity.

## Component modules

The module named by `file` should export the class named by `className`. Let Rocket define the custom
element tag from the Page's `components` export:

```js label="components/AcmeRating.js"
import { LitElement, html } from 'lit';

export class AcmeRating extends LitElement {
  render() {
    return html`<p>Rating: <slot></slot></p>`;
  }
}
```

Do not call `customElements.define` in the component module for Registered Components. The Page owns
the tag name, and Rocket may need to use the same class for server rendering, client loading, or
hydration.

## Markdown Pages

Markdown Pages use a `js server` block to export the Page config, layout, and Registered Components.
The Page owns the custom element tags through the explicit `components` export:

````markdown
```js server
export const config = {
  path: '/components/rating',
  metadata: { title: 'Rating' },
};

import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

const acmeRatingFile = new URL('../components/AcmeRating.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-rating': {
    file: acmeRatingFile,
    className: 'AcmeRating',
    loading: 'hydrate:onVisible',
  },
};

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

# Rating

<acme-rating value="4"></acme-rating>
````

Use this model for Markdown documentation Pages where authored custom elements appear in the
Markdown content.

## JavaScript Pages

JavaScript Pages use the same explicit `components` export when they render Registered Components.
The Page body can be JavaScript, but component ownership does not move into the layout or a global
registry:

```js label="src/pages/rating-live.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export const config = {
  path: '/components/rating-live',
  metadata: { title: 'Live rating' },
};

const acmeRatingFile = new URL('../components/AcmeRating.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-rating': {
    file: acmeRatingFile,
    className: 'AcmeRating',
    loading: 'hydrate:onVisible',
  },
};

export default async (_request, { pageData }) => {
  pageData.content = html`
    <h1>Live rating</h1>
    <acme-rating value="4"></acme-rating>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
```

Use this model for concrete JavaScript Pages that assemble their content in JavaScript and still
contain Registered Components. Add `render: 'server'` when the Page needs request data, adapter
context, or route parameters.

## Decision guide

Start with the least browser work that still gives the visitor the right experience:

1. Pick `server` when the rendered HTML is enough.
2. Pick `client` when server HTML would be empty, misleading, or impossible.
3. Pick `hydrate:*` when the server HTML is valuable but the component also needs browser
   interaction.

If a Markdown Page defines a one-off custom element entirely in its own `js client` block, that is a
**Page-local Custom Element**, not a Registered Component. Page-local Custom Elements do not use a
Loading Strategy and are not managed by Component Hydration.

## Next step

Continue with [Request-time JavaScript Pages](/request-time-javascript-pages) when part of the
site should respond to request params, emit JSON, or return generated non-HTML assets.
