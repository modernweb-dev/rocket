import { renderJoiningGroup } from '../helpers/renderJoiningGroup.js';
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

/** @typedef {import('lit').TemplateResult} TemplateResult */

export class Layout {
  /**
   * Options for this layout.
   *
   * ⚠️ changes effect all following pages using this layout
   * => mostly useful in recursive.data.js and local.data.js files
   *
   * If you want to change only the current page, use `setPageOptions`
   *
   * Example: append html to content only for this page
   * @example
   * layout.setPageOptions(sourceRelativeFilePath,
   *   {
   *     content__510: html`
   *       <p>appended only on this page</p>
   *     `
   *   }
   * );
   *
   * @type {import('../../types/layout.js').LayoutOptions} */
  options = {
    lang: 'en-US',
    bodyClasses: {},
    bodyLayout: 'layout',
    dsdPending: false,
    content__500: html``,
  };

  /** @type {import('../../types/layout.js').renderData} */
  data = {
    sourceFilePath: '',
    outputFilePath: '',
    sourceRelativeFilePath: '',
    outputRelativeFilePath: '',
    url: '',
    renderMode: '',
    openGraphOutputFilePath: '',
    openGraphOutputRelativeFilePath: '',
    openGraphUrl: '',
    content: '',
  };

  constructor(options = {}) {
    this.options = { ...this.options, ...options };
    this.pageOptions = new Map();
  }

  /**
   * @param {string} sourceRelativeFilePath
   * @param {Partial<import('../../types/layout.js').LayoutOptions>} options
   */
  setPageOptions(sourceRelativeFilePath, options) {
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
      <header id="main-header">${renderJoiningGroup('header', this.options, this.data)}</header>
    `;
  }

  renderFooter() {
    return html`
      <footer id="main-footer">${renderJoiningGroup('footer', this.options, this.data)}</footer>
    `;
  }

  renderBody() {
    return html`
      <body-server-only
        class=${classMap(this.options.bodyClasses)}
        layout="${this.options.bodyLayout}"
        ?dsd-pending=${this.options.dsdPending}
      >
        ${renderJoiningGroup('top', this.options, this.data)} ${this.renderHeader()}
        ${this.renderContent()} ${this.renderFooter()}
        ${renderJoiningGroup('bottom', this.options, this.data)}
      </body-server-only>
    `;
  }

  renderContent() {
    return html`<main>${renderJoiningGroup('content', this.options, this.data)}</main>`;
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
   * @param {import('../../types/layout.js').renderData} data
   * @returns {TemplateResult}
   */
  render(data) {
    this.data = data;
    this.options.content__500 = data.content;

    const originalOptions = { ...this.options };
    if (this.pageOptions.has(data.sourceRelativeFilePath)) {
      this.options = { ...this.options, ...this.pageOptions.get(data.sourceRelativeFilePath) };
    }

    const output = this.renderHtml();

    this.options = originalOptions;
    return output;
  }

  getCurrentPage() {
    if (this.options.pageTree) {
      return this.options.pageTree.getPage(this.data.sourceRelativeFilePath);
    }
  }

  getCurrentPageData() {
    const current = this.getCurrentPage();
    if (current) {
      return current.model;
    }
  }
}
