```js server
export const config = {
  path: '/tutorials/acme-ui-docs',
  metadata: {
    title: 'Build the Acme UI Docs Site',
    description: 'Plan the Acme UI Docs path from an empty project to a static documentation site.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Track tip',
          description:
            'Use this page as the map, then build the project step by step instead of copying final files all at once.',
        },
      },
    },
  },
  menu: {
    linkText: 'Build ACME UI Docs',
    iconName: 'map',
    parent: '/tutorials',
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Acme UI Docs Site

This tutorial track takes a **Site Author** from an empty project to a working static documentation
site for a fictional design system called Acme UI.

You will build:

- a Rocket project with a static build script
- Site Head Metadata for titles, descriptions, canonical URLs, and language
- user-owned Atlas layout data for the header, socials, and navigation icon budget
- a public theme stylesheet for Atlas CSS variable overrides
- a small local wrapper around Rocket's current Atlas docs layout
- sequential Pages with menu order, menu icons, and a non-linking section group
- source brand assets resolved by Pages and layout data
- a public favicon referenced from Site Head Metadata
- the first colocated Acme UI component reference Page

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  The layout package imports are Rocket-owned. The <code>docs/siteData.js</code>,
  <code>docs/docsLayout.js</code>, <code>docs/pages/</code>, <code>docs/assets/</code>, and
  <code>src/components/</code> files in this tutorial are user-owned project files. The
  <code>public/</code> directory is also user-owned and is for stable root-relative files such as
  favicons.
</wa-callout>

## Current Atlas boundary

The Atlas docs layout currently renders:

- the header logo, header links, and social links from `siteData.headerData`
- project theme stylesheets from `siteData.stylesheets`
- the left documentation menu from Rocket's Page tree
- automatic menu icons with a configurable server-render budget
- the current Page content
- desktop and mobile table-of-contents regions
- optional page-level aside tips from `metadata.custom.atlasDoc.asideTip`
- previous and next links from the Page tree

The layout does not own your public site identity. Put launch-facing facts such as site name,
default description, canonical origin, language, and favicon references in `rocket-config.js` under
Site Head Metadata.

## Track pages

1. [Create the project shell](/tutorials/acme-ui-docs/create-project)
2. [Own the site data](/tutorials/acme-ui-docs/own-site-data)
3. [Add pages and menus](/tutorials/acme-ui-docs/add-pages-and-menus)
4. [Add brand assets](/tutorials/acme-ui-docs/add-brand-assets)
5. [Document the first component](/tutorials/acme-ui-docs/document-first-component)
6. [Build the static site](/tutorials/acme-ui-docs/build-static-site)

After the static site is working, continue with [Component Loading](/component-loading) and
[Request-time JavaScript Pages](/request-time-javascript-pages). Reference links are included
at the point where they help, but the guided path stays complete on its own.
