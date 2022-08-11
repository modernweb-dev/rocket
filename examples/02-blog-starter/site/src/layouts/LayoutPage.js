import { html } from 'lit';
import { baseHead } from '../parts/baseHead.js';

export class LayoutPage {
  render(data) {
    const { title, description, permalink } = data;
    return html`
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
          <blog-header></blog-header>
          <div class="wrapper">
            <main class="content">
              <section class="intro">
                <h1 class="latest">${title}</h1>
                <p>${description}</p>
              </section>
              <section aria-label="Blog post list">${data.content()}</section>
            </main>
          </div>
          <site-footer></site-footer>
        </body>
      </html>
    `;
  }
}
