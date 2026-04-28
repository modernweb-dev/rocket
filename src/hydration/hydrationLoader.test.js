/* eslint-disable no-console */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LitElement } from 'lit';
import { HydrationLoader } from './hydrationLoader.js';

describe('Test HydrationLoader', () => {
  it('01: installs Lit hydration support when LitElement was loaded before hydration', async () => {
    class LoadedBeforeHydrationElement extends LitElement {
      static properties = {
        count: { type: Number },
      };
    }

    assert.equal(
      LoadedBeforeHydrationElement.observedAttributes.includes('defer-hydration'),
      false,
    );

    const loader = new HydrationLoader({});
    await loader.setup();

    assert.equal(LoadedBeforeHydrationElement.observedAttributes.includes('defer-hydration'), true);
  });

  it('02: accepts self-registering components without warning', async () => {
    const SelfRegisteringElement = /** @type {CustomElementConstructor} */ (
      /** @type {unknown} */ (class SelfRegisteringElement {})
    );
    /** @type {unknown[]} */
    const warnings = [];
    const originalCustomElements = globalThis.customElements;
    const originalWarn = console.warn;

    globalThis.customElements = /** @type {CustomElementRegistry} */ (
      /** @type {unknown} */ ({
        /**
         * @param {string} name
         */
        get(name) {
          return name === 'self-registering-element' ? SelfRegisteringElement : undefined;
        },
        define() {
          throw new Error('define should not be called for an existing matching component');
        },
      })
    );
    console.warn = message => warnings.push(message);

    try {
      const loader = new HydrationLoader({
        'self-registering-element': {
          getter: async () => SelfRegisteringElement,
          strategy: 'onClientLoad',
        },
      });
      loader.setup = async () => {};
      loader.elements = [
        {
          tagName: 'self-registering-element',
          node: /** @type {import('@rocket/js/types.js').ElementWithStrategy['node']} */ (
            /** @type {unknown} */ ({})
          ),
          strategyAttribute: 'onClientLoad',
          strategyTemplate: '{{0}}',
          strategies: [{ type: 'onClientLoad', resolveAble: true }],
        },
      ];

      await loader.checkElement(0);

      assert.deepEqual(warnings, []);
    } finally {
      globalThis.customElements = originalCustomElements;
      console.warn = originalWarn;
    }
  });

  it('03: tolerates concurrent hydration for duplicate elements', async () => {
    const DuplicateElement = /** @type {CustomElementConstructor} */ (
      /** @type {unknown} */ (class DuplicateElement {})
    );
    const nodeOne = /** @type {import('@rocket/js/types.js').ElementWithStrategy['node']} */ (
      /** @type {unknown} */ ({ id: 'one' })
    );
    const nodeTwo = /** @type {import('@rocket/js/types.js').ElementWithStrategy['node']} */ (
      /** @type {unknown} */ ({ id: 'two' })
    );
    const originalCustomElements = globalThis.customElements;
    let firstLoadResolve = /** @type {(value: CustomElementConstructor) => void} */ (() => {});
    let loadCount = 0;

    globalThis.customElements = /** @type {CustomElementRegistry} */ (
      /** @type {unknown} */ ({
        get() {
          return undefined;
        },
        define() {},
      })
    );

    try {
      const loader = new HydrationLoader({
        'duplicate-element': {
          getter: async () => {
            loadCount += 1;
            if (loadCount === 1) {
              return new Promise(resolve => {
                firstLoadResolve = resolve;
              });
            }
            return DuplicateElement;
          },
          strategy: 'onVisible',
        },
      });
      loader.setup = async () => {};
      loader.elements = [
        {
          tagName: 'duplicate-element',
          node: nodeOne,
          strategyAttribute: 'onVisible',
          strategyTemplate: '{{0}}',
          strategies: [{ type: 'onVisible', resolveAble: false }],
        },
        {
          tagName: 'duplicate-element',
          node: nodeTwo,
          strategyAttribute: 'onVisible',
          strategyTemplate: '{{0}}',
          strategies: [{ type: 'onVisible', resolveAble: false }],
        },
      ];

      const first = loader.setResolveAbleOn({
        target: nodeOne,
        strategyType: 'onVisible',
        resolveAble: true,
      });
      const second = loader.setResolveAbleOn({
        target: nodeTwo,
        strategyType: 'onVisible',
        resolveAble: true,
      });

      await second;
      firstLoadResolve(DuplicateElement);

      await first;
      assert.equal(loader.elements.length, 0);
    } finally {
      globalThis.customElements = originalCustomElements;
    }
  });
});
