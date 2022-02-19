/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html } from './recursive.data.js';
export { html };
/* END - Rocket auto generated - do not touch */

import { baseHead } from '../src/parts/baseHead.js';
import { blogHeader } from '../src/parts/blog-header.js';

export const title = 'Example Blog';
export const description = 'The perfect starter for your perfect blog.';
export const permalink = 'https://example.com/';

export default () => html`
  <html lang="en">
    <head>
      ${baseHead({ title, description, permalink })}
      <style>
        header {
          width: 100%;
          height: 100%;
          background-color: var(--theme-bg-offset);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content {
          margin-top: 4rem;
          margin-bottom: 8rem;
        }

        .content :global(main > * + *) {
          margin-top: 1rem;
        }

        .intro {
          padding-bottom: 4rem;
          margin-bottom: 2rem;
          border-bottom: 4px solid var(--theme-divider);
        }

        .intro > * {
          margin: 0;
        }

        .latest {
          font-size: 2.5rem;
          font-weight: 700;
        }
      </style>
    </head>

    <body>
      ${blogHeader()}
      <div class="wrapper">
        <main class="content">
          <section class="intro">
            <h1 class="latest">${title}</h1>
            <p>${description}</p>
          </section>
          <section aria-label="Blog post list"></section>
        </main>
      </div>
    </body>
  </html>
`;
