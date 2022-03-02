import { html } from 'lit';

function defaultLayout(data) {
  return html`<!DOCTYPE html>
    <html>
      <head>
        <title-server-only>${data.titleFn(data)}</title-server-only>
      </head>
      <body>
        ${data.content(data)}
      </body>
    </html>`;
}

export const layout = defaultLayout;

export const title = 'Fixed Title';
export const titleFn = data => `${data.title} | Rocket`;
