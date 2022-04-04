/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components, openGraphServerComponents, openGraphLayout } from './recursive.data.js';
export { html, components, openGraphServerComponents, openGraphLayout };
export async function registerCustomElements() {
  // hydrate-able components
  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));
}
/* END - Rocket auto generated - do not touch */

export default () => html`<my-el loading="hydrate:onClick"></my-el>`;
