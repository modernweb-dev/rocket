```js server
export const config = {
  path: '/examples/callout',
  metadata: {
    title: 'Web Awesome Components',
    description: 'Render Web Awesome custom elements from a package component map in Rocket.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Component map tip',
          description:
            'If a layout already exports a package component map, Markdown can use those custom elements without per-page registration.',
        },
      },
    },
  },
  menu: {
    linkText: 'Web Awesome',
    iconName: 'stars',
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Web Awesome Components

Rocket can render custom elements from package component maps. The atlas docs layout already
registers the Web Awesome elements used on this Page, so the Markdown can use those tags directly.

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  <strong>Registered by the layout:</strong> this callout is a server-rendered Web Awesome
  component from <code>atlasDocComponents</code>.
</wa-callout>

## Status badges

Badges are useful for compact metadata in documentation:

<p>
  <wa-badge variant="brand">Stable</wa-badge>
  <wa-badge variant="success">Documented</wa-badge>
  <wa-badge variant="neutral">Reference</wa-badge>
  <wa-badge variant="warning">Preview</wa-badge>
  <wa-badge variant="danger">Deprecated</wa-badge>
</p>

## Expandable details

Use details for supporting information that should not interrupt the main reading path:

<wa-details summary="Component registration">
  The atlas docs layout exports a <code>components</code> map. Markdown Pages that use the layout
  should re-export that map, or compose it with additional Page-owned Registered Components.
</wa-details>

## Card content

Cards work well for repeated summaries or compact examples:

<wa-card class="card-overview">
  <strong>Release checklist</strong>
  <p>
    Confirm the page builds, check the generated route, and verify any hydrated components in the
    browser.
  </p>
  <small class="wa-caption-m">Example content rendered inside a Web Awesome card.</small>
</wa-card>

## Avatar

Use avatars for people, teams, or generated initials:

<wa-avatar initials="RW" label="Rocket Writer"></wa-avatar>

## Using Web Awesome in another layout

If a Page uses a custom layout instead of `atlasDocLayout`, import and spread the package component
map yourself:

````markdown
```js server
import { webAwesomeComponents } from '@rocket/js/components/web-awesome.js';

export const components = {
  ...webAwesomeComponents,
};
```
````

Add Page-owned components to the same map when the Page contains both package components and local
Registered Components.

## Next step

Continue with [Components](/reference/components) for the full Registered Component reference, or
[Component Loading](/component-loading) for loading strategy decisions.
