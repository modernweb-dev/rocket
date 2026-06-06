```js server
export const config = {
  path: '/advanced/atlas-layouts',
  metadata: {
    title: 'Atlas Layouts',
    description:
      'Use Rocket atlas layouts for documentation sites while keeping project data and assets owned.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Layout tip',
          description:
            'Keep site data and assets in your project, then pass them into Atlas layouts through a small local wrapper.',
        },
      },
    },
  },
  menu: {
    iconName: 'columns-gap',
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Atlas Layouts

Rocket ships atlas layouts as reusable docs-site affordances. They are useful when a Site Author
wants a documentation-style site quickly but still wants to own project data, Pages, assets, and
component documentation.

## Atlas docs layout

Use `atlasDocLayout` for ordinary documentation Pages:

```js label="docs layout export"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

The layout renders:

- header logo, primary header links, and social links
- main navigation from `pageData.pageTree`
- page content from `pageData.content`
- mobile and aside table of contents from `pageData.toc`
- optional page aside tips from `metadata.custom.atlasDoc.asideTip`
- previous and next links from the Page tree
- generated browser code through Rocket's document helper

## Required components export

The atlas docs layout uses Registered Components for menus, table of contents, previous/next links,
social links, code blocks, demos, and Web Awesome elements. Pages using the layout should export the
matching component map:

```js label="atlas components export"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
```

When a Page also owns project components, spread the atlas components first:

```js label="Page components export"
import { atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';

const acmeButtonFile = new URL('../components/AcmeButton.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-button': {
    file: acmeButtonFile,
    className: 'AcmeButton',
    loading: 'server',
  },
};
```

## Docs layout data

Pass project-owned data into the layout:

```js label="src/siteData.js"
import { resolve } from '@rocket/js/resolve.js';

export const siteData = {
  headerData: {
    logo: [
      resolve('./assets/acme-mark.svg', import.meta),
      resolve('./assets/acme-wordmark.svg', import.meta),
    ],
    homeLink: '/',
    navLinks: [
      { text: 'Docs', href: '/components/button' },
      { text: 'Examples', href: '/examples' },
      { text: 'GitHub', href: 'https://github.com/acme/acme-ui', external: true },
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
  stylesheets: ['/rocket-theme.css'],
  navigationIconServerBudget: 35,
};
```

`headerData.logo` can contain one or two image URLs. With one image, atlas renders a single logo.
With two images, atlas renders a mark and a wordmark.

`headerData.homeLink` is the logo link. `headerData.navLinks` renders the primary header links.
Set `external: true` when a link should open in a new tab with an external-link icon; absolute HTTP
URLs are treated as external even when `external` is omitted.

`headerData.socials` is an array of `{ url, name, label? }` entries. The name chooses the social
icon when Rocket has a matching icon asset. The optional `label` shows visible text to the right of
the icon. Omit `label` for an icon-only link.

`stylesheets` is optional. Use it for project-owned theme CSS loaded after the package Atlas CSS.
Keep color and spacing overrides centralized there, usually as CSS variables, instead of injecting
Page-specific style blocks.

`navigationIconServerBudget` controls how many automatic `rocket-icon` hosts in the docs
navigation are server-rendered before the remaining navigation icons are deferred to the browser.
Atlas defaults this to `35`, which keeps likely above-the-fold navigation icons in the first HTML
response while avoiding work for deep navigation entries. Set it in your project-owned `siteData` to
raise, lower, or zero the budget.

The docs layout reads `headerData`, `stylesheets`, and `navigationIconServerBudget`; keep
`footerData` as an empty array when the same data module is not used by another layout.

Keep this data in your project. Do not import Rocket's docs-site `docs/pages/globalData.js` into a
user site.

## Docs aside tips

Atlas docs pages can render a small aside tip from Page Metadata:

```js label="Page Metadata aside tip"
export const config = {
  path: '/components/button',
  metadata: {
    title: 'Button',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Component tip',
          description: 'Keep examples close to the component they document.',
          iconName: 'cpu',
        },
      },
    },
  },
};
```

`description` is required. `title` defaults to `Tip`, and `iconName` defaults to
`rocket-takeoff`. Set `asideTip: false` to suppress a tip supplied by shared metadata.

## Local layout wrapper

For larger projects, create one user-owned layout module and import it from Pages:

```js label="src/docsLayout.js"
import { atlasDocComponents, atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export { atlasDocComponents };

export const components = atlasDocComponents;
export const layout = pageData => atlasDocLayout(pageData, siteData);
```

