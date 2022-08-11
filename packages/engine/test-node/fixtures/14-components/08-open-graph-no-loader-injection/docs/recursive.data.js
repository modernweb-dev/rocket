import { html } from 'lit';

export { html };

export const components = {
  'my-el': '@test/components::MyEl',
};

export const openGraphServerComponents = { ...components };

export const openGraphLayout = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      <my-el></my-el>
    </body>
  </html>
`;
