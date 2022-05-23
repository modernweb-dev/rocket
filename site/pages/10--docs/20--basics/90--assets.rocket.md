```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/90--assets.rocket.md';
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
  customElements.define('inline-notification', await import('@rocket/components/components/InlineNotification').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/web').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Assets

One of the best aspects of Rocket is it is _pretty much_ HTML, CSS, Markdown, and JS. This means using assets (images, videos, CSS files, GIFs, etc.) is as easy as it normally is in the "vanilla" context of each of those languages.

<inline-notification>

During development Rocket does not move any of your assets around but it changes the paths in the output HTML to reference to the original assets location.
This means that relative paths within assets (like css, js) will always work.

</inline-notification>

## Source Assets

### HTML

```html
<img src="../path/to/your/image.jpg" alt="My Image" />
```

### CSS

```css
.my-class {
  background-image: url('../path/to/your/image.jpg');
}
```

### Markdown

```md
![My Image](../path/to/your/image.jpg)
```

### Javascript

This would be similar to HTML since it would be inside of an html template literal

```js
export default () => html`<img src="../path/to/your/image.jpg" alt="My Image" />`;
```

## Static Assets

Oftentimes, you have files such as robots.txt, .htaccess (redirects), favicons, etc. that do not need to be in your `src/` directory. For these types of files that simply need to be copied to the built site you will want to place them in your `site/public/` folder. Anything in this folder will be copied over into the built site completely untouched.

**Note:** Since these files are simply copied over during the build process, anything you place in the `site/public/` directory will not be optimized, bundled, or minified by Rocket.

## The `:resolve` Function

Rocket includes a special `:resolve` function that will resolve npm imports for assets.
This means any npm package, script, image, video, css file, etc. can be used as the value of the src attribute.

Here is an example of css file being imported using the `:resolve` function

```html
<img src="resolve:@rocket/engine/assets/logo.svg" alt="Rocket Logo" />

<link rel="stylesheet" href="resolve:@example/blog/styles/blog.css" />
```

## Node exports

If your package is `"type": "module"` then you can also add exports.

👉 `package.json`

```json
{
  "name": "my-package",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./assets/*": "./src/assets/*"
  }
}
```

Once you have an export it also enables to "self" reference your package.
Combine this with the `:resolve` function means that you can reference assets always with the same path.
Completely unrelated to the path of the file itself.

👉 `site/pages/index.rocket.md`

```md
![Logo](resolve:my-package/assets/logo.svg)
```

👉 `site/pages/about/index.rocket.md`

```md
![Logo](resolve:my-package/assets/logo.svg)
```
