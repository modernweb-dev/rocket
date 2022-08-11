/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/10--first-category/index.rocket.js';
import {
  html,
  layout,
  setupUnifiedPlugins,
  components,
  openGraphLayout,
} from '../../recursive.data.js';
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
    'rocket-main-docs',
    await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs),
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

export const menuNoLink = true;

export default () => html`<h1>First Category</h1>`;
