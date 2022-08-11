/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components, openGraphLayout } from './recursive.data.js';
export { html, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));
  // server-only open-graph only components
  customElements.define('other-el', await import('@test/components').then(m => m.OtherEl));
}
/* END - Rocket auto generated - do not touch */

export default () => html`<my-el></my-el>`;
