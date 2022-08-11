import { html } from 'lit';

export { html };

export const components = {
  'my-el': '@test/components::MyEl',
  'other-el': '@test/components::OtherEl',
  'next-el': '@test/components::NextEl',
};

export const openGraphLayout = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      <other-el></other-el>
      <next-el loading="hydrate:onClick"></next-el>
    </body>
  </html>
`;
