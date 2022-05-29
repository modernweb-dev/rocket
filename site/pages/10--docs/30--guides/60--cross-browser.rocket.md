```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/60--cross-browser.rocket.md';
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
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */

import { inlineFile } from '@rocket/engine';
import { createRequire } from 'module';
import path from 'path';

const { resolve } = createRequire(new URL('.', import.meta.url));
```

# Cross Browser

If we are using server side rendering for any of our web components then you are using [declarative shadow dom](https://web.dev/declarative-shadow-dom/).
As it's not yet fully supported by all browsers, we may want to use a polyfill to make it work.

If we are using an existing theme/preset then it's most likely taken care of for us.
If not then we can add this style tag and two script tags to our layout.

```bash
npm i -D @webcomponents/template-shadowroot
```

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- On browsers that don't yet support native declarative shadow DOM, a
         paint can occur after some or all pre-rendered HTML has been parsed,
         but before the declarative shadow DOM polyfill has taken effect. This
         paint is undesirable because it won't include any component shadow DOM.
         To prevent layout shifts that can result from this render, we use a
         "dsd-pending" attribute to ensure we only paint after we know
         shadow DOM is active. -->
    <style>
      body[dsd-pending] {
        display: none;
      }
    </style>
  </head>

  <body dsd-pending>
    <script>
      if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
        // This browser has native declarative shadow DOM support, so we can
        // allow painting immediately.
        document.body.removeAttribute('dsd-pending');
      }
    </script>

    <!-- The pre-rendered web components -->

    <script type="module">
      (async () => {
        // Check if we require the declarative shadow DOM polyfill. As of
        // February 2022, Chrome and Edge have native support, but Firefox
        // and Safari don't yet.
        if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
          // Fetch the declarative shadow DOM polyfill.
          const { hydrateShadowRoots } = await import(
            '@webcomponents/template-shadowroot/template-shadowroot.js'
          );

          // Apply the polyfill. This is a one-shot operation, so it is important
          // it happens after all HTML has been parsed.
          hydrateShadowRoots(document.body);

          // At this point, browsers without native declarative shadow DOM
          // support can paint the initial state of your components!
          document.body.removeAttribute('dsd-pending');
        }
      })();
    </script>
  </body>
</html>
```

This loading strategy is based on the [eleventy-plugin-lit](https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit#bootup) bootup strategy.
