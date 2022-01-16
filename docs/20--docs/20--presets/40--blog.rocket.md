```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/20--presets/40--blog.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Blog

Enable writing blog posts within your Rocket site.

## Installation

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npm i @rocket/blog
```

```bash tab yarn
yarn add @rocket/blog
```

```bash tab pnpm
pnpm add @rocket/blog
```

</code-tabs>

## Usage

👉 `rocket.config.js`

```js
import { rocketBlog } from '@rocket/blog';

/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  presets: [rocketBlog()],
};
```
