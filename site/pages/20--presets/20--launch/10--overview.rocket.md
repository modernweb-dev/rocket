```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/20--launch/10--overview.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('content-area', await import('@rocket/components/content-area.js').then(m => m.ContentArea));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
```

# Overview

Rocket comes with a documentation preset you will love. Simple, responsive and behaving like native, it sure is going to be a hit among your users.

## Installation

Install `@rocket/launch` from the NPM repository

```bash
npm i @rocket/launch
```

## Usage

Rocket Launch comes with a few layouts you can use:

- `LayoutSidebar`
- `LayoutHome`
- `Layout404`

👉 `site/pages/recursive.data.js`

```js
import { LayoutSidebar } from '@rocket/launch';

export const layout = new LayoutSidebar();
```

You should also define it as a preset in the configuration so that it can copy some default public files.
(this step is not requires but it is recommended)

👉 `config/rocket.config.js`

```js
import { rocketLaunch } from '@rocket/launch';

/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  presets: [rocketLaunch()],
};
```
