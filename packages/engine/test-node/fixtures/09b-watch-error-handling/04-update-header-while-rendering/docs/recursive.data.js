import { html } from 'lit';

export { html };

export const components = {
  'hello-typer': '#c/HelloTyper.js::HelloTyper',
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
