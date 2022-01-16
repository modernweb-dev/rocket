```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/10--first-pages/20--adding-pages.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Adding Pages

<inline-notification type="warning">

You can do this whole part of the tutorial in a couple minutes. It's almost _**too**_ fast.

It can help to examine each new page and menu carefully, to come to terms with the implicit navigation created by your addition of new content, at least the first couple of times.

</inline-notification>

## Add a Section

In most cases you will have multiple sections in your website and each of those sections will come with its own sidebar navigation.

To create a section you need to create a folder with an `index.rocket.md`.

```bash
mkdir docs/guides
```

👉 `docs/guides/index.rocket.md`

```md
# Guides

You can read all about...
```

Observe that this creates a section named "Guides" at the top menu bar, and a page with the same title.

<inline-notification type="tip">

Don't worry if this isn't how you would have styled or placed your menu bar or sidebar navigation, we'll get to customization of the default preset later in the tutorials.

</inline-notification>

> How many sections should I add?

It might be more practical to stay below 5 sections.

## Adding a Category

Often each section will have multiple categories.

To create a category you need to create a folder with an `index.rocket.md`.

```bash
mkdir docs/guides/first-pages/
```

👉 `docs/guides/first-pages/index.rocket.md`

```md
# First Pages
```

## Adding a Page to a Category

👉 `docs/guides/first-pages/getting-started.rocket.md`

```md
# Getting Started

This is how you get started.
```

## Headings as Anchor and Menu Items

_**Within**_ any page, you can still add links to your navigation!

Note that Markdown text prefixed with one or two # signs also becomes an anchor in the page and a link in the sidebar navigation when the page is open.

```md
## Headings as Anchor and Menu Items

_**Within**_ any page, you can still add links to your navigation!
```

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```

## Example as a Reference

If implicit navigation, derived from content, is a bit too much to grasp in one sitting, feel free to examine the **docs** folder in [the rocket codebase behind the pages you are reading](https://github.com/modernweb-dev/rocket) for more examples.
