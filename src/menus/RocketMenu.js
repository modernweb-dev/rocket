import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

export class RocketMenu extends LitElement {
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
    return html`<ul class="menu-list">
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
    const isCurrent = page.url === this.currentPath;
    const isSection = depth === 1;
    /** @type {any} */
    const classes = {
      current: isCurrent,
      section: isSection,
      'no-link': page.menuNoLink,
      'nav-link': !isSection,
    };
    const level = `lvl-${depth}`;
    classes[level] = true;
    const itemClasses = { 'section-item': isSection };

    return html`
      <li class=${classMap(itemClasses)}>
        ${page.menuNoLink
          ? html`<span class=${classMap(classes)}>${title}</span>`
          : html`<a
              href=${ifDefined(page.url)}
              class=${classMap(classes)}
              aria-current=${ifDefined(isCurrent ? 'page' : undefined)}
              >${page.iconName
                ? html`<rocket-icon
                    class="nav-icon"
                    name=${page.iconName}
                    aria-hidden="true"
                  ></rocket-icon>`
                : ''}<span class="nav-text">${title}</span></a
            >`}
        ${page.children.length > 0
          ? html`<ul>
              ${page.children.map(child => this.list(child, depth + 1))}
            </ul>`
          : ''}
      </li>
    `;
  }

  static styles = css`
    :host {
      display: block;
      --rocket-menu-heading-color: var(--primary-color);
      --rocket-menu-text-color: var(--primary-text-color);
      --rocket-menu-hover-text-color: var(--primary-text-color);
      --rocket-menu-hover-background: #ffffff;
      --rocket-menu-active-background: #fff0f0;
      --rocket-menu-active-color: var(--primary-color);
    }

    a,
    span {
      text-decoration: none;
      user-select: none;
    }

    * {
      box-sizing: border-box;
    }

    ul {
      padding: 0;
      margin: 0;
      list-style-type: none;
    }

    :host > .menu-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
    }

    li {
      margin: 0;
      padding: 0;
    }

    li > ul {
      display: grid;
      gap: 0.125rem;
      margin-top: 0.4rem;
    }

    .section {
      display: block;
      padding: 0 0.6rem;
      color: var(--rocket-menu-heading-color);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .nav-link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.7rem;
      min-height: 2.35rem;
      padding: 0.45rem 0.75rem 0.45rem 0.95rem;
      border-radius: 9px;
      color: var(--rocket-menu-text-color);
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.25;
      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .nav-link:hover {
      color: var(--rocket-menu-hover-text-color);
      background: var(--rocket-menu-hover-background);
    }

    .nav-link.current {
      color: var(--rocket-menu-active-color);
      font-weight: 700;
      background: var(--rocket-menu-active-background);
      box-shadow: inset 0 0 0 1px hsl(358 88% 47% / 7%);
    }

    .nav-link:focus-visible {
      outline: 2px solid hsl(358 88% 47% / 45%);
      outline-offset: 2px;
    }

    .nav-text {
      min-width: 0;
    }

    rocket-icon.nav-icon {
      width: 1rem;
      height: 1rem;
      flex: 0 0 1rem;
      color: currentColor;
    }

    .nav-link.current::before {
      position: absolute;
      top: 0.45rem;
      bottom: 0.45rem;
      left: 0.35rem;
      width: 3px;
      border-radius: 999px;
      background: var(--rocket-menu-active-color);
      content: '';
    }

    .lvl-3 {
      margin-left: 0.7rem;
      font-size: 0.84rem;
    }
  `;
}
