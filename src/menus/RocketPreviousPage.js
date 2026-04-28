import { LitElement, nothing } from 'lit';
import {
  pageNavigationStyles,
  previousPageNode,
  renderPageNavigationCard,
} from './pageNavigation.js';

export class RocketPreviousPage extends LitElement {
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
    return renderPageNavigationCard(previousPageNode(this.pageTree, this.currentPath), 'previous');
  }
  static styles = pageNavigationStyles;
}
