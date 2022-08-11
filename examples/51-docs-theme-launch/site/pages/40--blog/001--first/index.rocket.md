```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '40--blog/001--first/index.rocket.md';
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
  'A tool that checks the validity of all your HTML links of your whole website.';
export const publishDate = new Date('2021-05-09');

export const tags = ['html', 'javascript', 'webdev', 'node'];
// cover_image: https://dev-to-uploads.s3.amazonaws.com/i/an9z6f4hdll2jlne43u3.jpg

export const authors = [thomas];
```

# First
