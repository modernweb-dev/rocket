```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'blog/with-image.rocket.md';
import { html, components } from '../recursive.data.js';
import { layout } from './local.data.js';
export { html, layout, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('blog-header', await import('@example/blog/components/BlogHeader').then(m => m.BlogHeader));
  // prettier-ignore
  customElements.define('blog-author', await import('@example/blog/components/BlogAuthor').then(m => m.BlogAuthor));
  // prettier-ignore
  customElements.define('blog-post', await import('@example/blog/components/BlogPost').then(m => m.BlogPost));
  // prettier-ignore
  customElements.define('site-footer', await import('@example/blog/components/SiteFooter').then(m => m.SiteFooter));
}
/* END - Rocket auto generated - do not touch */

export const title = 'With Image!';
export const publishDate = '13 Sep 2021';
export const author = 'Thomas Allmer (@daKmoR)';
export const authorHref = 'https://twitter.com/daKmoR';
export const value = 128;
export const description = 'Now with an image!';
export const heroImage = './assets/liftoff-flames.jpg';
export const alt = 'Liftoff Flames';
```

hey

<blog-author name="Another Author" href="https://twitter.com/daKmoR"></blog-author>

This is so cool!

Do variables work ${value \* 2}?
