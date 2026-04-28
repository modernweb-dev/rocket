import { LitElement, nothing } from 'lit';
import { nextPageNode, pageNavigationStyles, renderPageNavigationCard } from './pageNavigation.js';

export class RocketNextPage extends LitElement {
  static properties = {
    pageTree: { type: Array },
    currentPath: { type: String },
  };

  constructor() {
    super();
    /** @type {import('@rocket/js/types.js').PageTree} */
    // @ts-ignore
    this.pageTree = undefined;
    this.currentPath = '';
  }

  render() {
    if (!this.pageTree) {
      return nothing;
    }
    return renderPageNavigationCard(nextPageNode(this.pageTree, this.currentPath), 'next');
  }
  static styles = pageNavigationStyles;
}
