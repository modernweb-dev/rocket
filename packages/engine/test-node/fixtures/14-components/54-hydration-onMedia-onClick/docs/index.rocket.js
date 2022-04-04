/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components, layout } from './recursive.data.js';
export { html, components, layout };
export async function registerCustomElements() {
  // hydrate-able components
  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));
}
/* END - Rocket auto generated - do not touch */

export default () => html`
  <my-el loading="hydrate:onMedia('(max-width: 320px)') && onClick"></my-el>
`;