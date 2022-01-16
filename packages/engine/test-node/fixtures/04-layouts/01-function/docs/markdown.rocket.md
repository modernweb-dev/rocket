```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'markdown.rocket.md';
import { layout, title, titleFn } from './local.data.js';
export { layout, title, titleFn };
/* END - Rocket auto generated - do not touch */

import { members } from './members.js';
import { html } from 'lit-html';

const now = '2022-03-03 13:20';

const list = html`
  <ul>
    ${members.map(
      member => html`<li>
        <p>${member}</p>
      </li>`,
    )}
  </ul>
`;
```

# Welcome Members:

${list}

Generated on ${now}
