```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/10--first-pages/10--getting-started.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Getting Started

Rocket has the following prerequisites:

- [Node 14+](https://nodejs.org/en/)

Make sure they are installed before proceeding.

## Setup

The fastest way to get started is by using an existing preset like the launch preset.

### Step 1. Initialize the Project Package

Start by creating an empty folder for your project

```bash copy
mkdir my-project
cd my-project
```

Then initialize a package.json file

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npm init -y
```

```bash tab yarn
yarn init -y
```

```bash tab pnpm
pnpm init -y
```

</code-tabs>

### Step 2. Install dependencies

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npm install --save-dev @rocket/cli @rocket/launch
```

```bash tab yarn
yarn add -D @rocket/cli @rocket/launch
```

```bash tab pnpm
pnpm add -D @rocket/cli @rocket/launch
```

</code-tabs>

### Step 3. Bootstrap the project

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npx rocket bootstrap
```

```bash tab yarn
yarn rocket bootstrap
```

```bash tab pnpm
pnpx rocket bootstrap
```

</code-tabs>

The `bootstrap` command creates four files in your repo:

- `rocket.config.js` containing a minimal rocket config
- `docs/index.md` your first page
- `.gitignore` containing rocket's build artifacts
- `.vscode/settings.json` hide build artifacts in your vscode

It also set the package `type` to `"module"` and adds a `start` and `docs` package scripts.

<inline-notification type="warning">

If you don't want to use the `module` package type, make sure to rename the generated config file to `rocket.config.mjs`.

</inline-notification>

<details><summary>Default Files Contents</summary>

<code-tabs default-tab="rocket.config.js">

```js tab rocket.config.js
import { rocketLaunch } from '@rocket/launch';

/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  presets: [rocketLaunch()],
};
```

```md tab docs/index.md
# Welcome to Your Rocket Site

Add your markdown content here.
```

```html tab .gitignore
## Rocket ignore files (need to be the full relative path to the folders) docs/_merged_data/
docs/_merged_assets/ docs/_merged_includes/
```

</code-tabs>

</details>

## Add your First Page

Bootstrap created the file `docs/index.md`. Open it in your editor and change it to suit your needs.

<small>NOTE: This tutorial assumes you are familiar with Markdown, for page authoring.</small>

```md
# Welcome to Your Rocket Site

Add your markdown content here.
```

Please note that the heading - text prefixed with `#` or `##` - is not optional for each page in this tutorial. Everything below that first line is optional Markdown text.

## Startup

Now you can launch your site locally with

<code-tabs collection="package-managers" default-tab="npm" align="end">

```bash tab npm
npm start
```

```bash tab yarn
yarn start
```

```bash tab pnpm
pnpx start
```

</code-tabs>

## Taking Inventory Before Adding Pages:

We're about to add both content and navigation at the same time.

It can be helpful to take an inventory, before we start, to separate basic setup from the creation of content and navigation.

- We built the project with basic npm commands
- Added a couple required files manually
- Adjusted package.json
- **docs/index.md** to seed the content
- Launches with `npm start`

That's all it takes to get a new super-fast and powerful site, complete with a service worker, default styling, navigation, and ready to deploy as a plain old static files.

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
