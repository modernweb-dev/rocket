/* eslint-disable @typescript-eslint/ban-ts-comment */
import { renderJoiningGroup } from '../helpers/renderJoiningGroup.js';
import { html } from 'lit-html';
import { classMap } from 'lit/directives/class-map.js';

/** @typedef {import('lit').TemplateResult} TemplateResult */

export class Layout {
  /** @type {import('../../types/layout.js').LayoutOptions} */
  options = {
    lang: 'en-US',
    bodyClasses: {},
    bodyLayout: 'layout',
    content__500: html``,
  };

  constructor(options = {}) {
    this.setGlobalOptions(options);
    this.data = {};
    this.pageOptions = new Map();
  }

  /**
   * @param {Record<string, unknown>} options
   */
  setGlobalOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   *
   * @param {string} sourceRelativeFilePath
   * @param {import('../../types/layout.js').LayoutOptions} options
   */
  setOptions(sourceRelativeFilePath, options) {
    if (this.pageOptions.has(sourceRelativeFilePath)) {
      this.pageOptions.set(sourceRelativeFilePath, {
        ...this.pageOptions.get(sourceRelativeFilePath),
        ...options,
      });
    } else {
      this.pageOptions.set(sourceRelativeFilePath, options);
    }
  }

  renderHead() {
    return html`
      <head>
        ${renderJoiningGroup('head', this.options, this.data)}
      </head>
    `;
  }

  renderHeader() {
    return html`
      <header id="main-header">
        <div class="content-area">${renderJoiningGroup('header', this.options, this.data)}</div>
      </header>
    `;
  }

  renderFooter() {
    return html`
      <footer id="main-footer">
        <div class="content-area">${renderJoiningGroup('footer', this.options, this.data)}</div>
      </footer>
    `;
  }

  renderBody() {
    return html`
      <body-server-only
        class=${classMap(this.options.bodyClasses)}
        layout="${this.options.bodyLayout}"
      >
        ${renderJoiningGroup('top', this.options, this.data)} ${this.renderHeader()}
        ${this.renderContent()} ${this.renderFooter()}
        ${renderJoiningGroup('bottom', this.options, this.data)}
      </body-server-only>
    `;
  }

  renderContent() {
    return html`
      <div class="content-area">
        <main>${renderJoiningGroup('content', this.options, this.data)}</main>
      </div>
    `;
  }

  renderHtml() {
    return html`
      <!DOCTYPE html>
      <html-server-only lang="${this.options.lang}">
        ${this.renderHead()} ${this.renderBody()}
      </html-server-only>
    `;
  }

  /**
   * @param {Record<string, unknown>} data
   * @returns {TemplateResult}
   */
  render(data) {
    this.data = data;
    this.options.content__500 = data.content;

    const originalOptions = { ...this.options };
    if (this.pageOptions.has(data.sourceRelativeFilePath)) {
      this.setGlobalOptions(this.pageOptions.get(data.sourceRelativeFilePath));
    }

    const output = this.renderHtml();

    this.options = originalOptions;
    return output;
  }
}
