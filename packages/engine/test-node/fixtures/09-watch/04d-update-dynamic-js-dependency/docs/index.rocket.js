/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
/* END - Rocket auto generated - do not touch */

export const name = await import('./name.js').then(res => res.name);

import { html } from 'lit';
export default () => html`name: "${name}"`;
