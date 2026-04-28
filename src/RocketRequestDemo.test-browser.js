import { assert, fixture, html } from '@open-wc/testing';
import { RocketCodeBlock } from './RocketCodeBlock.js';
import '../exports/define/RocketRequestDemo.js';

if (!customElements.get('rocket-code-block')) {
  customElements.define('rocket-code-block', RocketCodeBlock);
}

/** @typedef {(name: string, callback: () => void) => void} BrowserDescribe */
/** @typedef {(name: string, callback: () => void | Promise<void>) => void} BrowserIt */

const testGlobals = /** @type {{ describe: BrowserDescribe; it: BrowserIt }} */ (
  /** @type {unknown} */ (globalThis)
);

testGlobals.describe('Test RocketRequestDemo browser behavior', () => {
  testGlobals.it('01: renders a lazy GET iframe with the default height', async () => {
    const element = await renderRequestDemo('/api/build-info.json?format=short');
    const shadowRoot = shadowRootFor(element);
    const iframe = iframeFor(shadowRoot);
    const request = shadowRoot.querySelector('[part~="request"]');
    const requestPath = shadowRoot.querySelector('[part~="request"] code');
    const source = sourceFor(shadowRoot);

    assert.equal(iframe.getAttribute('src'), '/api/build-info.json?format=short');
    assert.equal(iframe.getAttribute('loading'), 'lazy');
    assert.equal(
      iframe.getAttribute('title'),
      'Request Demo response for /api/build-info.json?format=short',
    );
    assert.equal(iframe.style.height, '240px');
    assert.match(request?.textContent || '', /GET\s+\/api\/build-info\.json\?format=short/);
    assert.ok(requestPath instanceof HTMLElement, 'Expected request path code');
    assert.equal(getComputedStyle(requestPath).borderTopStyle, 'none');
    assert.equal(getComputedStyle(requestPath).backgroundColor, 'rgba(0, 0, 0, 0)');
    assert.equal(source.open, false);
    const summary = source.querySelector('summary');
    assert.ok(summary instanceof HTMLElement, 'Expected Source summary');
    assert.equal(summary.textContent, 'Source');
    assertSourceDisclosureArrow(summary);
    assert.ok(element.querySelector('rocket-code-block'), 'Expected composed Code Block source');
  });

  testGlobals.it(
    '02: keeps source label out of the request header and applies the initial height',
    async () => {
      const element = await renderRequestDemo('/api/components/button.json', {
        label: 'docs/pages/api/component.rocket.js',
        height: '420',
      });
      const shadowRoot = shadowRootFor(element);
      const iframe = iframeFor(shadowRoot);
      const label = shadowRoot.querySelector('[part~="label"]');

      assert.equal(iframe.style.height, '420px');
      assert.equal(label, null);
      assert.equal(element.getAttribute('label'), 'docs/pages/api/component.rocket.js');
      assert.equal(element.getAttribute('url'), '/api/components/button.json');
    },
  );

  testGlobals.it('03: opens and copies the authored request path exactly', async () => {
    const originalOpen = window.open;
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    /** @type {{ url: string | URL | undefined; target: string | undefined; features: string | undefined }[]} */
    const opened = [];
    let copiedText = '';

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
      const element = await renderRequestDemo('/api/components.json?include=private');
      const shadowRoot = shadowRootFor(element);
      element.copyStateResetDelay = 50;
      const openButton = buttonFor(shadowRoot, '#open-request-demo');
      const copyButton = buttonFor(shadowRoot, '#copy-request-demo');

      openButton.click();
      copyButton.click();
      await Promise.resolve();
      await element.updateComplete;

      assert.deepEqual(opened, [
        {
          url: '/api/components.json?include=private',
          target: '_blank',
          features: 'noopener,noreferrer',
        },
      ]);
      assert.equal(copiedText, '/api/components.json?include=private');
      assert.equal(copyButton.getAttribute('aria-label'), 'Copied request path');

      await new Promise(resolve => setTimeout(resolve, 60));
      await element.updateComplete;

      assert.equal(copyButton.getAttribute('aria-label'), 'Copy request path');
    } finally {
      window.open = originalOpen;
      if (navigatorDescriptor) {
        Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'navigator');
      }
    }
  });

  testGlobals.it('04: keeps request actions in the Source row as icon buttons', async () => {
    const element = await renderRequestDemo('/api/components.json');
    const shadowRoot = shadowRootFor(element);
    const sourceRow = shadowRoot.querySelector('[part~="source-row"]');
    const source = sourceFor(shadowRoot);
    const actions = shadowRoot.querySelector('#request-actions');
    const openButton = buttonFor(shadowRoot, '#open-request-demo');
    const copyButton = buttonFor(shadowRoot, '#copy-request-demo');

    assert.ok(sourceRow instanceof HTMLElement, 'Expected Source row');
    assert.ok(actions instanceof HTMLElement, 'Expected request actions');
    assert.equal(sourceRow?.firstElementChild, source);
    assert.equal(sourceRow?.lastElementChild, actions);
    assert.equal(getComputedStyle(actions).position, 'absolute');
    assert.equal(getComputedStyle(source).marginBlockEnd, '0px');
    assert.equal(getComputedStyle(source).borderTopStyle, 'none');
    assert.equal(getComputedStyle(source).borderTopLeftRadius, '0px');
    assert.equal(openButton.textContent?.trim(), '');
    assert.equal(copyButton.textContent?.trim(), '');
    assert.equal(openButton.getAttribute('aria-label'), 'Open Request');
    assert.equal(copyButton.getAttribute('aria-label'), 'Copy request path');
  });

  testGlobals.it('05: keeps open Source actions and Code Block flush with the frame', async () => {
    const element = await renderRequestDemo('/api/components.json');
    const shadowRoot = shadowRootFor(element);
    const source = sourceFor(shadowRoot);
    const actions = shadowRoot.querySelector('#request-actions');
    const codeBlock = element.querySelector('rocket-code-block');

    assert.ok(actions instanceof HTMLElement, 'Expected request actions');
    assert.ok(codeBlock instanceof HTMLElement, 'Expected slotted Code Block');

    source.setAttribute('open', '');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const summary = source.querySelector('summary');
    const frame = codeBlock.shadowRoot?.querySelector('[part~="frame"]');

    assert.ok(summary instanceof HTMLElement, 'Expected Source summary');
    assert.ok(frame instanceof HTMLElement, 'Expected Code Block frame part');
    assert.closeTo(
      actions.getBoundingClientRect().bottom,
      summary.getBoundingClientRect().bottom,
      1,
    );
    assert.equal(getComputedStyle(codeBlock).marginBlockStart, '0px');
    assert.equal(getComputedStyle(codeBlock).marginBlockEnd, '0px');
    assert.equal(getComputedStyle(frame).borderTopStyle, 'none');
    assert.equal(getComputedStyle(frame).borderTopLeftRadius, '0px');
    assert.equal(getComputedStyle(frame).borderTopRightRadius, '0px');
  });

  testGlobals.it('06: resizes the iframe height from the handle keyboard control', async () => {
    const element = await renderRequestDemo('/api/components.json', { height: '240' });
    const shadowRoot = shadowRootFor(element);
    const iframe = iframeFor(shadowRoot);
    const resize = buttonFor(shadowRoot, '#resize-request-demo');

    assert.ok(resize.getBoundingClientRect().height <= 20, 'Expected compact resize handle');
    resize.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await element.updateComplete;

    assert.equal(iframe.style.height, '256px');
  });
});

