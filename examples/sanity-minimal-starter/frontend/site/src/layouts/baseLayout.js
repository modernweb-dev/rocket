import { html } from 'lit';
import { baseHead } from '../components/baseHead.js';

export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <head>
      ${baseHead(data)}
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
