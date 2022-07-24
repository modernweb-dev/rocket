/* eslint-disable @typescript-eslint/ban-ts-comment */
import { renderJoiningGroup } from '@rocket/engine';
import { html, nothing } from 'lit';
import { LayoutMain } from './LayoutMain.js';

export class LayoutHome extends LayoutMain {
  /** @type {import('../types/layout.js').LayoutHomeOptions} */
  options = {
    ...this.options,
    header__60: () =>
      html`
        ${this.options.socialLinks.map(
          socialLink => html`
            <rocket-social-link
              ?dark-background=${this.options.headerDarkBackground}
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
    headerHideLogo: true,
    headerNoBackground: true,
    headerNotSticky: true,
    headerDarkBackground: true,
  };

  /**
   * @param {import('../types/layout.js').LayoutHomeOptions} options
   */
  constructor(options) {
    super(options);
    this.options = { ...this.options, ...options };
  }

  renderContent() {
    return html` <main>${renderJoiningGroup('content', this.options, this.data)}</main> `;
  }
}
