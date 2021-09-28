# First Pages >> Getting Started ||10

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
npm install --save-dev @rocket/cli @rocket/drawer @rocket/launch @rocket/navigation
```

```bash tab yarn
yarn add -D @rocket/cli @rocket/drawer @rocket/launch @rocket/navigation
```

```bash tab pnpm
pnpm add -D @rocket/cli @rocket/drawer @rocket/launch @rocket/navigation
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

- `.gitignore` containing rocket's build artifacts
- `rocket.config.js` containing a minimal rocket config
- `docs/.eleventyignore` required to allow you to [override templates](/guides/presets/overriding/)
- `docs/index.md` your first page

It also set the package `type` to `"module"` and adds a `start` and `docs` package scripts.

<inline-notification type="warning">

If you don't want to use the `module` package type, make sure to rename the generated config file to `rocket.config.mjs`.

</inline-notification>

<details><summary>Default Files Contents</summary>

<code-tabs default-tab="rocket.config.js">

<!-- prettier-ignore-start -->
```js tab rocket.config.js
import { rocketLaunch } from '@rocket/launch';

/** @type {import('rocket/cli').RocketCliConfig} */
export default ({
  presets: [rocketLaunch()],
});
```
<!-- prettier-ignore-end -->

```md tab docs/index.md
# Welcome to Your Rocket Site

Add your markdown content here.
```

<!-- prettier-ignore-start -->

```html tab docs/.eleventyignore
_assets
_includes
_data
```

```html tab .gitignore
## Rocket ignore files (need to be the full relative path to the folders)
docs/_merged_data/
docs/_merged_assets/
docs/_merged_includes/
```

<!-- prettier-ignore-end -->

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
pnpm start
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

## Next Steps

- [Adding Pages](../adding-pages/)
- [Using Presets](../../presets/getting-started/)

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
