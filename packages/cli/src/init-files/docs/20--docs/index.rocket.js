/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/index.rocket.js';
import { pageTree, layout, html } from '../recursive.data.js';
export { pageTree, layout, html };
/* END - Rocket auto generated - do not touch */

import { ChildListMenu } from "@rocket/engine";

export default () => html`
  <meta name="menu:link.text" content="Docs" />

  <h1>Documentation</h1>

  <p>
    Here you will find all the details for each of the packages/systems we
    offer.
  </p>
  ${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}
`;
