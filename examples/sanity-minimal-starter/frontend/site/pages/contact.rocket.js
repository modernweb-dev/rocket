/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'contact.rocket.js';
import { html, baseHead, getSanityImageURL } from './recursive.data.js';
export { html, baseHead, getSanityImageURL };
/* END - Rocket auto generated - do not touch */

export const title = 'Contact Page';
export const description = 'This is the contact page';
export const permalink = `/contact/`;

export default () => html`
  <html lang="en">
    <head>
      ${baseHead({ title, description, permalink })}
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
        }
        main {
          margin: 0 auto;
          padding: 1rem;
          max-width: 960px;
        }
      </style>
    </head>
    <body>
      <main>
        <div>
          <h1>Contact Page</h1>
        </div>
      </main>
    </body>
  </html>
`;
