import { renderJoiningGroup, html } from '@rocket/engine';
import { LayoutSidebar } from './LayoutSidebar.js';

import { nothing } from 'lit';

export class LayoutHome extends LayoutSidebar {
   /** @type {import('../types/layout.js').LayoutHomeOptions} */
  options = {
    ...this.options,
    background: '',
    bodyLayout: 'layout-home-background',
    content__10: () => {
      return html`
        <img class="page-logo" src="${this.options.logoSrc}" alt="${this.options.logoAlt}" />

        ${this.options.background
          ? html`
              <img class="page-background" src="${this.options.background}" role="presentation" />
            `
          : nothing}

        <h1 class="page-title">${this.options.siteName}</h1>

        <p class="page-slogan">${this.options.slogan}</p>

        <div class="call-to-action-list" role="list">
          ${this.options.callToActionItems.map(
            callToAction => html`
              <a class="call-to-action" href="${callToAction.href}" role="listitem"
                >${callToAction.text}</a
              >
            `,
          )}
        </div>

        <h2 class="reason-header">${this.options.reasonHeader}</h2>

        <section class="reasons">
          ${this.options.reasons.map(
            reason => html`
              <article>
                <h3>${reason.header}</h3>
                ${reason.text}
              </article>
            `,
          )}
        </section>
      `;
    },

    header__20: () => nothing,

    content__600: () => nothing,
    content__650: () => nothing,
  };

  /**
   * @param {import('../types/layout.js').LayoutHomeOptions} options 
   */
  constructor(options) {
    super(options);
    this.options = { ...this.options, ...options };
  }

  renderContent() {
    this.options.bodyLayout = this.options.background ? 'layout-home-background' : 'layout-home';

    return html`
      <div id="content-wrapper">
        <div class="content-area">
          <main class="markdown-body">
            ${renderJoiningGroup('content', this.options, this.data)}
          </main>
        </div>
      </div>
    `;
  }
}
