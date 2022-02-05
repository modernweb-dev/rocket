import { renderJoiningGroup, html } from '@rocket/engine';
import { LayoutSidebar } from './LayoutSidebar.js';

import { nothing } from 'lit';

export class LayoutHome extends LayoutSidebar {
  constructor(options) {
    super(options);

    // set it in two passes so we can us the values above in the templates
    this.setGlobalOptions({
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

      header__20_mobile_trigger: nothing,

      content__600_previous_next: nothing,
      content__650_edit: nothing,
    });
  }

  renderContent() {
    this.setGlobalOptions({
      bodyLayout: this.options.background ? 'layout-home-background' : 'layout-home',
    });

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
