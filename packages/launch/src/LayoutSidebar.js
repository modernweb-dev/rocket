/* eslint-disable @typescript-eslint/ban-ts-comment */
import { renderJoiningGroup, TableOfContentsMenu } from '@rocket/engine';
import { html } from 'lit';
import { LayoutMain } from './LayoutMain.js';

export class LayoutSidebar extends LayoutMain {
  renderContent() {
    return html`
      <content-area>
        <main-docs>
          <nav slot="menu">${renderJoiningGroup('sidebar', this.options, this.data)}</nav>
          <main class="markdown-body">
            ${renderJoiningGroup('content', this.options, this.data)}
          </main>
          <aside slot="toc">
            ${this.options.pageTree.renderMenu(
              new TableOfContentsMenu(),
              this.data.sourceRelativeFilePath,
            )}
          </aside>
        </main-docs>
      </content-area>
    `;
  }
}
