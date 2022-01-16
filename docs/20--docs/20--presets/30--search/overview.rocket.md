```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/20--presets/30--search/overview.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Overview

Add a search for all your static content.

## Installation

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npm i @rocket/search
```

```bash tab yarn
yarn add @rocket/search
```

```bash tab pnpm
pnpm add @rocket/search
```

</code-tabs>

## Usage

👉 `rocket.config.js`

```js
import { rocketSearch } from '@rocket/search';

/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  presets: [rocketSearch()],
};
```
