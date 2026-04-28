```js server
export const config = {
  path: '/tutorials',
  metadata: {
    title: 'Build a Site',
    description: 'Build a complete Rocket documentation site through a guided Acme UI tutorial.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Tutorial tip',
          description:
            'Follow the Acme UI track in order once; each step leaves the project runnable before adding the next concern.',
        },
      },
    },
  },
  menu: {
    linkText: 'Build a Site',
    iconName: 'hammer',
    noLink: true,
    order: 20,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Build a Site

This section is the main Site Author tutorial path. It starts from the minimal project created by
`rocket init` and turns it into a working documentation site that uses Rocket's current Atlas docs
layout.

Atlas is a reusable layout, not a copied project template. Rocket owns the layout function,
layout-owned components, Web Awesome wiring, menu rendering, table of contents, and previous/next
links. Your project owns the Pages, Site Head Metadata, layout data, assets, navigation choices, and
component documentation.

## Guided track

### [Acme UI Docs static site](/tutorials/acme-ui-docs)

Build a static documentation-style website for a design system. This track is written for **Site
Authors** who own the content, navigation, branding, and component documentation for their project.

You will create a user-owned docs site from a new Rocket project while reusing Rocket's existing
docs layout affordances.

The track covers the current Atlas docs shape:

- a local `docs/docsLayout.js` wrapper around `atlasDocLayout`
- project-owned `DocData` in `docs/siteData.js`
- Site Head Metadata in `rocket-config.js`
- top header links, social links, and menu icon rendering
- page-specific Atlas aside tips through `metadata.custom.atlasDoc`
- source assets resolved with `resolve()` and stable public assets under `public/`
- a colocated component reference Page under `src/components/`

Each page ends with a checkpoint so you can stop, run the project, and continue with a coherent
site.
