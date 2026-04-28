/* eslint-disable no-console */
/**
 * Modified version of https://github.com/modernweb-dev/rocket/blob/packages/engine/src/hydration/HydrationLoader.js
 * Runs on: client
 */
import { evaluate } from './evaluate.js';
import { extractStrategies } from './extractStrategies.js';

/** @typedef {{ LitElement: typeof import('lit').LitElement }} LitElementHydrateSupportOptions */
/** @typedef {(options: LitElementHydrateSupportOptions) => void} LitElementHydrateSupport */

export class HydrationLoader {
  /** @type {Record<string, {getter: () => Promise<any>, strategy: string}>} */
  components = {};

  isSetup = false;

  /** @type {import('@rocket/js/types.js').ElementWithStrategy[]}  */ elements = [];

  /** @type {{ [key: string]: MediaQueryList }} */
  mediaQueries = {};

  /**
   * @param {Record<string, {getter: () => Promise<any>, strategy: string}>} components
   */
  constructor(components) {
    this.components = components;
  }

  /**
   * @param {number} index
   * @param {object} options
   * @param {HTMLElement[]} [options.composedPath]
   * @param {Event} [options.event]
   * @returns {Promise<{ needsCleanup: boolean }>}
   */
  async checkElement(index, { composedPath, event } = {}) {
    const el = this.elements[index];
    if (el.deleteMe) {
      return { needsCleanup: true };
    }
    const allResolveAble = evaluate({
      strategyTemplate: el.strategyTemplate,
      strategies: el.strategies,
    });
    if (allResolveAble) {
      await this.setup();
      const loadFn = this.components[el.tagName].getter;
      if (loadFn) {
        const component = await loadFn();
        const existing = customElements.get(el.tagName);
        if (existing) {
          if (existing !== component) {
            console.warn(`Tried to define component '${el.tagName}', but is already defined.`);
          }
        } else {
          customElements.define(el.tagName, component);
        }
      }
      if (el.node.updateComplete) {
        await el.node.updateComplete;
      }

      for (let i = 0; i < this.elements.length; i += 1) {
        if (this.elements[i].tagName === el.tagName) {
          this.elements[i].deleteMe = true;
        }
      }

      if (composedPath && event) {
        const reDispatchEl = composedPath[0];
        if (reDispatchEl) {
          reDispatchEl.dispatchEvent(event);
        }
      }

      return { needsCleanup: true };
    }
    return { needsCleanup: false };
  }

  cleanup() {
    const length = this.elements.length - 1;
    for (let i = length; i >= 0; i--) {
      if (this.elements[i].deleteMe) {
        if (this.intersectionObserver) {
          if (this.elements[i].strategies.some(strategy => strategy.type === 'onVisible')) {
            this.intersectionObserver.unobserve(this.elements[i].node);
          }
        }
        this.elements.splice(i, 1);
      }
    }
  }

  gatherElements() {
    const els = [];
    for (const component of Object.keys(this.components)) {
      els.push(...Array.from(document.querySelectorAll(component)));
    }
    /** @type {import('@rocket/js/types.js').ElementWithStrategy[]} */
    const elements = [];
    for (const el of els) {
      const tagName = el.tagName.toLowerCase();
      const hydrationStrategy = this.components[tagName].strategy;
      if (!hydrationStrategy) {
        console.warn(`No hydration strategy found for ${tagName}`);
        continue;
      }
      const strategies = extractStrategies(hydrationStrategy);
      elements.push({
        tagName,
        node: el,
        ...strategies,
      });
    }
    return elements;
  }

  /**
   *
   * @param {Object} param1
   * @param {EventTarget} param1.target
   * @param {String} param1.strategyType
   * @param {String} [param1.strategyOptions]
   * @param {Boolean} param1.resolveAble
   * @param {Object} [options]
   */
  async setResolveAbleOn({ target, strategyType, strategyOptions, resolveAble }, options = {}) {
    let needsCleanup = false;
    const foundIndex = this.elements.findIndex(el => el.node === target && !el.deleteMe);
    if (foundIndex !== -1) {
      const element = this.elements[foundIndex];

      for (const strategy of element.strategies) {
        if (
          strategy.type === strategyType &&
          strategy.options === strategyOptions &&
          !element.deleteMe
        ) {
          strategy.resolveAble = resolveAble;

          const currentIndex = this.elements.indexOf(element);
          if (currentIndex === -1) {
            break;
          }

          ({ needsCleanup } = await this.checkElement(currentIndex, options));
        }
      }
    }
    if (needsCleanup) {
      this.cleanup();
    }
  }

