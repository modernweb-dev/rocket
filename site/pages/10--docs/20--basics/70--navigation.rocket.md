```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/70--navigation.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('rocket-main-docs', await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
```

# Navigation

While developing Rocket only renders the pages you are actively looking at in your browser. This means that no matter how many pages you have Rocket will always start very fast.

However by rendering (and reading) only a single page file at a time, it becomes hard to know which other pages are available.

To solve this problem, Rocket maintains a page tree for you.

We will use this [Page Tree](#page-tree) to create menus.

## Menus

The primary reasons for providing a Page Tree is to be able to create menus based on it.
Via this method no other page needs to be touched if we want to understand the structure of the site.

Here is how you can create a Page tree and then use it to render a menu.

👉 `site/pages/index.rocket.js`

```js
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html } from './recursive.data.js';
export { html };
/* END - Rocket auto generated - do not touch */

import { PageTree, SiteMenu } from '@rocket/engine';

export const pageTree = new PageTree();
await pageTree.restore(new URL('./pageTreeData.rocketGenerated.json', import.meta.url));

export default () => `
  <h1>Hello World</h1>
  <p>Navigation below</p>
  ${pageTree.renderMenu(new SiteMenu(), sourceRelativeFilePath)}
`;
```

This will result in something like this:

```html
<h1>Hello World</h1>
<p>Navigation below</p>
<nav aria-label="site">
  <a href="/docs/" aria-current="page">Docs</a>
  <a href="/tools/"> Tools </a>
  <a href="/blog/"> Blog </a>
</nav>
```

Rocket comes with multiple build in menus you can see [below](#menu-types).

## Menu Data

### Menu Link Text

In most cases you probably will not need to do anything as it will take the text of the first h1 of a page as it's menu text.

So if you have a page like this:

```md
# Hello World
```

then it will be called "Hello World" in the menu.

You can overwrite that by using the property `menuLinkText`;

````md
```js server
export const menuLinkText = 'Hello';
```

# Hello World
````

Now the menu will be called "Hello".

Within a menu the text of the links is defined by the following priority:

1. menuLinkText => `export const menuLinkText = 'Page Title In Menu';`
2. h1 => first `<h1>` in the page)
3. title => html title tag
4. sourceRelativeFilePath => fallback if no other option is available

You can influence that data that gets provided to the menu by setting exports.

## Menu No Link

Often you have sections or groups of pages which you want to provide a heading for.

```
.
├── 20--basics
│   ├── 10--project-structure.rocket.md
│   ├── 20--pages.rocket.md
│   └── index.rocket.js
└── index.rocket.md
```

The url `mysite/basics/` now works just fine but in a navigation most people do not click on a category heading.

In order to not confuse people if `Basics` is clickable or not - of if there is valuable content or not you can say this page is not clickable.

You can do so by exporting a flag in `20--basics/index.rocket.js` like so:

```js
export const menuNoLink = true;
```

## Menu Exclude

Sometimes there is a need to completely exclude a page from the pageTree.
Pages with this flag will not exist at all in the pageTree - therefore you will not be able to access them for "anything" not even in a sitemap or an update feed.
Pages that have sub pages can NOT use this flag as it would mean those sub pages would not have a parent page.

Typical use case are utility pages that are not meant to be accessed by typical users.

```js
export const menuExclude = true;
```

## Your own menu

A menu is a class that has a `render` method.

It has access to the full page tree which uses an es module fork of [TreeModel](http://jnuno.com/tree-model-js/).

You can access

- `tree` - first param is the full page tree
- `this.treeModel` an instance of TreeModel
- `this.currentNode` the current active node

```js
class BlogMenu {
  /**
   * @param {NodeOfPage} tree
   * @returns {TemplateResult | nothing}
   */
  render(tree) {
    if (!this.currentNode || !this.currentNode.children) {
      return nothing;
    }
    return html`
      <div>
        ${this.currentNode.children.map(
          /** @param {NodeOfPage} child */ child => html`
            <blog-post-preview .post=${child.model}></blog-post-preview>
          `,
        )}
      </div>
    `;
  }
}
```

## Ordering

Menu items are generally ordered the same as the filesystem. This makes it straight forward to map page navigation to files on the filesystem.
In most cases this is alphabetical.

Which may work or may not work for you.

In case you want to take full control over the order you can apply the following approaches:

1. Prefix your folders/files with `xx--` (recommended)

   - The menu order and file system order will still match
   - No worries those numbers will not appear in your menu or url

   Example folder structure:

   👉 `site/pages/`

   ```
   .
   ├── 10--setup
   │   ├── 10--getting-started.rocket.md
   │   ├── 20--adding-pages.rocket.md
   │   └── index.rocket.js
   ├── 20--basics
   │   ├── 10--project-structure.rocket.md
   │   ├── 20--pages.rocket.md
   │   └── index.rocket.js
   └── index.rocket.md
   ```

2. Use `export const menuOrder = xx;` within pages

   - The menu order and file system order will no longer match
   - But no numbers in folder / filenames

3. Instantiate a new PageTree and providing your own `modelComparatorFn`

   ```js
   function modelComparatorFn(a, b) {
     // this is the default implementation which will sort by the `menuOrder` property
     // feel free to completely replace it
     const aOrder = a.menuOrder || 0;
     const bOrder = b.menuOrder || 0;
     return aOrder - bOrder;
   }

   const pageTree = new PageTree({ modelComparatorFn });
   ```

## Page Tree

The data of the page tree gets saves as a JSON file in the root of the `pages` directory.

It typically looks something like this:

```json
{
  "title": "Rocket | Rocket",
  "h1": "Rocket",
  "name": "Rocket",
  "menuLinkText": "Rocket",
  "url": "/",
  "outputRelativeFilePath": "index.html",
  "sourceRelativeFilePath": "index.rocket.js",
  "level": 0,
  "children": [
    {
      "title": "Learning Rocket | Rocket",
      "h1": "Learning Rocket",
      "headlinesWithId": [
        {
          "text": "Learning Rocket",
          "id": "learning-rocket",
          "level": 1
        }
      ],
      "name": "Learning Rocket",
      "menuLinkText": "Docs",
      "url": "/docs/",
      "outputRelativeFilePath": "docs/index.html",
      "sourceRelativeFilePath": "10--docs/index.rocket.md",
      "level": 1,
      "children": [
// ...
```

So whenever you change the h1 or a filename in the `pages` directory, the page tree gets updated and the json file gets saved.

## Menu types

```js
import {
  ArticleOverviewMenu,
  BreadcrumbMenu,
  ChildListMenu,
  IndexMenu,
  NextMenu,
  PreviousMenu,
  SiteMenu,
  TableOfContentsMenu,
} from '@rocket/engine';
```

1. **ArticleOverviewMenu**

   - shows a flat list of pages
   - includes multiple meta data like cover image, heading, subHeading, authors, ...
   - typically displayed as a grid

   ```html
   <web-menu name="article-overview">
     <div>
       <article class="post">
         <div class="cover">
           <a href="/blog/new-year-new-challenge/" tabindex="-1" aria-hidden="true">
             <figure>
               <img src="..." />
             </figure>
           </a>
         </div>
         <a href="/blog/new-year-new-challenge/">
           <h2>New year means new challenges</h2>
         </a>
         <div class="description">
           <a href="/blog/new-year-new-challenge/" tabindex="-1">
             <p>It is a new year and there are new challenges awaiting.</p>
           </a>
         </div>
       </article>

       <article class="post">
         <div class="cover">
           <a href="/blog/comparing-apple-to-oranges/" tabindex="-1" aria-hidden="true">
             <figure>
               <img src="..." />
             </figure>
           </a>
         </div>
         <a href="/blog/comparing-apple-to-oranges/">
           <h2>Comparing apple to oranges</h2>
         </a>
         <div class="description">
           <a href="/blog/comparing-apple-to-oranges/" tabindex="-1">
             <p>Say you have an apple and you then find an orange - what would you do?</p>
           </a>
         </div>
       </article>
     </div>
   </web-menu>
   ```

2. **BreadcrumbMenu**

   - starts at root and goes the tree up to the current page
   - flat ol/li list

   ```html
   <web-menu name="breadcrumb">
     <nav aria-label="Breadcrumb">
       <ol>
         <li class="web-menu-active"><a href="/">Home</a></li>
         <li class="web-menu-active"><a href="/components/">Components</a></li>
         <li class="web-menu-current">
           <a href="/components/button-blue/" aria-current="page">Button Blue</a>
         </li>
       </ol>
     </nav>
   </web-menu>
   ```

3. **ChildListMenu**

   - starts at level 1
   - flat list of links
   - commonly used as a top bar navigation of "sections"

   ```html
   <web-menu name="site">
     <nav aria-label="site">
       <a href="/about/">About</a>
       <a href="/components/" aria-current="page">Components</a>
     </nav>
   </web-menu>
   ```

4. **IndexMenu**

   - starts at level 2
   - nested ul/li list
   - level 2 becomes a not clickable category heading if it has children
   - level 3+ becomes a `detail/summary` element needing a click if it has children
   - ideally used in combination with `site`

   ```html
   <web-menu name="index">
     <nav aria-label="index">
       <ul class="lvl-2">
         <li class="web-menu-active">
           <span>Content</span>
           <ul class="lvl-3">
             <li class="web-menu-active">
               <details open>
                 <summary>Accordion</summary>
                 <ul class="lvl-4">
                   <li class="web-menu-current">
                     <a href="/components/content/accordion/overview/" aria-current="page"
                       >Overview</a
                     >
                   </li>
                   <li><a href="/components/content/accordion/api/">API</a></li>
                 </ul>
               </details>
             </li>
           </ul>
         </li>
         <li>
           <span>Inputs</span>
           <ul class="lvl-3">
             <li><a href="/components/inputs/input-text/">Input Text</a></li>
             <li><a href="/components/inputs/textarea/">Textarea</a></li>
           </ul>
         </li>
       </ul>
     </nav>
   </web-menu>
   ```

5. **NextMenu**

   - shows the next page in the tree
   - is either the first child or he next sibling

   ```html
   <web-menu name="next">
     <a href="/second.html">
       <span>next</span>
       <span>Second</span>
     </a>
   </web-menu>
   ```

6. **PreviousMenu**

   - shows the previous page in the tree
   - is either the previous sibling or the parent

   ```html
   <web-menu name="previous">
     <a href="/first.html">
       <span>previous</span>
       <span>First</span>
     </a>
   </web-menu>
   ```

7. **SiteMenu**

   - starts at level 1
   - flat list of links
   - commonly used as a top bar navigation of "sections"

   ```html
   <web-menu name="site">
     <nav aria-label="site">
       <a href="/about/">About</a>
       <a href="/components/" aria-current="page">Components</a>
     </nav>
   </web-menu>
   ```

8. **tableOfContents**

   - lists the headlines of the current page in a hierarchy
   - nested ol/li list

   ```html
   <web-menu name="table-of-contents">
     <aside>
       <h2>Contents</h2>
       <nav aria-label="Table of Contents">
         <ol class="lvl-2">
           <li>
             <a href="#every-headline">Every headline</a>
             <ol class="lvl-3">
               <li><a href="#will-be">will be</a></li>
             </ol>
           </li>
           <li><a href="#to-the">to the</a></li>
           <li><a href="#main-level">main level</a></li>
         </ol>
       </nav>
     </aside>
   </web-menu>
   ```
