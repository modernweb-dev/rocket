/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components } from './recursive.data.js';
export { html, components };
export async function registerCustomElements() {
  // server-only components
  customElements.define('my-el', await import('wrong-pkg').then(m => m.WrongClass));
}
/* END - Rocket auto generated - do not touch */

export default () => html`<my-el></my-el>`;
