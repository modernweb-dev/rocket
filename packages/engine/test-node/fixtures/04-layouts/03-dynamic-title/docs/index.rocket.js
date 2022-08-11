/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
/* END - Rocket auto generated - do not touch */

import { html } from 'lit';

export const layout = data => {
  return html`
    <html>
      <head>
        <title-server-only>${data.title}</title-server-only>
      </head>
      <body>
        <h1>${data.content()}</h1>
      </body>
    </html>
  `;
};

export const title = 'My title';

export default () => 'Home';
