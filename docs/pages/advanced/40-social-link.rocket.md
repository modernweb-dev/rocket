```js server
export const config = {
  path: '/advanced/social-link',
  metadata: {
    title: 'Social Link',
    description:
      'Render an external social link as an icon-only brand link or an icon with visible text.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Social link tip',
          description:
            'Use a visible label when the link appears in content; use icon-only links only where surrounding layout already explains them.',
        },
      },
    },
  },
  menu: {
    linkText: 'Social Link',
    iconName: 'share',
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Social Link

`<rocket-social-link>` renders an external social/profile link with a brand icon. Rocket uses it in
the Atlas header layouts, and Pages can use it directly when they export `atlasDocComponents` or
register the component themselves.

Use `name` for the brand icon. Add `label` only when the link should show text to the right of the
icon.

## Icon-only Link

Omit `label` when the link should render as only the brand icon:

```html
<rocket-social-link
  url="https://github.com/modernweb-dev/rocket"
  name="GitHub"
  siteName="Rocket"
></rocket-social-link>
```

<p><rocket-social-link url="https://github.com/modernweb-dev/rocket" name="GitHub" siteName="Rocket"></rocket-social-link></p>

## Link With Visible Label

Set `label` when the link should render as the icon plus visible text:

```html
<rocket-social-link
  url="https://github.com/modernweb-dev/rocket"
  name="GitHub"
  label="Open Source"
  siteName="Rocket"
></rocket-social-link>
```

<p><rocket-social-link url="https://github.com/modernweb-dev/rocket" name="GitHub" label="Open Source" siteName="Rocket"></rocket-social-link></p>

## Attributes

| Attribute         | Required | Description                                                                       |
| ----------------- | -------- | --------------------------------------------------------------------------------- |
| `url`             | Yes      | Destination URL. The rendered link opens in a new tab with `noopener noreferrer`. |
| `name`            | Yes      | Brand name used to load the icon asset. Matching is case-insensitive.             |
| `label`           | No       | Visible text shown to the right of the icon. Omit it for an icon-only link.       |
| `siteName`        | No       | Site or project name used in the accessible link label.                           |
| `aria-label`      | No       | Override for the rendered link's accessible name.                                 |
| `dark-background` | No       | Switches icon and label color for dark surfaces.                                  |

Supported icon names are `Discord`, `GitHub`, `GitLab`, `license`, `npm`, `Slack`, `Telegram`, and
`Twitter`. The name maps to an SVG asset in Rocket's social icon set.

## Accessible Label Override

By default, a visible label becomes part of the accessible name:

```html
<rocket-social-link
  url="https://github.com/modernweb-dev/rocket"
  name="GitHub"
  label="Open Source"
  siteName="Rocket"
></rocket-social-link>
```

That announces as `Open Source: Rocket on GitHub`.

Use `aria-label` when the visible label is already the complete accessible name:

```html
<rocket-social-link
  url="https://www.npmjs.com/package/@rocket/js"
  name="npm"
  label="Published on npm"
  aria-label="Published on npm"
></rocket-social-link>
```

<p><rocket-social-link url="https://www.npmjs.com/package/@rocket/js" name="npm" label="Published on npm" aria-label="Published on npm"></rocket-social-link></p>

## Atlas Header Data

Atlas layouts pass `headerData.socials` entries through to `<rocket-social-link>`.

```js label="src/siteData.js"
export const siteData = {
  headerData: {
    logo: ['/assets/acme-mark.svg'],
    homeLink: '/',
    socials: [
      {
        url: 'https://github.com/acme/acme-ui',
        name: 'GitHub',
      },
      {
        url: 'https://github.com/acme/acme-ui',
        name: 'GitHub',
        label: 'Open Source',
      },
    ],
  },
};
```

## Atlas Hero Trust Badges

The Atlas hero layout also uses `<rocket-social-link>` for linked `heroMainData.badges`. This keeps
the header socials and home Page trust badges on the same icon assets.

```js label="docs/pages/home.rocket.md"
const localData = {
  heroMainData: {
    badges: [
      {
        text: 'Open source',
        icon: 'GitHub',
        href: 'https://github.com/modernweb-dev/rocket',
      },
      {
        text: 'MIT licensed',
        icon: 'license',
        href: 'https://github.com/modernweb-dev/rocket/blob/main/LICENSE',
      },
      {
        text: 'Published on npm',
        icon: 'npm',
        href: 'https://www.npmjs.com/package/@rocket/js',
      },
    ],
  },
};
```

For backwards compatibility, the hero badge renderer maps older badge icon names to the shared
social icon assets:

| Old value | Social icon asset |
| --------- | ----------------- |
| `github`  | `GitHub`          |
| `scale`   | `license`         |
| `package` | `npm`             |
