/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
// prettier-ignore
import { veryLongFileHeaderValue, multipleLongFileHeaderValues, fakeHtml, fakeComponents, fakeLayout, components } from './local.data.js';
// prettier-ignore
export { veryLongFileHeaderValue, multipleLongFileHeaderValues, fakeHtml, fakeComponents, fakeLayout, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('my-el', await import('@test/components').then(m => m.MyVeryLongElementName));
}
/* END - Rocket auto generated - do not touch */

export default () => '<my-el></my-el>';
