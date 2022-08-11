/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components } from './recursive.data.js';
export { html, components };
export async function registerCustomElements() {
  // hydrate-able components
  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

export default () => html`<my-el loading="hydrate"></my-el>`;
