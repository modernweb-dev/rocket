/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { layout, title, titleFn } from './local.data.js';
export { layout, title, titleFn };
/* END - Rocket auto generated - do not touch */

import { html } from 'lit-html';
import { members } from './members.js';

const now = '2022-03-03 13:20';

export default () => html`<h1 id="welcome-members">
    <a aria-hidden="true" tabindex="-1" href="#welcome-members"
      ><span class="icon icon-link"></span></a
    >Welcome Members:
  </h1>

  <ul>
    ${members.map(
      member =>
        html`<li>
          <p>${member}</p>
        </li>`,
    )}
  </ul>

  <p>Generated on ${now}</p>`;
