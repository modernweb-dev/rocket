```js server
export const config = {
  path: '/tutorials/acme-ui-docs/add-brand-assets',
  metadata: {
    title: 'Add brand assets',
    description: 'Add Acme brand files and document how the docs site references them.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Asset tip',
          description:
            'Use resolve() for source assets used by Pages or layout data, and public/ for stable root-relative files such as favicons.',
        },
      },
    },
  },
  menu: {
    iconName: 'palette',
    parent: '/tutorials',
    order: 50,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Add Brand Assets

The header already uses Acme-owned SVG files. Add a Page that documents those assets so other Site
Authors know which files belong to the docs site and how to reference them.

Use two asset paths in this project:

- `docs/assets/` for source assets that Pages and layout data reference with `resolve()`
- `public/` for stable root-relative files, such as `/favicon.svg`, that Site Head Metadata can
  reference directly

## Add a public favicon

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Acme UI">
  <rect width="48" height="48" rx="10" fill="#0f766e" />
  <path d="M14 33 24 12l10 21h-6l-2-5h-4l-2 5h-6Zm10-16-3 7h6l-3-7Z" fill="white" />
</svg>
```

Then update the Site Head Metadata in `rocket-config.js`:

```js label="rocket-config.js"
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
  siteOrigin: 'https://docs.acme.example',
  siteHeadMetadata: {
    siteName: 'Acme UI Docs',
    defaultDescription: 'Guides and reference for Acme UI components.',
    language: 'en',
    icons: {
      svg: '/favicon.svg',
    },
    themeColor: '#0f766e',
  },
};
```

Rocket emits the favicon reference in the document head. It does not generate or verify favicon
files, so the referenced public path should exist in your project.

## Create the brand Page

Create `docs/pages/brand.rocket.md`:

````markdown
```js server
export const config = {
  path: '/brand',
  metadata: {
    title: 'Brand assets',
    description: 'Acme UI documentation marks and wordmarks.',
  },
  menu: {
    order: 30,
    iconName: 'palette',
  },
};

import { resolve } from '@rocket/js/resolve.js';
import { layout } from '../docsLayout.js';
export { components } from '../docsLayout.js';

const mark = resolve('../assets/acme-mark.svg', import.meta);
const wordmark = resolve('../assets/acme-wordmark.svg', import.meta);
```

# Brand Assets

Use these assets when a documentation Page needs to identify Acme UI.

## Primary mark

<img src="${mark}" alt="Acme UI mark" width="96" />

## Wordmark

<img src="${wordmark}" alt="Acme UI Docs wordmark" width="180" />
````

The asset files stay in `docs/assets/`, and the Page resolves them from the Page's own server code.
That keeps paths explicit and portable across development and build output.

## Add author guidance

Extend the same Page with a short rule:

```md
## Usage

- Use the mark in compact navigation.
- Use the wordmark when there is enough horizontal space.
- Do not copy Rocket's own documentation logos into Acme UI Docs.
```

## Checkpoint

Run the development server and visit `/brand`:

```bash
npm run start
```

You now have branded header assets and a content Page that documents those same user-owned files.
Continue with [Assets](/reference/assets) when you need images, CSS, or package assets beyond this
basic pattern.
