/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/30--spark/20--demo.rocket.js';
// prettier-ignore
import { html, setupUnifiedPlugins, components as originalComponents, openGraphLayout } from '../../recursive.data.js';
export { html, setupUnifiedPlugins, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // prettier-ignore
  customElements.define('rocket-header-scroll-menu', await import('@rocket/components/header-scroll-menu.js').then(m => m.RocketHeaderScrollMenu));
  // prettier-ignore
  customElements.define('permanent-notification', await import('@rocket/components/permanent-notification.js').then(m => m.PermanentNotification));
}
/* END - Rocket auto generated - do not touch */

export const menuLinkText = 'Demo';
export const title = 'Rocket Landing Page Template (Theme Spark)';

import { LayoutHome } from '@rocket/spark';
import { pageTree } from '#src/layouts/layoutData.js';

export const layout = new LayoutHome({
  pageTree,
  titleWrapperFn: title => title,
  description: 'hey',
  siteName: 'Rocket',
});

import { sparkComponents } from '@rocket/spark/components.js';

export const components = {
  ...originalComponents,
  ...sparkComponents,
};

export default () => html`
  <permanent-notification href="/presets/spark/overview/"
    >⬆️ &nbsp; Back to Rocket &nbsp; ⬆️</permanent-notification
  >
`;
