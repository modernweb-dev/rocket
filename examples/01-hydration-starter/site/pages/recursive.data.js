import { html } from 'lit';

export { html };

export const components = {
  'hello-wave': '#components/HelloWave.js::HelloWave',
  'hello-typer': '#components/HelloTyper.js::HelloTyper',
  'my-counter': '#components/MyCounter.js::MyCounter',
  //             👆 we are using a private import defined in the package json that maps
  //             "#components/*": "./site/src/components/*"
  //             (see https://nodejs.org/api/packages.html#packages_imports)
};

export const layout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
