/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components } from './recursive.data.js';
export { html, components };
export async function registerCustomElements() {
  // hydrate-able components
  customElements.define('my-el4', await import('@test/components/MyEl4').then(m => m.MyEl4));
  // client-only components
  // 'my-only': () => import('@test/components/MyOnly').then(m => m.MyOnly),
}
/* END - Rocket auto generated - do not touch */

export default () => html`
  <my-el4 loading="hydrate"></my-el4>
  <my-only loading="client"></my-only>
`;
