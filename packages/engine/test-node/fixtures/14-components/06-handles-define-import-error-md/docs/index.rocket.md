```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
import { html, components } from './recursive.data.js';
export { html, components };
export async function registerCustomElements() {
  // server-only components
  customElements.define('my-el', await import('wrong-pkg').then(m => m.WrongClass));
}
/* END - Rocket auto generated - do not touch */
```

<my-el></my-el>
