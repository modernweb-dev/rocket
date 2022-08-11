```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'about.rocket.md';
import { html, layout, components } from './recursive.data.js';
export { html, layout, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('blog-header', await import('rocket-blog-starter/components/BlogHeader').then(m => m.BlogHeader));
  // prettier-ignore
  customElements.define('site-footer', await import('rocket-blog-starter/components/SiteFooter').then(m => m.SiteFooter));
}
/* END - Rocket auto generated - do not touch */
```

# About

I love writing about things.
