import { assert, fixture, html } from '@open-wc/testing';
import { RocketCodeBlock } from './RocketCodeBlock.js';
import '../exports/define/RocketJsDemo.js';

if (!customElements.get('rocket-code-block')) {
  customElements.define('rocket-code-block', RocketCodeBlock);
}

/** @typedef {(name: string, callback: () => void) => void} BrowserDescribe */
/** @typedef {(name: string, callback: () => void | Promise<void>) => void} BrowserIt */

const testGlobals = /** @type {{ describe: BrowserDescribe; it: BrowserIt }} */ (
  /** @type {unknown} */ (globalThis)
);

testGlobals.describe('Test RocketJsDemo browser behavior', () => {
  testGlobals.it(
    '01: keeps JavaScript Demo source collapsed behind a Source disclosure',
    async () => {
      const element = await renderDemo();
      const shadowRoot = shadowRootFor(element);

      const source = shadowRoot.querySelector('#source');
      const summary = source?.querySelector('summary');

      assert.ok(summary instanceof HTMLElement, 'Expected Source summary');
      assert.equal(summary?.textContent, 'Source');
      assertSourceDisclosureArrow(summary);
      assert.equal(source?.hasAttribute('open'), false);
      assert.ok(element.querySelector('rocket-code-block'), 'Expected composed Code Block source');
    },
  );

  testGlobals.it('02: opens and copies the Standalone Demo URL as a site-root path', async () => {
    const originalOpen = window.open;
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    /** @type {{ url: string | URL | undefined; target: string | undefined; features: string | undefined }[]} */
    const opened = [];
    let copiedText = '';

    history.pushState({}, '', '/guides/components/button?tab=source#buttonDemo');
    window.open = (url, target, features) => {
      opened.push({ url, target, features });
      return null;
    };
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          /**
           * @param {string} text
           */
          async writeText(text) {
            copiedText = text;
          },
        },
      },
    });

    try {
      const element = await renderDemo('buttonDemo');
      const shadowRoot = shadowRootFor(element);
      element.copyStateResetDelay = 50;

      buttonFor(shadowRoot, '#open-standalone-demo').click();
      const copyButton = buttonFor(shadowRoot, '#copy-standalone-demo');
      copyButton.click();
      await Promise.resolve();
      await element.updateComplete;

      assert.deepEqual(opened, [
        {
          url: '/guides/components/button/_demo/buttonDemo/',
          target: '_blank',
          features: 'noopener,noreferrer',
        },
      ]);
      assert.equal(copiedText, '/guides/components/button/_demo/buttonDemo/');
      assert.equal(copyButton.getAttribute('aria-label'), 'Copied Standalone Demo URL');

      await new Promise(resolve => setTimeout(resolve, 60));
      await element.updateComplete;

      assert.equal(copyButton.getAttribute('aria-label'), 'Copy Standalone Demo URL');
    } finally {
      window.open = originalOpen;
      if (navigatorDescriptor) {
        Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'navigator');
      }
    }
  });

  testGlobals.it('03: keeps standalone actions in the Source row as icon buttons', async () => {
    const element = await renderDemo();
    const shadowRoot = shadowRootFor(element);
    const sourceRow = shadowRoot.querySelector('#source-row');
    const source = shadowRoot.querySelector('#source');
    const standaloneActions = shadowRoot.querySelector('#standalone-actions');
    const openButton = buttonFor(shadowRoot, '#open-standalone-demo');
    const copyButton = buttonFor(shadowRoot, '#copy-standalone-demo');

    assert.ok(sourceRow instanceof HTMLElement, 'Expected Source row');
    assert.ok(source instanceof HTMLElement, 'Expected Source details');
    assert.ok(standaloneActions instanceof HTMLElement, 'Expected standalone actions');
    assert.equal(sourceRow?.firstElementChild, source);
    assert.equal(sourceRow?.lastElementChild, standaloneActions);
    assert.equal(getComputedStyle(standaloneActions).position, 'absolute');
    assert.equal(openButton.textContent?.trim(), '');
    assert.equal(copyButton.textContent?.trim(), '');
    assert.equal(openButton.getAttribute('aria-label'), 'Open Standalone Demo URL');
    assert.equal(copyButton.getAttribute('aria-label'), 'Copy Standalone Demo URL');
  });

  testGlobals.it('04: keeps open Source actions and Code Block flush with the frame', async () => {
    const element = await renderDemo();
    const shadowRoot = shadowRootFor(element);
    const source = shadowRoot.querySelector('#source');
    const standaloneActions = shadowRoot.querySelector('#standalone-actions');
    const codeBlock = element.querySelector('rocket-code-block');

    assert.ok(source instanceof HTMLElement, 'Expected Source details');
    assert.ok(standaloneActions instanceof HTMLElement, 'Expected standalone actions');
    assert.ok(codeBlock instanceof HTMLElement, 'Expected slotted Code Block');

    source.setAttribute('open', '');
    await element.updateComplete;
    await /** @type {import('./RocketCodeBlock.js').RocketCodeBlock} */ (codeBlock).updateComplete;

    const summary = source.querySelector('summary');
    const frame = codeBlock.shadowRoot?.querySelector('[part~="frame"]');

    assert.ok(summary instanceof HTMLElement, 'Expected Source summary');
    assert.ok(frame instanceof HTMLElement, 'Expected Code Block frame part');
    assert.closeTo(
      standaloneActions.getBoundingClientRect().bottom,
      summary.getBoundingClientRect().bottom,
      1,
    );
    assert.equal(getComputedStyle(codeBlock).marginBlockStart, '0px');
    assert.equal(getComputedStyle(codeBlock).marginBlockEnd, '0px');
    assert.equal(getComputedStyle(frame).borderTopStyle, 'none');
    assert.equal(getComputedStyle(frame).borderTopLeftRadius, '0px');
    assert.equal(getComputedStyle(frame).borderTopRightRadius, '0px');
  });

  testGlobals.it('05: renders standalone mode as only the live demo', async () => {
    const element = await renderDemo('standaloneButton', true);
    const shadowRoot = shadowRootFor(element);

    assert.match(shadowRoot.textContent || '', /Rendered standaloneButton/);
    assert.equal(shadowRoot.querySelector('#source'), null);
    assert.equal(shadowRoot.querySelector('#open-standalone-demo'), null);
    assert.equal(shadowRoot.querySelector('#copy-standalone-demo'), null);
    assert.equal(shadowRoot.querySelector('slot'), null);
  });

  testGlobals.it(
    '06: resizes the JavaScript Demo width from the handle keyboard control',
    async () => {
      const element = await renderDemo();
      const shadowRoot = shadowRootFor(element);
      const wrapper = shadowRoot.querySelector('#wrapper');
      const resize = buttonFor(shadowRoot, '#resize');

      assert.ok(wrapper instanceof HTMLElement, 'Expected demo wrapper');
      wrapper.style.width = '320px';

      resize.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await element.updateComplete;

      assert.equal(wrapper.style.width, '304px');
    },
  );
});

