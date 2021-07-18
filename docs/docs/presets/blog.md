# Presets >> Blog || 40

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

<!-- prettier-ignore-start -->
```js
import { rocketBlog } from '@rocket/blog';

/** @type {import('rocket/cli').RocketCliConfig} */
export default ({
  presets: [rocketBlog()],
});
```
<!-- prettier-ignore-end -->