  async init() {
    if (Object.keys(this.components).length === 0) {
      return;
    }
    this.elements = this.gatherElements();

    let needsCleanup = false;
    for (let i = 0; i < this.elements.length; i += 1) {
      ({ needsCleanup } = await this.checkElement(i));
    }
    if (needsCleanup) {
      await this.cleanup();
    }

    await this.handleOnVisible();
    await this.handleOnClick();
    await this.handleOnFocus();
    await this.handleOnMedia();
  }

  async handleOnMedia() {
    for (const el of this.elements) {
      for (const strategy of el.strategies) {
        if (strategy.type === 'onMedia' && strategy.options) {
          if (!this.mediaQueries[strategy.options]) {
            this.mediaQueries[strategy.options] = window.matchMedia(strategy.options);
          }

          // TODO: remove event listener on cleanup if element gets removed
          this.mediaQueries[strategy.options].addEventListener('change', ev => {
            if (ev.matches) {
              this.setResolveAbleOn({
                target: el.node,
                strategyType: strategy.type,
                strategyOptions: strategy.options,
                resolveAble: true,
              });
            } else {
              this.setResolveAbleOn({
                target: el.node,
                strategyType: strategy.type,
                strategyOptions: strategy.options,
                resolveAble: false,
              });
            }
          });

          // Initial check
          if (this.mediaQueries[strategy.options].matches) {
            this.setResolveAbleOn({
              target: el.node,
              strategyType: strategy.type,
              strategyOptions: strategy.options,
              resolveAble: true,
            });
          }
        }
      }
    }
  }

  async handleOnClick() {
    document.body.addEventListener('click', async ev => {
      if (!ev.target) {
        return;
      }
      this.setResolveAbleOn(
        { target: ev.target, strategyType: 'onClick', resolveAble: true },
        { composedPath: ev.composedPath(), event: ev },
      );

      // reset the onClick resolveAble if the click did not result in the hydration of the element
      setTimeout(() => {
        if (!ev.target) {
          return;
        }
        this.setResolveAbleOn({
          target: ev.target,
          strategyType: 'onClick',
          resolveAble: false,
        });
      }, 50);
    });
  }

  async handleOnFocus() {
    document.body.addEventListener('focusin', async ev => {
      if (!ev.target) {
        return;
      }
      this.setResolveAbleOn(
        { target: ev.target, strategyType: 'onFocus', resolveAble: true },
        { composedPath: ev.composedPath(), event: ev },
      );

      // reset the onFocus resolveAble if the focus did not resulted in the hydration of the element
      setTimeout(() => {
        if (!ev.target) {
          return;
        }
        this.setResolveAbleOn({
          target: ev.target,
          strategyType: 'onFocus',
          resolveAble: false,
        });
      }, 50);
    });
  }

  async handleOnVisible() {
    this.intersectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.setResolveAbleOn({
            target: entry.target,
            strategyType: 'onVisible',
            resolveAble: true,
          });
        } else {
          this.setResolveAbleOn({
            target: entry.target,
            strategyType: 'onVisible',
            resolveAble: false,
          });
        }
      }
    });

    for (const el of this.elements) {
      for (const strategy of el.strategies) {
        if (strategy.type === 'onVisible') {
          this.intersectionObserver.observe(el.node);
        }
      }
    }
  }

  async setup() {
    if (this.isSetup === false) {
      await import('@lit-labs/ssr-client/lit-element-hydrate-support.js');
      await applyLitElementHydrateSupport();
      this.isSetup = true;
    }
  }
}

async function applyLitElementHydrateSupport() {
  const hydrationGlobal =
    /** @type {typeof globalThis & { litElementHydrateSupport?: LitElementHydrateSupport }} */ (
      globalThis
    );
  const support = hydrationGlobal.litElementHydrateSupport;
  if (typeof support !== 'function') {
    return;
  }

  const { LitElement } = await import('lit');
  if (!hasLitElementHydrateSupport(LitElement)) {
    support({ LitElement });
  }
}

/**
 * @param {typeof import('lit').LitElement} LitElement
 */
function hasLitElementHydrateSupport(LitElement) {
  class RocketHydrationProbe extends LitElement {
    static properties = {
      probe: { type: String },
    };
  }

  return RocketHydrationProbe.observedAttributes?.includes('defer-hydration') === true;
}
