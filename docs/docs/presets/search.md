# Presets >> Search || 30

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

```js
import { rocketSearch } from '@rocket/search';

export default {
  presets: [rocketSearch()],
};
```

## Styling

| Property                              | Default   | Description                          |
| ------------------------------------- | --------- | ------------------------------------ |
| `--rocket-search-background-color`    | `#fff`    | Search results background color      |
| `--rocket-search-input-border-color`  | `#dfe1e5` |                                      |
| `--rocket-search-input-border-radius` | `24px`    |                                      |
| `--rocket-search-fill-color`          | `#000`    | Search Icon Color                    |
| `--rocket-search-highlight-color`     | `#6c63ff` | Highlighted search result text color |
