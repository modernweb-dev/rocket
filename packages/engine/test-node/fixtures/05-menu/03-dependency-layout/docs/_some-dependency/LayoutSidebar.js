import { Layout, renderJoiningGroup, SiteMenu } from '@rocket/engine';
import { html } from 'lit';

export class LayoutSidebar extends Layout {
  constructor(options) {
    super(options);
    this.options.sidebar__20 = data =>
      this.options.pageTree.renderMenu(new SiteMenu(), data.sourceRelativeFilePath);
  }

  renderContent() {
    return html`
      <div class="content-area">
        <div id="sidebar">${renderJoiningGroup('sidebar', this.options, this.data)}</div>
        <main class="markdown-body">${renderJoiningGroup('content', this.options, this.data)}</main>
      </div>
    `;
  }
}
