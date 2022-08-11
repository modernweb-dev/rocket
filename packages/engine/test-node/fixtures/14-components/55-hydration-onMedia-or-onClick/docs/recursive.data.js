import { html } from 'lit';
export { html };

export const components = {
  'my-el': '@test/components::MyEl',
};

export const layout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <body>
      ${data.content()}
    </body>
  </html>
`;
