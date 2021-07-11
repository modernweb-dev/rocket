# Presets >> Search >> Preset || 10

Add a search for all your static content.

## Installation

<code-tabs collection="package-managers" default-tab="npm">

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

<!-- prettier-ignore-start -->
```js
import { rocketSearch } from '@rocket/search';

/** @type {import('rocket/cli').RocketCliConfig} */
export default ({
  presets: [rocketSearch()],
});
```
<!-- prettier-ignore-end -->
