/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components, layout } from './recursive.data.js';
export { html, components, layout };
export async function registerCustomElements() {
  // server-only components
  customElements.define(
    'hello-wave',
    await import('#components/HelloWave.js').then(m => m.HelloWave),
  );
  // hydrate-able components
  customElements.define(
    'hello-typer',
    await import('#components/HelloTyper.js').then(m => m.HelloTyper),
  );
  customElements.define(
    'my-counter',
    await import('#components/MyCounter.js').then(m => m.MyCounter),
  );
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

export default () => html`
  <h1>Hello World</h1>
  <hello-wave></hello-wave>
  <hello-typer loading="hydrate:onVisible"></hello-typer>
  <details open>
    <!-- put an open attribute on the details element to check hydration as you scroll down -->
    <summary>👇</summary>
    <p style="height: 120vh;">Emptiness of space</p>
  </details>
  <my-counter loading="hydrate:onVisible"></my-counter>
`;
