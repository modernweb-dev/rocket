import { LitElement, html, nothing } from 'lit';
import { LaunchBlogPreview } from './LaunchBlogPreview.js';

/**
 * @param {{ model: { publishDate: Date }}} a
 * @param {{ model: { publishDate: Date }}} b
 * @returns {number}
 */
function sortByPublishDate(a, b) {
  if (a.model.publishDate < b.model.publishDate) {
    return 1;
  }
  if (a.model.publishDate > b.model.publishDate) {
    return -1;
  }
  return 0;
}

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
        ${this.currentNode.children
          .sort(sortByPublishDate)
          .map(
            /** @param {NodeOfPage} child */ child => html`
              <launch-blog-preview .post=${child.model}></launch-blog-preview>
            `,
          )}
      </div>
    `;
  }
}

if (customElements.get('launch-blog-preview') === undefined) {
  customElements.define('launch-blog-preview', LaunchBlogPreview);
}

export class LaunchBlogOverview extends LitElement {
  render() {
    return html` ${this.pageTree.renderMenu(new BlogMenu(), this.sourceRelativeFilePath)} `;
  }
}
