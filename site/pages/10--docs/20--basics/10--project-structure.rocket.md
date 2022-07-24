```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/10--project-structure.rocket.md';
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

export const description = 'Learn how to structure a project with Rocket.';
```

# Project Structure

Rocket works with one input folder for all your pages that defaults to `site/pages`.
Within `pages` there is a `__public` folder that will be copied as is to the output folder.

All other files like `layouts`, `css`, `data`, ... can be placed anywhere in your project.

<inline-notification>

Rocket will ONLY generate html files into your output folder.

</inline-notification>

The generated html files will reference the source files directly.

e.g.

```html
<img src="./me.png" alt="Picture of me" />
<!-- will become -->
<img src="../../path/to/me.png" alt="Picture of me" />
```

## Recommended Project Structure

Even if there is no enforce project structure it still makes sense to follow some common best practices.

- `site/pages/*` - All the pages of your website (e.g. all `*.rocket.{js,md,html}` files)
- `site/pages/about/_assets/*` - Keep assets related to pages close to the page itself (e.g. images, videos, ...)
- `site/public` - Non-code assets that need to be copied as is (favicon, robots.txt, server config, ...)
- `site/src/*` - Your project source code (components, layouts, ...)
- `package.json` - A project manifest.

The easiest way to set up your new project is with `npx @rocket/create@latest`. Check out our [Getting started](../10--setup/10--getting-started.rocket.md) for more details.

Most projects come with a structure similar to this.

```
.
.
├── config
│   └── rocket.config.js
├── site
│   ├── pages
│   │   ├── about
│   │   │   ├── _assets
│   │   │   │   └── liftoff-flames.jpg
│   │   │   ├── index.rocket.html
│   │   │   └── me.rocket.md
│   │   ├── index.rocket.js
│   │   ├── pageTreeData.rocketGenerated.json
│   │   └── recursive.data.js
│   ├── public
│   │   └── robots.txt
│   └── src
│       ├── components
│       ├── layouts
│       ├── parts
│       └── styles
└── package.json
```

### `site/pages/`

[Pages](./20--pages.rocket.md) contain all pages (`.rocket.md`, `.rocket.html` and `.rocket.js` is supported) for your website. It is **required** that you put your pages in this directory.

### `site/src/`

The src folder is where most of your project source code lives. This includes:

- [Components](./40--components.rocket.md)
- [Layouts](./50--layouts.rocket.md)
- [Styling](../30--guides/70--styles-and-css.rocket.md)

Rocket has complete control over how these files get processed, optimized, and bundled in your final site build. Some files (like only server rendered components) never make it to the browser directly and are instead rendered to HTML. Other files (like CSS) are sent to the browser but may be bundled with other CSS files depending on how your site uses them.

### `site/src/components`

[Components](./40--components.rocket.md) are web standard [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) which are reusable units of UI for your HTML pages. It is recommended (but not required) that you put your components in this directory. How you organize them within this directory is up to you.

### `site/src/layouts`

[Layouts](./50--layouts.rocket.md) are reusable components for HTML page layouts. It is recommended (but not required) that you put your layout components in this directory. How you organize them within this directory is up to you.

### `site/public/`

For most users, the majority of your files will live inside of the `site/pages/` and `site/src/` directory so that Rocket can optimize them in your final build. By contrast, the `site/public/` directory is the place for any files to live outside of the Rocket build process.

If you put a file into the public folder, it will not be processed by Rocket. Instead it will be copied into the build folder untouched. This can be useful for specific file like `robots.txt` or `site.webmanifest` or sometimes for assets like images that you need in a specific location.