/**
 * @param {string} url
 * @param {{ label?: string; height?: string }} [options]
 * @returns {Promise<import('./RocketRequestDemo.js').RocketRequestDemo>}
 */
async function renderRequestDemo(url, options = {}) {
  installDocsCascadeFixtureStyles();
  const wrapper = await fixture(html`
    <div class="atlas-content">
      <rocket-request-demo url=${url} label=${options.label || ''} height=${options.height || ''}>
        <rocket-code-block
          language="js"
          encoded-code="ZXhwb3J0IGRlZmF1bHQgKCkgPT4gKHsgb2s6IHRydWUgfSk7"
        ></rocket-code-block>
      </rocket-request-demo>
    </div>
  `);
  const element = /** @type {import('./RocketRequestDemo.js').RocketRequestDemo | null} */ (
    wrapper.querySelector('rocket-request-demo')
  );
  assert.ok(element, 'Expected Request Demo element');
  return element;
}

function installDocsCascadeFixtureStyles() {
  if (document.querySelector('style[data-docs-cascade-fixture]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-docs-cascade-fixture', '');
  style.textContent = `
    .atlas-content :not(pre) > code {
      display: block;
      background: rgb(248, 250, 252);
      padding: 0.12em 0.32em;
      border: 1px solid rgb(237, 241, 246);
      border-radius: 0.3em;
      color: rgb(11, 18, 32);
      font-family: "Fira Code", Consolas, monospace;
      font-size: 0.9em;
    }

    .atlas-content details {
      margin-block-end: 24px;
      border: 1px solid rgb(228, 229, 233);
      border-radius: 12px;
      background: white;
    }

    .atlas-content summary {
      padding-block: 16px;
      border-radius: 11px;
    }

    .atlas-content button {
      min-height: 43px;
      border-radius: 6px;
      appearance: auto;
    }
  `;
  document.head.append(style);
}

/**
 * @param {Element} element
 */
function shadowRootFor(element) {
  assert.ok(element.shadowRoot, 'Expected a shadow root');
  return /** @type {ShadowRoot} */ (element.shadowRoot);
}

/**
 * @param {Element | ShadowRoot} element
 */
function iframeFor(element) {
  const iframe = element.querySelector('iframe');
  assert.ok(iframe instanceof HTMLIFrameElement, 'Expected request iframe');
  return iframe;
}

/**
 * @param {Element | ShadowRoot} element
 */
function sourceFor(element) {
  const source = element.querySelector('#source');
  assert.ok(source instanceof HTMLDetailsElement, 'Expected source details');
  return source;
}

/**
 * @param {Element | ShadowRoot} element
 * @param {string} selector
 */
function buttonFor(element, selector) {
  const button = element.querySelector(selector);
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
