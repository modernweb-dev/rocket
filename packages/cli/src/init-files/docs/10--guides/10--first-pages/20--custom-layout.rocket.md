```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/10--first-pages/20--custom-layout.rocket.md';
import { pageTree } from '../../recursive.data.js';
export { pageTree };
/* END - Rocket auto generated - do not touch */

import { html } from 'lit-html';

export const layout = data => html`
  <html>
    <head></head>
    <body>
      <p>A FULLY custom layout</p>
      ${data.content()}
      <a href="../index.rocket.md">Go back to Guides</a>
    </body>
  </html>
`;
```

# Custom Layout

Here is my markdown content.
