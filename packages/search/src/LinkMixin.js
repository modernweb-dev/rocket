/* eslint-disable @typescript-eslint/ban-ts-comment */
import { dedupeMixin } from '@lion/core';

/**
 * @typedef {import('lit-element').PropertyValues } changedProperties
 */

/**
 * Designed for webcomponents that need to behave like a link.
 * For instance, comboboxes that have search result options opening a webpage on click.
 * Using an <a> is not a viable alternative, because:
 * - no shadow dom (and thus no style encapsulation possibilities)
 * - we need to extend from LionOption (and we cannot put the anchor inside
 * the focusable element (LionOption which has [role=option]))
 */
// @ts-ignore
const LinkMixinImplementation = superclass =>
  class extends superclass {
    static get properties() {
      return {
        href: String,
        target: String,
      };
    }

    constructor() {
      super();
      this._nativeAnchor = document.createElement('a');
    }

    connectedCallback() {
      super.connectedCallback();
      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'link');
      }
    }

    /** @param {import('lit-element').PropertyValues } changedProperties */
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      this.addEventListener('click', this.__navigate);

      this.addEventListener(
        'keydown',
        /** @param {{ key: string }} options */
        ({ key }) => {
          if (key === ' ' || key === 'Enter') {
            this.__navigate();
          }
        },
      );
    }

    /** @param {import('lit-element').PropertyValues } changedProperties */
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('href')) {
        this._nativeAnchor.href = this.href;
      }
      if (changedProperties.has('target')) {
        this._nativeAnchor.target = this.target;
      }
      if (changedProperties.has('rel')) {
        this._nativeAnchor.rel = this.rel;
      }
    }

    __navigate() {
      this._nativeAnchor.click();
    }
  };
export const LinkMixin = dedupeMixin(LinkMixinImplementation);
