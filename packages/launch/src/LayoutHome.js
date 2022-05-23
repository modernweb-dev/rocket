/* eslint-disable @typescript-eslint/ban-ts-comment */
import { renderJoiningGroup } from '@rocket/engine';
import { html, nothing } from 'lit';
import { LayoutSidebar } from './LayoutSidebar.js';

export class LayoutHome extends LayoutSidebar {
  /** @type {import('../types/layout.js').LayoutHomeOptions} */
  options = {
    ...this.options,
    header__60: () =>
      html`
        ${this.options.socialLinks.map(
          socialLink => html`
            <rocket-social-link
              dark-background
              url="${socialLink.url}"
              name="${socialLink.name}"
              siteName=${this.options.siteName}
              slot="social"
            ></rocket-social-link>
          `,
        )}
      `,
    content__600: () => nothing,
    content__650: () => nothing,
  };

  renderHeader() {
    return html`
      <rocket-header hide-logo no-background not-sticky dark-background>
        ${renderJoiningGroup('header', this.options, this.data)}
        <rocket-drawer slot="mobile-menu" loading="hydrate:onMedia('(max-width: 1024px)')">
          <div class="drawer">${renderJoiningGroup('drawer', this.options, this.data)}</div>
        </rocket-drawer>
      </rocket-header>
    `;
  }

  renderContent() {
    return html` <main>${renderJoiningGroup('content', this.options, this.data)}</main> `;
  }
}
