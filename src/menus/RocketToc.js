import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

export class RocketToc extends LitElement {
  static properties = {
    toc: { type: Object },
    activeId: { state: true },
  };

  constructor() {
    super();
    /** @type {import('@rocket/js/types.js').TableOfContents | undefined} */
    this.toc = undefined;
    /** @type {string | undefined} */
    this.activeId = undefined;
    /** @type {HTMLElement[]} */
    this.headingElements = [];
    /** @type {IntersectionObserver | undefined} */
    this.sectionObserver = undefined;
    /** @type {number | undefined} */
    this.activeHeadingFrame = undefined;
    this.handleActiveHeadingChange = () => this.scheduleActiveHeadingUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.teardownScrollSpy();
  }

  /**
   * @param {Map<PropertyKey, unknown>} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has('toc')) {
      this.activeId = undefined;
      this.setupScrollSpy();
    }
  }

  render() {
    if (!this.toc || !this.toc.children || this.toc.children.length === 0) {
      return html``;
    }
    return html`<h2>Contents</h2>
      <ol id="root-list">
        ${this.toc.children.map((headline, index) => this.list(headline, 2, index === 0))}
      </ol>`;
  }

  /**
   * @param {import('@rocket/js/types.js').HeadlineTree} headline
   * @param {number} depth
   * @param {boolean} current
   * @returns {import('lit').TemplateResult}
   */
  list(headline, depth = 0, current = false) {
    const isCurrent = this.activeId ? headline.id === this.activeId : current;
    /** @type {Record<string, boolean>} */
    const classes = { current: isCurrent };
    classes[`lvl-${depth}`] = true;
    return html`
      <li>
        <a
          href=${'#' + headline.id}
          class=${classMap(classes)}
          aria-current=${ifDefined(isCurrent ? 'location' : undefined)}
        >
          ${headline.text}
        </a>
        ${headline.children.length > 0
          ? html`<ol>
              ${headline.children.map(child => this.list(child, depth + 1))}
            </ol>`
          : html``}
      </li>
    `;
  }

  setupScrollSpy() {
    this.teardownScrollSpy();

    if (typeof document === 'undefined') {
      return;
    }

    this.headingElements = this.getHeadingElements();
    if (this.headingElements.length === 0) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', this.handleActiveHeadingChange);
      window.addEventListener('resize', this.handleActiveHeadingChange);
      window.addEventListener('scroll', this.handleActiveHeadingChange, { passive: true });
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.updateActiveHeading();
      return;
    }

    this.sectionObserver = new IntersectionObserver(this.handleActiveHeadingChange, {
      rootMargin: '-25% 0px -70% 0px',
      threshold: 0,
    });
    for (const heading of this.headingElements) {
      this.sectionObserver.observe(heading);
    }
    this.scheduleActiveHeadingUpdate();
  }

  teardownScrollSpy() {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = undefined;
    }
    if (this.activeHeadingFrame !== undefined && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.activeHeadingFrame);
      this.activeHeadingFrame = undefined;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', this.handleActiveHeadingChange);
      window.removeEventListener('resize', this.handleActiveHeadingChange);
      window.removeEventListener('scroll', this.handleActiveHeadingChange);
    }
    this.headingElements = [];
  }

  scheduleActiveHeadingUpdate() {
    if (this.activeHeadingFrame !== undefined) {
      return;
    }

    const update = () => {
      this.activeHeadingFrame = undefined;
      this.updateActiveHeading();
    };

    if (typeof requestAnimationFrame === 'function') {
      this.activeHeadingFrame = requestAnimationFrame(update);
    } else {
      this.activeHeadingFrame = 0;
      Promise.resolve().then(update);
    }
  }

  updateActiveHeading() {
    const nextActiveId = this.findActiveHeadingId();
    if (nextActiveId && nextActiveId !== this.activeId) {
      this.activeId = nextActiveId;
    }
  }

  /**
   * @returns {string | undefined}
   */
  findActiveHeadingId() {
    const firstHeading = this.headingElements[0];
    if (!firstHeading) {
      return undefined;
    }
    if (this.isAtScrollEnd()) {
      return this.headingElements.at(-1)?.id;
    }

    const activationOffset = this.getActivationOffset();
    let activeId = firstHeading.id;
    for (const heading of this.headingElements) {
      if (heading.getBoundingClientRect().top <= activationOffset) {
        activeId = heading.id;
      } else {
        break;
      }
    }
    return activeId;
  }

  isAtScrollEnd() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return false;
    }
    const scrollingElement = document.scrollingElement || document.documentElement;
    return (
      scrollingElement.scrollHeight > scrollingElement.clientHeight &&
      window.scrollY + window.innerHeight >= scrollingElement.scrollHeight - 1
    );
  }

  getActivationOffset() {
    if (typeof window === 'undefined') {
      return 0;
    }
    return Math.max(80, Math.min(window.innerHeight * 0.25, 160));
  }

  /**
   * @returns {HTMLElement[]}
   */
  getHeadingElements() {
    return this.getHeadlines()
      .map(headline => document.getElementById(headline.id))
      .filter(element => element instanceof HTMLElement);
  }

  /**
   * @returns {import('@rocket/js/types.js').HeadlineTree[]}
   */
  getHeadlines() {
    if (!this.toc || !this.toc.children) {
      return [];
    }
    return flattenHeadlines(this.toc.children);
  }

  static styles = css`
    :host {
      display: block;
      --rocket-toc-label-color: #8a96a8;
      --rocket-toc-text-color: var(--primary-text-color);
      --rocket-toc-hover-color: var(--primary-text-color);
      --rocket-toc-active-color: var(--primary-color);
    }

    h2 {
      margin: 0 0 1.2rem;
      color: var(--rocket-toc-label-color);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.075em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    ol {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }

    ol ol {
      margin-top: 0.15rem;
    }

    #root-list {
      padding-left: 0;
    }

    li {
      margin: 0;
      padding: 0;
    }

    a {
      position: relative;
      display: block;
      padding: 0.45rem 0 0.45rem 0.85rem;
      border-left: 1px solid transparent;
      color: var(--rocket-toc-text-color);
      font-size: 0.88rem;
      font-weight: 500;
      line-height: 1.45;
      text-decoration: none;
      transition:
        border-color 0.2s ease,
        color 0.2s ease;
    }

    a:hover {
      color: var(--rocket-toc-hover-color);
    }

    a.current {
      color: var(--rocket-toc-active-color);
      font-weight: 700;
    }

    a.current::before {
      position: absolute;
      top: 0.55rem;
      bottom: 0.55rem;
      left: 0;
      width: 3px;
      border-radius: 999px;
      background: var(--rocket-toc-active-color);
      content: '';
    }

    .lvl-3 {
      padding-left: 1.45rem;
      font-size: 0.82rem;
    }

    .lvl-4,
    .lvl-5,
    .lvl-6 {
      padding-left: 2rem;
      font-size: 0.8rem;
    }
  `;
}

/**
 * @param {import('@rocket/js/types.js').HeadlineTree[]} headlines
 * @returns {import('@rocket/js/types.js').HeadlineTree[]}
 */
function flattenHeadlines(headlines) {
  return headlines.flatMap(headline => [headline, ...flattenHeadlines(headline.children)]);
}
