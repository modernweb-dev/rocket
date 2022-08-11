/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LitElement, html, nothing } from 'lit';
import { LaunchBlogPreview } from './LaunchBlogPreview.js';

/** @typedef {import('@rocket/engine').NodeOfPage} NodeOfPage */

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
  /** @type {NodeOfPage | undefined} */
  currentNode = undefined;

  /**
   * @returns {import('lit').TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode || !this.currentNode.children) {
      return nothing;
    }
    return html`
      <div>
        ${this.currentNode.children
          // @ts-ignore
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

// we do this for the sake of SSR - as there is no way yet to define them as sub-components (should be possible in the future via scoped registry)
if (customElements.get('launch-blog-preview') === undefined) {
  customElements.define('launch-blog-preview', LaunchBlogPreview);
}

export class LaunchBlogOverview extends LitElement {
  /** @type {import('@rocket/engine').PageTree | undefined} */
  pageTree = undefined;

  sourceRelativeFilePath = '';

  render() {
    if (!this.pageTree) {
      return nothing;
    }
    return html`${this.pageTree.renderMenu(new BlogMenu(), this.sourceRelativeFilePath)}`;
  }
}
