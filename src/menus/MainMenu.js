import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

export class MainMenu extends LitElement {
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
      return;
    }
    return html`<ul>
      ${this.pageTree.children.map(page => this.list(page, 1))}
    </ul>`;
  }

  /**
   * @param {import('@rocket/js/types.js').PageTree} page
   * @param {number} depth
   * @returns {import('lit').TemplateResult}
   */
  list(page, depth = 0) {
    const title = page.linkText;
    /** @type {any} */
    const classes = { current: page.url === this.currentPath };
    const level = `lvl-${depth}`;
    classes[level] = true;
    return html`
      <li>
        <a href=${ifDefined(page.menuNoLink ? undefined : page.url)} class=${classMap(classes)}
          >${title}</a
        >
        ${page.children.length > 0
          ? html`<ul>
              ${page.children.map(child => this.list(child, depth + 1))}
            </ul>`
          : ''}
      </li>
    `;
  }

  static styles = css`
    a[href] {
      color: var(--link-color);
    }
  `;
}
