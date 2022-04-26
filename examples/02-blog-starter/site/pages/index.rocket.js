/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, components } from './recursive.data.js';
export { html, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('blog-header', await import('rocket-blog-starter/components/BlogHeader').then(m => m.BlogHeader));
  // prettier-ignore
  customElements.define('blog-post-preview', await import('rocket-blog-starter/components/BlogPostPreview').then(m => m.BlogPostPreview));
  // prettier-ignore
  customElements.define('site-footer', await import('rocket-blog-starter/components/SiteFooter').then(m => m.SiteFooter));
}
/* END - Rocket auto generated - do not touch */

export const layout = false;

import { PageTree } from '@rocket/engine';
import { nothing } from 'lit';
import { baseHead } from '../src/parts/baseHead.js';

export const title = 'Example Blog';
export const description = 'The perfect starter for your perfect blog.';
export const permalink = 'https://example.com/';

export const pageTree = new PageTree();
await pageTree.restore(new URL('./pageTreeData.rocketGenerated.json', import.meta.url));

class BlogMenu {
  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode || !this.currentNode.children) {
      return nothing;
    }
    return html`
      <div>
        ${this.currentNode.children.map(
          /** @param {NodeOfPage} child */ child => html`
            <blog-post-preview .post=${child.model}></blog-post-preview>
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
      <blog-header></blog-header>
      <div class="wrapper">
        <main class="content">
          <section class="intro">
            <h1 class="latest">${title}</h1>
            <p>${description}</p>
          </section>
          <section aria-label="Blog post list">
            ${pageTree.renderMenu(new BlogMenu(), 'blog/index.rocket.js')}
          </section>
        </main>
      </div>
      <site-footer></site-footer>
    </body>
  </html>
`;
