```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '40--blog/002--second/index.rocket.md';
import { html, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
import { layout } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  customElements.define(
    'rocket-social-link',
    await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink),
  );
  customElements.define(
    'rocket-header',
    await import('@rocket/components/header.js').then(m => m.RocketHeader),
  );
  customElements.define(
    'launch-blog-details',
    await import('@rocket/launch/blog-details.js').then(m => m.LaunchBlogDetails),
  );
  customElements.define(
    'rocket-main',
    await import('@rocket/components/main.js').then(m => m.RocketMain),
  );
  customElements.define(
    'rocket-content-area',
    await import('@rocket/components/content-area.js').then(m => m.RocketContentArea),
  );
  // hydrate-able components
  customElements.define(
    'rocket-search',
    await import('@rocket/search/search.js').then(m => m.RocketSearch),
  );
  customElements.define(
    'rocket-drawer',
    await import('@rocket/components/drawer.js').then(m => m.RocketDrawer),
  );
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
import { thomas } from '../../../src/data/authors.js';

export const description =
  'Let us take a look at Rocket which is sort of a nuxt/next equivalent but instead of vue/react it works best with web standards like custom elements, ES modules, template literals...';
export const publishDate = new Date('2022-03-23');

export const tags = ['rocket', 'javascript', 'node', 'SSG'];
export const authors = [thomas];
```

# Second

![some image](./intro.png)
