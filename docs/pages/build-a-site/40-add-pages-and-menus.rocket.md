```js server
export const config = {
  path: '/tutorials/acme-ui-docs/add-pages-and-menus',
  metadata: {
    title: 'Add pages and menus',
    description: 'Add documentation pages and connect them to Rocket navigation with Page config.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Navigation tip',
          description:
            'Add menu metadata as you create each Page so the page tree stays useful throughout the build.',
        },
      },
    },
  },
  menu: {
    iconName: 'list-nested',
    parent: '/tutorials',
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Add Pages and Menus

Add a short documentation structure before you write deep reference content. Rocket's menu comes
from Page config, so each new Page can join navigation as soon as it exists.

The current Atlas docs layout has two navigation surfaces:

- top header links from `docs/siteData.js`
- documentation navigation, previous links, and next links from the Rocket Page tree

## Update the home Page

Replace the body of `docs/pages/index.rocket.md` with a clearer landing Page:

````markdown
```js server
export const config = {
  path: '/',
  metadata: {
    title: 'Acme UI Docs',
    description: 'Design system guidance for Acme product teams.',
  },
  menu: {
    order: 10,
    iconName: 'house',
  },
};

import { layout } from '../docsLayout.js';
export { components } from '../docsLayout.js';
```

# Acme UI Docs

Design system guidance for Acme product teams.

## What is here

- Getting started guidance for Site Authors
- Brand assets used in Acme UI documentation
- Component reference pages for reusable interface patterns
````

## Add a getting started Page

Create `docs/pages/getting-started.rocket.md`:

````markdown
```js server
export const config = {
  path: '/getting-started',
  metadata: {
    title: 'Getting started',
    description: 'Start authoring Acme UI documentation Pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Authoring tip',
          description:
            'Use static Markdown Pages first; add browser code only when the reader needs live behavior.',
        },
      },
    },
  },
  menu: {
    order: 20,
    iconName: 'book',
  },
};

import { layout } from '../docsLayout.js';
export { components } from '../docsLayout.js';
```

# Getting Started

Use Acme UI when you are documenting product workflows, setup steps, and interface components.

## Authoring rules

- Put one topic on each Page.
- Keep examples close to the component they explain.
- Prefer static content until a page needs client-side behavior.
````

## Add a component section

Create `docs/pages/components/index.rocket.md`:

````markdown
```js server
export const config = {
  path: '/components',
  metadata: {
    title: 'Components',
    description: 'Reference pages for Acme UI components.',
  },
  menu: {
    order: 40,
    iconName: 'puzzle',
    noLink: true,
  },
};

import { layout } from '../../docsLayout.js';
export { components } from '../../docsLayout.js';
```

# Components

Component reference pages describe where a component fits, the variants it supports, and the
accessibility rules authors should preserve.
````

`menu.noLink` makes the section appear as a menu group while child Pages carry the useful links. See
[Menus](/advanced/menus) for every menu option.

`metadata.custom.atlasDoc.asideTip` is optional. When present, the current Atlas docs layout renders
it in the aside column on wide screens below the table of contents.

## Checkpoint

Run the static build:

```bash
npm run build
```

The project now has multiple Pages, menu order, and a non-clickable component section. Each Page
still imports only the user-owned `docs/docsLayout.js` wrapper.
