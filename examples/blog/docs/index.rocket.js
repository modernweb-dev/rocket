/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html } from './recursive.data.js';
export { html };
/* END - Rocket auto generated - do not touch */

import { PageTree, Menu, nothing } from '@rocket/engine';

import { baseHead } from '../src/parts/baseHead.js';
import { blogHeader } from '../src/parts/blog-header.js';

export const title = 'Example Blog';
export const description = 'The perfect starter for your perfect blog.';
export const permalink = 'https://example.com/';

export const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../_site', import.meta.url),
});
await pageTree.restore();

class BlogMenu extends Menu {
  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  renderDescription(node) {
    if (node.model.subHeading) {
      return html`
        <div class="description">
          <a href="${node.model.url}" tabindex="-1">
            <p>${node.model.subHeading}</p>
          </a>
        </div>
      `;
    }
    return nothing;
  }

  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    // console.log(this.currentNode);
    if (!this.currentNode || !this.currentNode.children) {
      return nothing;
    }
    console.log('do', this.currentNode.children);
    return html`
      <div>
        ${this.currentNode.children.map(
          /** @param {NodeOfPage} child */ child => html`
            <article class="post">
              <a href="${child.model.url}">
                <h2>${child.model.name}</h2>
              </a>
              ${this.renderDescription(child)}
            </article>
          `,
        )}
      </div>
    `;
  }
}


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
          <section aria-label="Blog post list">
            ${pageTree.renderMenu(new BlogMenu(), 'posts/index.rocket.js')}
          </section>
        </main>
      </div>
    </body>
  </html>
`;
