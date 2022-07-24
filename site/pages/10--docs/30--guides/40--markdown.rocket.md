```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/40--markdown.rocket.md';
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
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
```

# Markdown

Markdown automatically gets converted to JavaScript files which means you can use JavaScript template literals within markdown.

````md
```js server
const age = 42;
```

I am \\${age} years old
````

will result in

```js server
const age = 42;
```

<div style="border: 1px solid green; padding: 20px;">

I am ${age} years old

</div>

## Adding Remark/Unified Plugins

If you want to add a plugin to the Markdown processing you can use `setupUnifiedPlugins`.

````md
```js server
import { addPlugin } from 'plugins-manager';
import markdown from 'remark-parse';
import emoji from 'remark-emoji';

export const setupUnifiedPlugins = [addPlugin(emoji, {}, { location: markdown })];
```

See a :dog:
````

will result in

```html
<p>See a 🐶</p>
```

For plugins that should handle the Markdown <abbr title="Abstract Syntax Tree">AST</abbr> you should use `addPlugin(emoji, {}, { location: markdown })`. <br>
While for the rehype AST you should use `addPlugin(emoji, {}, { location: remark2rehype }`.
