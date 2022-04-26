import { html } from 'lit';

export { html };

export const layout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>Rocket</title>
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
