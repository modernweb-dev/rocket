# First Pages >> Getting Started ||10

Rocket is has the following prerequisits:

- [Node 14+](https://nodejs.org/en/)

Make sure they are installed before proceeding.

## Setup

The fastest way to get started is by using an existing preset like the launch preset.

1. Start with an empty new folder

   ```
   mkdir my-project
   cd my-project
   npm init -y
   ```

2. Install dependencies

   ```
   npm install --save-dev @rocket/cli @rocket/launch
   ```

3. Add to your .gitignore

   ```
   ## Rocket ignore files (need to be the full relative path to the folders)
   docs/_merged_data/
   docs/_merged_assets/
   docs/_merged_includes/
   ```

<inline-notification type="danger">

You may be tempted to skip the step above, because you're not ready to commit to git yet!

Rocket uses the .gitignore file to manage it's requirements. If you skip this step, rocket will fail to deploy!

</inline-notification>

4. Create a `rocket.config.mjs` (or `.js` if you have type: "module" in you package.json)

   ```js
   import { rocketLaunch } from '@rocket/launch';

   export default {
     presets: [rocketLaunch()],
   };
   ```

5. (optionally) Create a file `.eleventyignore` (this file will be needed once you start customizing presets)

   ```
   node_modules/**
   /docs/_assets
   /docs/_includes
   /docs/_data
   ```

<inline-notification type="warning" title="note">

All further pathes are relative to your project root (my-project in this case)

</inline-notification>

## Add your first page

👉 `docs/index.md`

```md
# Welcome to your Rocket site

Text here, like any markdown file.
```

This tutorial assumes you are familiar with Markdown, for page authoring.

Please note that the heading - text prefixed with `#` or `##` - is not optional for each page in this tutorial. Everything below that first line is optional Markdown text.

## Start up:

👉 `package.json`

Add `"start": "rocket start"` to your package.json

```json
"scripts": {
  "start": "rocket start"
}
```

Now you can launch your site locally with

```bash
npm run start
```

## Taking Inventory Before Adding Pages:

We're about to add both content and navigation at the same time.

It can be helpful to take an inventory, before we start, to separate basic setup from the creation of content and navigation.

- We built the project with basic npm commands
- Added a couple required files manually
- Adjusted package.json
- **doc/index.md** to seed the content
- Launches with `npm start`

That's all it takes to get a new super-fast and powerful site, complete with a service worker, default styling, navigation, and ready to deploy as a plain old static files.

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
