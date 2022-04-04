/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-prototype-builtins */
import { evaluate } from './evaluate.js';
import { extractStrategies } from './extractStrategies.js';

export class HydrationLoader {
  /** @type {import('../../types/main').Components} */
  components = {};
  isSetup = false;

  /** @type {import('../../types/main').ElementWithStrategy[]}  */
  elements = [];

  /** @type {{ [key: string]: MediaQueryList }} */
  mediaQueries = {};

  /**
   * @param {import('../../types/main').Components} components
   */
  constructor(components) {
    this.components = components;
  }

  /**
   *
   * @param {number} index
   * @param {object} options
   * @param {Event} [options.ev]
   * @returns {Promise<{ needsCleanup: boolean }>}
   */
  async checkElement(index, { ev } = {}) {
    const el = this.elements[index];
    const allResolveAble = evaluate({
      strategyTemplate: el.strategyTemplate,
      strategies: el.strategies,
    });
    if (allResolveAble) {
      await this.setup();
      const loadFn = this.components[el.tagName];
      if (loadFn) {
        const klass = await loadFn();
        customElements.define(el.tagName, klass);
      }
      if (el.node.updateComplete) {
        await el.node.updateComplete;
      }

      for (let i = 0; i < this.elements.length; i += 1) {
        if (this.elements[i].tagName === el.tagName) {
          this.elements[i].deleteMe = true;
        }
      }

      if (ev) {
        // @ts-ignore
        const reFire = ev.path[0];
        if (reFire) {
          reFire.click();
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

  /**
   * @returns {import('../../types/main').ElementWithStrategy[]}
   */
  gatherElements() {
    const els = document.querySelectorAll('[loading]');
    /** @type {import('../../types/main').ElementWithStrategy[]} */
    const elements = [];
    for (const el of els) {
      const strategyAttribute = el.getAttribute('loading');
      if (!strategyAttribute) {
        continue;
      }

      const tagName = el.tagName.toLowerCase();
      if (strategyAttribute.startsWith('hydrate:')) {
        const hydrationStrategy = strategyAttribute.substring('hydrate:'.length);
        const strategies = extractStrategies(hydrationStrategy);
        elements.push({
          tagName,
          node: el,
          ...strategies,
        });
      }
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
      for (let i = 0; i < this.elements[foundIndex].strategies.length; i += 1) {
        if (
          this.elements[foundIndex].strategies[i].type === strategyType &&
          this.elements[foundIndex].strategies[i].options === strategyOptions
        ) {
          this.elements[foundIndex].strategies[i].resolveAble = resolveAble;
          ({ needsCleanup } = await this.checkElement(foundIndex, options));
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
        { ev },
      );

      // reset the onClick resolveAble if the click did not resulted in the hydration of the element
      setTimeout(() => {
        if (!ev.target) {
          return;
        }
        this.setResolveAbleOn({ target: ev.target, strategyType: 'onClick', resolveAble: false });
      }, 10);
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
      // Start fetching the Lit hydration support module (note the absence
      // of "await" -- we don't want to block yet).
      const litHydrateSupportInstalled = import('lit/experimental-hydrate-support.js');

      // Check if we require the declarative shadow DOM polyfill. As of
      // February 2022, Chrome and Edge have native support, but Firefox
      // and Safari don't yet.
      if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
        // Fetch the declarative shadow DOM polyfill.
        const { hydrateShadowRoots } = await import(
          '@webcomponents/template-shadowroot/template-shadowroot.js'
        );

        // Apply the polyfill. This is a one-shot operation, so it is important
        // it happens after all HTML has been parsed.
        hydrateShadowRoots(document.body);

        // At this point, browsers without native declarative shadow DOM
        // support can paint the initial state of your components!
        document.body.removeAttribute('dsd-pending');
      }

      // The Lit hydration support module must be installed before we can
      // load any component definitions. Wait until it's ready.
      await litHydrateSupportInstalled;

      this.isSetup = true;
    }
  }
}
