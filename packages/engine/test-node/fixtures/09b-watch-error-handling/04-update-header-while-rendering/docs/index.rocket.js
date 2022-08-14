/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components, layout } from './recursive.data.js';
export { html, components, layout };
export async function registerCustomElements() {
  // hydrate-able components
  customElements.define('hello-typer', await import('#c/HelloTyper.js').then(m => m.HelloTyper));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

export default () => html`
  <h1>Hello World</h1>
  <hello-typer loading="hydrate:onVisible"></hello-typer>
`;