Then Pages can use the local wrapper:

````markdown
```js server
export const config = {
  path: '/components/button',
  metadata: { title: 'Button' },
};

import { layout } from '../docsLayout.js';
export { components } from '../docsLayout.js';
```
````

This keeps Rocket-owned imports in one place while the site owns the data and Pages.

## Atlas hero layout

Use `atlasHeroLayout` for a home Page with a hero, project facts, quick-start content, workflow
steps, and feature cards:

```js label="Atlas hero layout"
import { html } from 'lit';
import { atlasHeroLayout } from '@rocket/js/layouts/atlasHero.js';
export { atlasHeroComponents as components } from '@rocket/js/layouts/atlasHero.js';
import { siteData } from './siteData.js';

const heroData = {
  heroMainData: {
    logoNoText: '/assets/acme-mark.svg',
    eyebrow: 'DESIGN SYSTEM DOCS',
    title: 'Build Acme UI docs.',
    body: 'Publish component documentation from plain Markdown and JavaScript Pages.',
    documentationLink: '/components/button',
    documentationText: 'Components',
    setupLink: '/setup',
    setupText: 'Setup',
    installLabel: 'Install',
    installCommand: 'npm install @acme/ui',
    badges: [
      {
        text: 'Open source',
        icon: 'GitHub',
        href: 'https://github.com/acme/acme-ui',
      },
      { text: 'MIT licensed', icon: 'license', href: '/license' },
    ],
  },
  whyRocketData: [
    {
      icon: 'file-earmark-text',
      title: 'Plain source',
      description: 'Write docs in Markdown and keep project code in ordinary files.',
    },
  ],
  quickStartData: {
    title: 'Quick start',
    subtitle: 'In an npm project:',
    command: ['npm install @acme/ui', 'npm start'],
    description: html`Build static output with <code>npm run build</code>.`,
  },
  workflowData: {
    title: 'Author, build, publish',
    steps: [
      {
        icon: 'file-earmark-text',
        title: 'Create docs',
        description: 'Add Pages, demos, and component references.',
      },
      {
        icon: 'terminal',
        title: 'Build',
        description: 'Generate static HTML for production.',
      },
    ],
  },
  featuresData: [
    {
      icon: '1',
      title: 'Static content',
      description: 'Pages build to HTML by default.',
    },
  ],
};

export const layout = pageData => atlasHeroLayout(pageData, { ...siteData, ...heroData });
```

The hero layout reads `headerData` and `footerData` from project-owned data.
`heroMainData.documentationLink` and `heroMainData.setupLink` are required. The button text,
eyebrow, body copy, install pill, badges, why cards, quick start, workflow, and feature list are
optional.

## Atlas not found layout

Use `atlasNotFoundLayout` for a static `404.html` Page:

```js label="docs/pages/404.rocket.md"
export const config = {
  path: '/404.html',
  metadata: { title: 'Page not found' },
  menu: false,
  discoverability: { sitemap: false },
  siteHeadMetadata: { indexing: 'noindex' },
};

import { atlasNotFoundLayout } from '@rocket/js/layouts/atlasNotFound.js';
export { atlasNotFoundComponents as components } from '@rocket/js/layouts/atlasNotFound.js';
import { siteData } from './siteData.js';

export const layout = pageData => atlasNotFoundLayout(pageData, siteData);
```

Static hosts such as Netlify, Cloudflare Pages, Vercel, and GitHub Pages can use the generated
`404.html` file as the custom Not Found response.

## Web Awesome components

Atlas docs and hero components include Web Awesome components used by the layouts. If a custom
layout still wants package component registration, import the package component map directly:

```js label="Web Awesome components"
import { webAwesomeComponents } from '@rocket/js/components/web-awesome.js';

export const components = {
  ...webAwesomeComponents,
};
```

Add Page-owned components to the same map when the Page contains both package components and local
project components.

## When to replace atlas

Keep atlas when the project needs a working documentation shell and the layout shape fits.

Replace it with a custom layout when the site needs different information architecture, custom
header behavior, custom accessibility affordances, or a visual system that should not inherit
Rocket's docs-site layout choices.

## Related docs

- [Layouts](/reference/layouts) covers the layout export and document helper.
- [PageData](/reference/page-data) documents the data atlas reads from Rocket.
- [Build a Site](/tutorials/acme-ui-docs) shows atlas in a complete user-owned project.
