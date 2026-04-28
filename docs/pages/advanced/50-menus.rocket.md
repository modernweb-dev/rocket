```js server
export const config = {
  path: '/advanced/menus',
  metadata: {
    title: 'Menus',
    description:
      'Control Rocket navigation, labels, ordering, parent groups, and previous-next links.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Menu tip',
          description:
            'Treat Page config as the navigation source of truth: set parent, order, and linkText where the file path alone is not enough.',
        },
      },
    },
  },
  menu: {
    iconName: 'list-ul',
    order: 50,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Menus

Rocket builds a `pageTree` from discovered Pages. Layouts and menu components use that tree for
site navigation, table-of-contents links, and previous/next links.

## Page menu config

Use `config.menu` in the Page config to control how that Page participates in navigation:

```js label="Page menu config"
export const config = {
  path: '/components/button',
  metadata: { title: 'Button' },
  menu: {
    parent: '/components',
    order: 20,
    linkText: 'Button',
    iconName: 'box',
  },
};
```

Options:

- `menu: false`: hide the Page from the menu tree. The root Page is still kept as the tree root, but
  it becomes non-clickable.
- `menu.order`: sort sibling Pages numerically when both siblings have an order.
- `menu.linkText`: set the label used in menus and previous/next links.
- `menu.iconName`: set the optional Bootstrap icon name used by menu components that render icons.
- `menu.parent`: place the Page under a different menu path without changing `config.path`.
- `menu.noLink`: show the Page as a menu group, but skip it as a destination in menu links and
  previous/next navigation.

For predictable ordering, set `menu.order` on all sibling Pages whose order matters. Otherwise,
siblings sort by link text or path-derived name.

## Parent groups

`menu.parent` changes only the menu location. The Page still renders at its own `config.path`:

```js label="Parent menu config"
export const config = {
  path: '/component-loading',
  metadata: { title: 'Component Loading Strategies' },
  menu: {
    parent: '/guides',
    order: 10,
  },
};
```

This Page appears below the `/guides` menu group.

If no concrete Page exists at an intermediate menu path, Rocket creates a non-clickable placeholder
group from the path segment.

## Link text and titles

For Markdown Pages:

| Value     | Resolution order                                                                                |
| --------- | ----------------------------------------------------------------------------------------------- |
| Link text | `config.menu.linkText`, then the `link-text` attribute on the first `h1`                        |
| Title     | `config.metadata.title`, then first `h1` text, then link text, then fallback from `config.path` |

For JavaScript Pages:

| Value     | Resolution order                                                          |
| --------- | ------------------------------------------------------------------------- |
| Link text | `config.menu.linkText`                                                    |
| Title     | `config.metadata.title`, then link text, then fallback from `config.path` |

The title is used for the document title. The link text is used for menus. If no link text exists,
menu components use the resolved title.

## Heading links and table of contents

Markdown headings receive fragment ids and permalink anchors in the rendered HTML. They are also
collected into `pageData.toc`. Layouts can render that with `<rocket-toc>`.

Use `link-text` to change a heading's table-of-contents label:

```html
<h2 link-text="API">Application Programming Interface</h2>
```

Use `menu-exclude` to omit a heading from the table of contents:

```html
<h2 menu-exclude>Generated output details</h2>
```

Markdown Pages may have only one `h1`, and heading levels should not skip levels.

## Menu components

The atlas docs layout registers these menu components:

- `<rocket-menu>` renders `pageData.pageTree` and highlights the current path.
- `<rocket-toc>` renders `pageData.toc`.
- `<rocket-previous-page>` and `<rocket-next-page>` walk the `pageTree` in pre-order and skip `noLink`
  entries.

The lower-level `<main-menu>` component is exported from `@rocket/js/menus.js` for custom layouts.

For the `pageData.pageTree` and `pageData.toc` shapes these components consume, see
[PageData](/reference/page-data).
