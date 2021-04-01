/**
 * Debounce a function
 * @template {(this: any, ...args: any[]) => void} T
 * @param  {T}       func      function
 * @param  {number}  wait      time in milliseconds to debounce
 * @param  {boolean} immediate when true, run immediately and on the leading edge
 * @return {T}                 debounced function
 */
function debounce(func, wait, immediate) {
  /** @type {number|undefined} */
  let timeout;
  return /** @type {typeof func}*/ (function () {
    let args = /** @type {Parameters<typeof func>} */ (/** @type {unknown}*/ (arguments));
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  });
}

/**
 * @typedef {object} NavigationListItem
 * @property {HTMLElement} headline
 * @property {HTMLAnchorElement} anchor
 * @property {number} top
 */

/**
 * @element rocket-navigation
 * @attr {Boolean} no-redirects - if set, will not redirect to first child of nav category when clicking on category header.
 */
export class RocketNavigation extends HTMLElement {
  constructor() {
    super();
    /** @type NavigationListItem[] */
    this.list = [];
    this.__clickHandler = this.__clickHandler.bind(this);
    this.__scrollHandler = debounce(this.__scrollHandler.bind(this), 25, true);
    this.__isSetup = false;
  }

  connectedCallback() {
    if (this.__isSetup) {
      return;
    }
    this.__isSetup = true;

    this.addEventListener('click', this.__clickHandler);

    const anchors = /** @type {NodeListOf<HTMLAnchorElement>} */ (this.querySelectorAll(
      'li.current a.anchor',
    ));

    for (const anchor of anchors) {
      const headline = document.getElementById(anchor.hash.substring(1));
      if (headline) {
        this.list.push({
          top: headline.getBoundingClientRect().top,
          headline,
          anchor,
        });
      }
    }

    window.addEventListener('scroll', this.__scrollHandler, { passive: true });

    this.__scrollHandler();
  }

  /**
   * @param  {Event} ev
   */
  __clickHandler(ev) {
    const el = /** @type {HTMLElement} */ (ev.target);
    if (el.classList.contains('anchor')) {
      const anchor =
        el instanceof HTMLAnchorElement
          ? el
          : /** @type{HTMLAnchorElement} */ (el.querySelector('a.anchor'));
      ev.preventDefault();
      this.dispatchEvent(new Event('close-overlay', { bubbles: true }));
      // wait for closing animation to finish before start scrolling
      setTimeout(() => {
        const parsedUrl = new URL(anchor.href);
        document.location.hash = parsedUrl.hash;
      }, 250);
    }
    if (!this.hasAttribute('no-redirects')) {
      const links = el.parentElement?.querySelectorAll('ul a');
      if (links && links.length > 1) {
        const subLink = /** @type {HTMLAnchorElement} */ (links[1]);
        if (!subLink.classList.contains('anchor')) {
          ev.preventDefault();
          subLink.click();
        }
      }
    }
  }

  __scrollHandler() {
    for (const listObj of this.list) {
      listObj.top = listObj.headline.getBoundingClientRect().top;
    }

    const sorted = this.list.sort((a, b) => Math.abs(a.top) - Math.abs(b.top));

    for (let i = 0; i < sorted.length; i += 1) {
      if (i === 0) {
        sorted[0]?.anchor?.parentElement?.classList.add('current');
      } else {
        sorted[i]?.anchor?.parentElement?.classList.remove('current');
      }
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.__scrollHandler);
  }
}
