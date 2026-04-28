```js server
export const config = {
  path: '/examples/component-showcase',
  metadata: {
    title: 'Component Showcase With Demos',
    description: 'Document a component with live demos, rendered previews, and source snippets.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Demo tip',
          description:
            'Keep each demo small and named after one behavior so rendered previews double as readable component documentation.',
        },
      },
    },
  },
  menu: {
    linkText: 'Component Showcase',
    iconName: 'puzzle',
    order: 20,
  },
  iconReferences: [
    { library: 'bootstrap', name: 'plus-square' },
    { library: 'bootstrap', name: 'dash-square' },
  ],
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Component Showcase With Demos

Use `js demo` blocks when component documentation should show rendered behavior and source code
together. This Page documents Web Awesome's `<wa-details>` component as a realistic component
showcase.

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  <strong>Component:</strong> <code>&lt;wa-details&gt;</code> is a stable Web Awesome component
  for progressively disclosing content.
</wa-callout>

```js client
import { html } from 'lit';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
```

## Basic Details

Use details for supporting information that should be available without interrupting the main
reading path.

```js demo
export const basicDetails = () => html`
  <wa-details summary="Component registration" appearance="outlined" icon-placement="end">
    Register reusable elements from a Page's <code>components</code> export. Rocket can then load
    them with <code>server</code>, <code>client</code>, or <code>hydrate:*</code> behavior.
  </wa-details>
`;
```

## Expanded Initially

Use the `open` attribute when the content should be visible on first render.

```js demo
export const expandedInitially = () => html`
  <wa-details summary="Build output" open appearance="outlined" icon-placement="end">
    Static Pages render into <code>dist/</code>. Server-rendered Pages use the configured adapter
    for request-time output.
  </wa-details>
`;
```

## Disabled

Use `disabled` when the disclosure exists in the interface but should not be interactive yet.

```js demo
export const disabledDetails = () => html`
  <wa-details summary="Deployment checklist" disabled appearance="outlined" icon-placement="end">
    This content is unavailable until a deployment adapter is configured.
  </wa-details>
`;
```

## Icon Placement

Use `icon-placement` to place the expand/collapse affordance at the start or end of the summary.

```js demo
export const iconPlacement = () => html`
  <div style="display: grid; gap: 0.75rem;">
    <wa-details summary="Start icon" icon-placement="start" appearance="outlined">
      Start placement feels familiar for tree views, outlines, and nested navigation.
    </wa-details>

    <wa-details summary="End icon" icon-placement="end" appearance="outlined">
      End placement keeps the summary text aligned and works well for most documentation content.
    </wa-details>
  </div>
`;
```

## Custom Icons

Use the `expand-icon` and `collapse-icon` slots when the default icon does not match the surrounding
interface.

```js demo
export const customIcons = () => html`
  <wa-details
    summary="Custom icons"
    class="custom-icons"
    appearance="outlined"
    icon-placement="end"
  >
    <rocket-icon name="plus-square" slot="expand-icon" library="bootstrap"></rocket-icon>
    <rocket-icon name="dash-square" slot="collapse-icon" library="bootstrap"></rocket-icon>

    The summary uses plus and minus icons instead of the default disclosure icon.
  </wa-details>

  <style>
    wa-details.custom-icons::part(icon) {
      rotate: none;
    }
  </style>
`;
```

## Grouped Details

Use the same `name` value to create accordion behavior where opening one details element closes the
others in the group.

```js demo
export const groupedDetails = () => html`
  <div style="display: grid; gap: 0.75rem;">
    <wa-details name="details-showcase" summary="Overview" open appearance="outlined">
      Details display a summary and reveal additional content on demand.
    </wa-details>

    <wa-details name="details-showcase" summary="Slots" appearance="outlined">
      Use the default slot for content, the <code>summary</code> slot for custom summary markup, and
      the icon slots for custom disclosure icons.
    </wa-details>

    <wa-details name="details-showcase" summary="Events" appearance="outlined">
      The component emits show and hide lifecycle events when it opens and closes.
    </wa-details>
  </div>
`;
```

## Authoring Pattern

The Page imports browser-ready component modules in `js client`, then each demo exports one named
function:

````markdown
```js client
import { html } from 'lit';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
```

```js demo
export const basicDetails = () => html`
  <wa-details summary="Component registration" appearance="outlined">
    Register reusable elements from a Page's components export.
  </wa-details>
`;
```
````

The `js client` import defines the component in the browser before the demos render. The Page still
uses the regular Rocket `components` export for layout-owned components and server-rendered Markdown
content.

## Standalone Demos

Every named demo export also gets a Standalone Demo URL:

```text
/examples/component-showcase/_demo/basicDetails/
/examples/component-showcase/_demo/expandedInitially/
/examples/component-showcase/_demo/disabledDetails/
/examples/component-showcase/_demo/iconPlacement/
/examples/component-showcase/_demo/customIcons/
/examples/component-showcase/_demo/groupedDetails/
```

Use those URLs for focused review, visual checks, and links from issue discussions.

## Related docs

- [Demos](/reference/demos) documents exact `js demo` behavior.
- [Web Awesome Components](/examples/callout) shows package components in Markdown content.
- [Components](/reference/components) covers Registered Components and Loading Strategies.
