```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/20--pages.rocket.md';
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
  customElements.define('content-area', await import('@rocket/components/content-area.js').then(m => m.ContentArea));
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/inline-notification.js').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

export const description = `An intro to Rocket pages, which is the actual website content.`;
```

# Pages

**Pages** are a the only files that get rendered into the output folder.

3 types of pages are supported:

- `*.rocket.md` - A page with markdown content.
- `*.rocket.html` - A page with HTML content.
- `*.rocket.js` - A page with JavaScript content.

Feel free to choose a format for each pages that best suits its content.

## File-based Routing

Rockets uses Pages to do something called **file-based routing.** Every file in your `pages` directory becomes a page on your site, using the file name to decide the final route.

```
site/pages/index.rocket.md        -> mysite.com/
site/pages/about.rocket.md        -> mysite.com/about/
site/pages/about/index.rocket.js  -> mysite.com/about/
site/pages/about/me.rocket.html   -> mysite.com/about/me/
site/pages/posts/1.rocket.md      -> mysite.com/posts/1/
```

## Page Templating

Pages are responsible for having a default export function that when executed will return a full html page.
Rocket "rendering" only happens for JavaScript files.

👉 `site/pages/index.rocket.js`

```js
export default () => `
  <!DOCTYPE html>
  <html>
  <body>
    <h1>Hello World</h1>
  </body>
  </html>
`;
```

👆 This is the JavaScript version which all other formats automatically convert to.

However for you your convenience you can also write your page in HTML and it will be automatically converted into the JavaScript version above.

👉 `site/pages/index.rocket.html`

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

Or you can write markdown.

👉 `site/pages/index.rocket.md`

```md
<!DOCTYPE html>
<html>
<body>

# Hello World

</body>
</html>
```

<inline-notification>

Markdown and HTML files are automatically converted to their JavaScript equivalents.
That is also how they get their template literal super powers.
Those converted files only life for a fraction of a second and are deleted after the page is done rendering.
If you would like to keep them for debugging or out of curiosity you can export the following flag to prefect the cleanup.

```js
export const keepConvertedFiles = true;
```

</inline-notification>

## Layouts of Pages

In order to not duplicate the HTML boilerplate, you can define a layout for your pages.

```js
export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <body>
      ${data.content()}
    </body>
  </html>
`;
```

If you put that content into `pages/recursive.data.js` then it will automatically be imported by all pages.

Which means that your pages become significantly simpler.

👉 `site/pages/index.rocket.js`

```js
export default () => `
  <h1>Hello World</h1>
`;
```

👉 `site/pages/index.rocket.html`

```html
<h1>Hello World</h1>
```

👉 `site/pages/index.rocket.md`

```md
# Hello World
```

## Page Header

Each page has a header that is automatically generated and updated by Rocket.

Do NOT write with the `/* START - ... */` and `/* END - ... */` block as it will be overwritten on every save.

The page header is used to enable the [**data cascade**](./30--data-cascade.rocket.md) feature.
It typically is used for providing a default layout or default settings for a group of pages.

It could look something like this:

👉 `site/pages/index.rocket.js`

```js
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, layout } from './recursive.data.js';
export { html, layout };
/* END - Rocket auto generated - do not touch */

export default () => `
  <h1>Hello World</h1>
`;
```

👉 `site/pages/index.rocket.html`

```html
<script type="module" server>
  /* START - Rocket auto generated - do not touch */
  export const sourceRelativeFilePath = 'index.rocket.html';
  import { html, layout } from './recursive.data.js';
  export { html, layout };
  /* END - Rocket auto generated - do not touch */
</script>

<h1>Hello World</h1>
```

👉 `site/pages/index.rocket.md`

````md
```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
import { html, layout } from './recursive.data.js';
export { html, layout };
/* END - Rocket auto generated - do not touch */
```

# Hello World
````

## Data Loading

Rocket pages can fetch data to help generate your pages. Rocket uses two platform features to get this out of the box: **fetch()** and **top-level await.**

Read our 📚 [full guide](../30--guides/90--data-fetching.rocket.md) on data-fetching to learn more.

````md
```js server
// Example: Fetch running only during build time
const response = await fetch('http://example.com/movies.json');
const data = await response.json();
console.log(data);
```

<!-- Output the result to the page -->
<div>\\${JSON.stringify(data)}</div>
````

## Custom 404 Error Page

For a custom 404 error page create a `404.html.rocket.js` file in `/site/pages`. That builds to a `404.html` page. Most [deploy services](../30--guides/95--deploy.rocket.md) will find and use it.

## Non-HTML Pages

Non-HTML pages, like `.json` or `.xml`, can be built by putting the full filename followed by a `*.rocket.js`.

```
site/pages/404.html.rocket.js         -> mysite.com/404.html
site/pages/sitemap.xml.rocket.js      -> mysite.com/sitemap.xml
site/pages/about/data.json.rocket.js  -> mysite.com/about/data.json
site/pages/assets/logo.svg.rocket.js  -> mysite.com/assets/logo.svg
```

Those file still have all the features of Rocket pages. e.g. you have

- automatically injected page header
- layouts
- data cascade
- ...
