/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'opengraph.rocket.js';
import { html, setupUnifiedPlugins, components, openGraphLayout } from './recursive.data.js';
export { html, setupUnifiedPlugins, components, openGraphLayout };
/* END - Rocket auto generated - do not touch */

import { pageTree } from '#pageTree';

export const menuExclude = true;

const pages = pageTree.all().map(node => ({
  url: node.model.url,
  sourceRelativeFilePath: node.model.sourceRelativeFilePath,
}));

export default () => html`
  <h1>Open Graph</h1>

  <opengraph-overview
    .pages="${pages}"
    input-dir=${new URL('./', import.meta.url).pathname}
  ></opengraph-overview>
`;

export const layout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          margin: 20px;
        }
        h1 {
          text-align: center;
        }
      </style>
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
