/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '40--blog/index.rocket.js';
import { html, setupUnifiedPlugins, components, openGraphLayout } from '../recursive.data.js';
export { html, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('content-area', await import('@rocket/components/content-area.js').then(m => m.ContentArea));
  // prettier-ignore
  customElements.define('launch-blog-preview', await import('@rocket/launch/blog-preview.js').then(m => m.LaunchBlogPreview));
  // prettier-ignore
  customElements.define('launch-blog-overview', await import('@rocket/launch/blog-overview.js').then(m => m.LaunchBlogOverview));
  // prettier-ignore
  customElements.define('main-content', await import('@rocket/components/main-content.js').then(m => m.MainContent));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

import { LayoutMain } from '@rocket/launch';
import { layoutData } from '../../src/layouts/layoutData.js';

export const menuLinkText = 'Blog';
export const layout = new LayoutMain({
  ...layoutData,
});

export default () => html`
  <content-area>
    <h1>Rocket Blog</h1>
    <p>
      Discover articles from the core team and contributors about Rocket, tips and tricks included!
    </p>

    <launch-blog-overview
      .pageTree=${layoutData.pageTree}
      .sourceRelativeFilePath=${sourceRelativeFilePath}
    >
    </launch-blog-overview>
  </content-area>
`;
