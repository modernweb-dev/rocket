# First Pages >> Adding Pages ||12

<inline-notification type="warning">

You can do this whole part of the tutorial in a couple minutes. It's almost _**too**_ fast.

It can help to examine each new page and menu carefully, to come to terms with the implicit navigation created by your addition of new content, at least the first couple of times.

</inline-notification>

## Add a section

In most cases you will have multiple sections in your website and each of those sections will come with its own sidebar navigation.

To create a section you need to create a folder with an `index.md`.

```bash
mkdir docs/guides
```

👉 `docs/guides/index.md`

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

## Adding a category

Often each section will have multiple categories.

To create a category you need to create a folder with an `index.md`.

```bash
mkdir docs/guides/first-pages/
```

👉 `docs/guides/first-pages/index.md`

```md
# First Pages
```

## Adding a page to a category

👉 `docs/guides/first-pages/getting-started.md`

```md
# First Pages >> Getting Started

This is how you get started.
```

## Headings as anchor and menu items

_**Within**_ any page, you can still add links to your navigation!

Note that md text prefixed with one or two # signs also becomes and anchor in the page and a link in the sidebar navigation when the page is open.

```md
## Headings as anchor and menu items

_**Within**_ any page, you can still add links to your navigation!
```

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```

## Example as a reference

If implicit navigation, derived from content, is a bit too much to grasp in one sitting, feel free to examine the **docs** folder in [the rocket codebase behind the pages you are reading](https://github.com/modernweb-dev/rocket) for more examples.
