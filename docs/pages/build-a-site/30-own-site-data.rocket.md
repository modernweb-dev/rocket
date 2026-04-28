```js server
export const config = {
  path: '/tutorials/acme-ui-docs/own-site-data',
  metadata: {
    title: 'Own the site data',
    description: 'Move project facts into site-owned data instead of importing Rocket docs data.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Data tip',
          description:
            'Copy the DocData shape, not Rocket docs data itself; your site should own header links, logos, and social profiles.',
        },
      },
    },
  },
  menu: {
    iconName: 'database',
    parent: '/tutorials',
    order: 30,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Own the Site Data

The Acme UI Docs project should own the data it passes into Atlas. Do not import Rocket's docs-site
`globalData.js`; that file describes this documentation site, not yours.

It is fine to import Rocket package APIs such as `atlasDocLayout`, `atlasDocComponents`, and
`resolve`. Those are reusable code affordances. The values you pass into the layout should be
project-owned `DocData`.

Keep public site identity in `rocket-config.js`:

- `siteOrigin`
- `siteHeadMetadata.siteName`
- `siteHeadMetadata.defaultDescription`
- `siteHeadMetadata.language`
- favicon and theme-color references when you add them

Keep Atlas layout data in `docs/siteData.js`:

- header logo assets
- header home link
- top header links
- social links
- navigation icon server-render budget

## Add a wordmark

Create `docs/assets/acme-wordmark.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" role="img" aria-label="Acme UI Docs">
  <text x="0" y="31" fill="#111827" font-family="Arial, sans-serif" font-size="24" font-weight="700">
    Acme UI
  </text>
  <text x="100" y="31" fill="#4b5563" font-family="Arial, sans-serif" font-size="18">Docs</text>
</svg>
```

## Replace the site data

Update `docs/siteData.js`:

```js label="docs/siteData.js"
import { resolve } from '@rocket/js/resolve.js';

/** @type {import('@rocket/js/types.js').DocData} */
export const siteData = {
  headerData: {
    logo: [
      resolve('./assets/acme-mark.svg', import.meta),
      resolve('./assets/acme-wordmark.svg', import.meta),
    ],
    homeLink: '/',
    navLinks: [
      { text: 'Getting started', href: '/getting-started' },
      { text: 'Components', href: '/components' },
    ],
    socials: [
      {
        url: 'https://github.com/acme/acme-ui',
        name: 'GitHub',
        label: 'Open Source',
      },
    ],
  },
  footerData: [],
  navigationIconServerBudget: 35,
};
```

The `headerData` shape is consumed by Rocket's Atlas docs layout. `navLinks` render in the top
header. Social entries can omit `label` for an icon-only link.

`navigationIconServerBudget` controls how many automatic `rocket-icon` hosts in the documentation
menu are server-rendered before the remaining automatic icons load in the browser. Keep the default
`35` unless your menu is unusually small or large.

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  Keep launch-facing metadata in <code>rocket-config.js</code>. Keep Atlas layout data in
  <code>docs/siteData.js</code>. Keep page-specific facts in the Page that uses them.
</wa-callout>

## Checkpoint

Run the site again:

```bash
npm run start
```

The home Page still works, and the header now uses Acme-owned data and assets. Continue to
[Layouts](/reference/layouts) later if you want to replace the Atlas layout with a custom document
shell.
