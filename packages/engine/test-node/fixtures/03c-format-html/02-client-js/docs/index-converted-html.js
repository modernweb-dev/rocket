/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.html';
/* END - Rocket auto generated - do not touch */
import { html } from 'lit';
export const keepConvertedFiles = true;
const rocketAutoConvertedTemplate0 = html`
  <h1>Client side JS</h1>

  <script type="module">
    console.log('test1');
  </script>
`;
const foo = html`<p>bar</p>`;
const rocketAutoConvertedTemplate1 = html`
  <script type="module" client>
    console.log('test2');
  </script>

  ${foo}
`;
export default () => html`${rocketAutoConvertedTemplate0}${rocketAutoConvertedTemplate1}`;