/**
 * @param {string} demoName
 * @param {boolean} singleDemo
 * @returns {Promise<import('./RocketJsDemo.js').RocketJsDemo>}
 */
async function renderDemo(demoName = 'simpleDemo', singleDemo = false) {
  const element = /** @type {import('./RocketJsDemo.js').RocketJsDemo} */ (
    await fixture(html`
      <rocket-js-demo demo-name=${demoName} ?single-demo=${singleDemo}>
        <rocket-code-block
          language="js"
          encoded-code="Y29uc3QgZGVtbyA9IHRydWU7"
        ></rocket-code-block>
      </rocket-js-demo>
    `)
  );
  element.demo = () => html`<p>Rendered ${demoName}</p>`;
  await element.updateComplete;
  return element;
}

/**
 * @param {Element} element
 */
function shadowRootFor(element) {
  assert.ok(element.shadowRoot, 'Expected a shadow root');
  return /** @type {ShadowRoot} */ (element.shadowRoot);
}

/**
 * @param {ShadowRoot} root
 * @param {string} selector
 */
function buttonFor(root, selector) {
  const button = root.querySelector(selector);
  assert.ok(button instanceof HTMLElement, `Expected ${selector} button`);
  return button;
}

/**
 * @param {HTMLElement} summary
 */
function assertSourceDisclosureArrow(summary) {
  const arrow = getComputedStyle(summary, '::after');

  assert.equal(arrow.borderTopWidth, '0px');
  assert.equal(arrow.borderLeftWidth, '0px');
  assert.equal(arrow.borderRightStyle, 'solid');
  assert.equal(arrow.borderBottomStyle, 'solid');
  assert.notEqual(arrow.transform, 'none');
}
