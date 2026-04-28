// @ts-nocheck
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

class FakeElement {
  constructor() {
    this.innerHTML = '';
  }

  hasChildNodes() {
    return this.innerHTML !== '';
  }
}

class FakeShadowRoot {
  constructor() {
    this.iconSlot = new FakeElement();
  }

  set innerHTML(value) {
    this.html = value;
    this.iconSlot = new FakeElement();
  }

  get innerHTML() {
    return this.html || '';
  }

  querySelector(selector) {
    return selector === '[part="icon"]' ? this.iconSlot : null;
  }
}

class FakeHTMLElement {
  constructor() {
    this.attributes = new Map();
    this.shadowRoot = null;
    this.ownerDocument = fakeDocument;
    this.isConnected = false;
  }

  attachShadow() {
    this.shadowRoot = new FakeShadowRoot();
    return this.shadowRoot;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  setAttribute(name, value) {
    const oldValue = this.getAttribute(name);
    const newValue = String(value);
    this.attributes.set(name, newValue);
    if (this.constructor.observedAttributes?.includes(name)) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  removeAttribute(name) {
    const oldValue = this.getAttribute(name);
    const hadAttribute = this.attributes.delete(name);
    if (hadAttribute && this.constructor.observedAttributes?.includes(name)) {
      this.attributeChangedCallback(name, oldValue, null);
    }
  }
}

const manifest = {
  defaultLibrary: 'bootstrap',
  icons: {
    'bootstrap:alarm': '/_rocket/icons/bootstrap/alarm.abc123def456.svg',
  },
};

const fakeDocument = {
  querySelector(selector) {
    if (selector !== 'script[type="application/json"][data-rocket-icon-manifest]') {
      return null;
    }
    return { textContent: JSON.stringify(manifest) };
  },
};

/**
 * @param {{ defaultLibrary?: string; icons: Record<string, string> }} iconManifest
 */
function makeFakeDocument(iconManifest) {
  return {
    querySelector(selector) {
      if (selector !== 'script[type="application/json"][data-rocket-icon-manifest]') {
        return null;
      }
      return { textContent: JSON.stringify(iconManifest) };
    },
  };
}

/**
 * @param {{ fetchResponse?: (url: string) => Promise<{ ok: boolean; status?: number; text: () => Promise<string> }> }} [options]
 */
function installBrowserFakes({ fetchResponse } = {}) {
  const observers = [];
  const fetchCalls = [];
  const warnings = [];
  const originalHTMLElement = globalThis.HTMLElement;
  const originalIntersectionObserver = globalThis.IntersectionObserver;
  const originalFetch = globalThis.fetch;
  const originalLocation = globalThis.location;
  const runtimeConsole = globalThis['console'];
  const originalWarn = runtimeConsole.warn;

  globalThis.HTMLElement = FakeHTMLElement;
  globalThis.IntersectionObserver = class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe(target) {
      this.target = target;
    }

    disconnect() {
      this.disconnected = true;
    }

    reveal() {
      this.callback([{ isIntersecting: true, target: this.target }]);
    }
  };
  globalThis.fetch = async url => {
    fetchCalls.push(url);
    if (fetchResponse) {
      return fetchResponse(url);
    }
    return {
      ok: true,
      async text() {
        return `<svg data-url="${url}"></svg>`;
      },
    };
  };
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { hostname: 'rocket.test' },
  });
  runtimeConsole.warn = (...messages) => {
    warnings.push(messages);
  };

  return {
    observers,
    fetchCalls,
    warnings,
    restore() {
      if (originalHTMLElement === undefined) {
        delete globalThis.HTMLElement;
      } else {
        globalThis.HTMLElement = originalHTMLElement;
      }
      if (originalIntersectionObserver === undefined) {
        delete globalThis.IntersectionObserver;
      } else {
        globalThis.IntersectionObserver = originalIntersectionObserver;
      }
      if (originalFetch === undefined) {
        delete globalThis.fetch;
      } else {
        globalThis.fetch = originalFetch;
      }
      if (originalLocation === undefined) {
        delete globalThis.location;
      } else {
        Object.defineProperty(globalThis, 'location', {
          configurable: true,
          value: originalLocation,
        });
      }
      runtimeConsole.warn = originalWarn;
    },
  };
}

function nextTick() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('Test RocketIcon', () => {
  it('01: fetches manifest URLs only after visibility and reuses cached SVG text', async () => {
    const observers = [];
    const fetchCalls = [];
    const originalHTMLElement = globalThis.HTMLElement;
    const originalIntersectionObserver = globalThis.IntersectionObserver;
    const originalFetch = globalThis.fetch;
    const originalLocation = globalThis.location;

    globalThis.HTMLElement = FakeHTMLElement;
    globalThis.IntersectionObserver = class FakeIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target) {
        this.target = target;
      }

      disconnect() {
        this.disconnected = true;
      }

      reveal() {
        this.callback([{ isIntersecting: true, target: this.target }]);
      }
    };
    globalThis.fetch = async url => {
      fetchCalls.push(url);
      return {
        ok: true,
        async text() {
          return '<svg data-loaded="true"></svg>';
        },
      };
    };
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { hostname: 'rocket.test' },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const firstIcon = new RocketIcon();
      firstIcon.setAttribute('name', 'alarm');
      firstIcon.isConnected = true;
      firstIcon.connectedCallback();

      assert.equal(fetchCalls.length, 0);
      assert.equal(observers.length, 1);

      observers[0].reveal();
      await new Promise(resolve => setImmediate(resolve));

      assert.deepEqual(fetchCalls, ['/_rocket/icons/bootstrap/alarm.abc123def456.svg']);
      assert.equal(firstIcon.shadowRoot.iconSlot.innerHTML, '<svg data-loaded="true"></svg>');

      const secondIcon = new RocketIcon();
      secondIcon.setAttribute('name', 'alarm');
      secondIcon.isConnected = true;
      secondIcon.connectedCallback();
      observers[1].reveal();
      await new Promise(resolve => setImmediate(resolve));

      assert.equal(fetchCalls.length, 1);
      assert.equal(secondIcon.shadowRoot.iconSlot.innerHTML, '<svg data-loaded="true"></svg>');
    } finally {
      if (originalHTMLElement === undefined) {
        delete globalThis.HTMLElement;
      } else {
        globalThis.HTMLElement = originalHTMLElement;
      }
      if (originalIntersectionObserver === undefined) {
        delete globalThis.IntersectionObserver;
      } else {
        globalThis.IntersectionObserver = originalIntersectionObserver;
      }
      if (originalFetch === undefined) {
        delete globalThis.fetch;
      } else {
        globalThis.fetch = originalFetch;
      }
      if (originalLocation === undefined) {
        delete globalThis.location;
      } else {
        Object.defineProperty(globalThis, 'location', {
          configurable: true,
          value: originalLocation,
        });
      }
    }
  });

  it('02: preserves server-rendered SVG during custom element upgrade', async () => {
    const observers = [];
    const fetchCalls = [];
    const originalHTMLElement = globalThis.HTMLElement;
    const originalIntersectionObserver = globalThis.IntersectionObserver;
    const originalFetch = globalThis.fetch;
    const originalLocation = globalThis.location;

    globalThis.HTMLElement = FakeHTMLElement;
    globalThis.IntersectionObserver = class FakeIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target) {
        this.target = target;
      }

      disconnect() {
        this.disconnected = true;
      }
    };
    globalThis.fetch = async url => {
      fetchCalls.push(url);
      return {
        ok: true,
        async text() {
          return '<svg data-loaded="true"></svg>';
        },
      };
    };
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { hostname: 'rocket.test' },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const icon = new RocketIcon();
      icon.shadowRoot = new FakeShadowRoot();
      icon.shadowRoot.iconSlot.innerHTML = '<svg data-server-rendered="true"></svg>';
      icon.isConnected = true;

      icon.setAttribute('library', 'bootstrap');
      icon.setAttribute('name', 'alarm');
      icon.setAttribute('icon-loading', 'server');

      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '<svg data-server-rendered="true"></svg>');
      assert.equal(observers.length, 0);

      icon.connectedCallback();

      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '<svg data-server-rendered="true"></svg>');
      assert.equal(observers.length, 0);
      assert.deepEqual(fetchCalls, []);
    } finally {
      if (originalHTMLElement === undefined) {
        delete globalThis.HTMLElement;
      } else {
        globalThis.HTMLElement = originalHTMLElement;
      }
      if (originalIntersectionObserver === undefined) {
        delete globalThis.IntersectionObserver;
      } else {
        globalThis.IntersectionObserver = originalIntersectionObserver;
      }
      if (originalFetch === undefined) {
        delete globalThis.fetch;
      } else {
        globalThis.fetch = originalFetch;
      }
      if (originalLocation === undefined) {
        delete globalThis.location;
      } else {
        Object.defineProperty(globalThis, 'location', {
          configurable: true,
          value: originalLocation,
        });
      }
    }
  });

  it('03: warns for client fallback cases and still resolves valid manifest icons', async () => {
    const browser = installBrowserFakes();

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const emptyNameIcon = new RocketIcon();
      emptyNameIcon.ownerDocument = makeFakeDocument(manifest);
      emptyNameIcon.setAttribute('name', '');
      emptyNameIcon.isConnected = true;
      emptyNameIcon.connectedCallback();

      assert.equal(emptyNameIcon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(browser.observers.length, 0);
      assert.match(String(browser.warnings[0]?.[0]), /requires a non-empty name/);

      const invalidLoadingIcon = new RocketIcon();
      invalidLoadingIcon.ownerDocument = makeFakeDocument(manifest);
      invalidLoadingIcon.setAttribute('name', 'alarm');
      invalidLoadingIcon.setAttribute('icon-loading', 'lazy');
      invalidLoadingIcon.isConnected = true;
      invalidLoadingIcon.connectedCallback();

      assert.equal(browser.observers.length, 1);
      assert.match(String(browser.warnings.at(-1)?.[0]), /Invalid rocket-icon icon-loading "lazy"/);

      browser.observers[0].reveal();
      await nextTick();

      assert.deepEqual(browser.fetchCalls, ['/_rocket/icons/bootstrap/alarm.abc123def456.svg']);
      assert.equal(
        invalidLoadingIcon.shadowRoot.iconSlot.innerHTML,
        '<svg data-url="/_rocket/icons/bootstrap/alarm.abc123def456.svg"></svg>',
      );

      const serverLoadingIcon = new RocketIcon();
      serverLoadingIcon.ownerDocument = makeFakeDocument(manifest);
      serverLoadingIcon.setAttribute('name', 'alarm');
      serverLoadingIcon.setAttribute('icon-loading', 'server');
      serverLoadingIcon.isConnected = true;
      serverLoadingIcon.connectedCallback();

      assert.equal(browser.observers.length, 2);
      assert.match(String(browser.warnings.at(-1)?.[0]), /cannot use icon-loading="server"/);
    } finally {
      browser.restore();
    }
  });

  it('04: clears current output on Icon Reference mutations and re-resolves through the manifest', async () => {
    const browser = installBrowserFakes();
    const document = makeFakeDocument({
      defaultLibrary: 'bootstrap',
      icons: {
        'bootstrap:alarm': '/icons/bootstrap/alarm.svg',
        'bootstrap:bell': '/icons/bootstrap/bell.svg',
        'local:bell': '/icons/local/bell.svg',
      },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const icon = new RocketIcon();
      icon.ownerDocument = document;
      icon.setAttribute('name', 'alarm');
      icon.isConnected = true;
      icon.connectedCallback();

      browser.observers[0].reveal();
      await nextTick();
      assert.equal(
        icon.shadowRoot.iconSlot.innerHTML,
        '<svg data-url="/icons/bootstrap/alarm.svg"></svg>',
      );

      icon.setAttribute('name', 'bell');
      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(browser.observers.length, 2);

      browser.observers[1].reveal();
      await nextTick();
      assert.equal(
        icon.shadowRoot.iconSlot.innerHTML,
        '<svg data-url="/icons/bootstrap/bell.svg"></svg>',
      );

      icon.setAttribute('library', 'local');
      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(browser.observers.length, 3);

      browser.observers[2].reveal();
      await nextTick();
      assert.equal(
        icon.shadowRoot.iconSlot.innerHTML,
        '<svg data-url="/icons/local/bell.svg"></svg>',
      );

      icon.setAttribute('name', 'missing');

      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(browser.observers.length, 3);
      assert.match(String(browser.warnings.at(-1)?.[0]), /"local:missing" is absent/);
      assert.deepEqual(browser.fetchCalls, [
        '/icons/bootstrap/alarm.svg',
        '/icons/bootstrap/bell.svg',
        '/icons/local/bell.svg',
      ]);
    } finally {
      browser.restore();
    }
  });

  it('05: applies changed icon-loading through browser client-loading rules', async () => {
    const browser = installBrowserFakes();
    const document = makeFakeDocument({
      defaultLibrary: 'bootstrap',
      icons: {
        'bootstrap:alarm': '/icons/bootstrap/alarm.svg',
      },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const icon = new RocketIcon();
      icon.ownerDocument = document;
      icon.setAttribute('name', 'alarm');
      icon.isConnected = true;
      icon.connectedCallback();
      browser.observers[0].reveal();
      await nextTick();

      icon.setAttribute('icon-loading', 'server');

      assert.equal(icon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(browser.observers.length, 2);
      assert.match(String(browser.warnings.at(-1)?.[0]), /cannot use icon-loading="server"/);

      browser.observers[1].reveal();
      await nextTick();

      assert.equal(browser.fetchCalls.length, 1);
      assert.equal(
        icon.shadowRoot.iconSlot.innerHTML,
        '<svg data-url="/icons/bootstrap/alarm.svg"></svg>',
      );
    } finally {
      browser.restore();
    }
  });

  it('06: leaves SVG output and fetch cache untouched for ARIA label mutations', async () => {
    const browser = installBrowserFakes();
    const document = makeFakeDocument({
      defaultLibrary: 'bootstrap',
      icons: {
        'bootstrap:alarm': '/icons/bootstrap/alarm.svg',
      },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const icon = new RocketIcon();
      icon.ownerDocument = document;
      icon.setAttribute('name', 'alarm');
      icon.isConnected = true;
      icon.connectedCallback();
      browser.observers[0].reveal();
      await nextTick();

      const renderedSvg = icon.shadowRoot.iconSlot.innerHTML;
      const cacheSize = RocketIcon.svgCache.size;
      icon.setAttribute('aria-label', 'Alarm');
      icon.setAttribute('aria-labelledby', 'alarm-label');

      assert.equal(icon.getAttribute('aria-label'), 'Alarm');
      assert.equal(icon.getAttribute('aria-labelledby'), 'alarm-label');
      assert.equal(icon.getAttribute('role'), 'img');
      assert.equal(icon.shadowRoot.iconSlot.innerHTML, renderedSvg);
      assert.equal(browser.fetchCalls.length, 1);
      assert.equal(browser.observers.length, 1);
      assert.equal(RocketIcon.svgCache.size, cacheSize);

      icon.removeAttribute('aria-label');
      icon.removeAttribute('aria-labelledby');

      assert.equal(icon.getAttribute('role'), null);
      assert.equal(icon.shadowRoot.iconSlot.innerHTML, renderedSvg);
      assert.equal(browser.fetchCalls.length, 1);
      assert.equal(RocketIcon.svgCache.size, cacheSize);
    } finally {
      browser.restore();
    }
  });

  it('07: evicts failed fetches so recreated icons can retry', async () => {
    let attempt = 0;
    const browser = installBrowserFakes({
      async fetchResponse(url) {
        attempt += 1;
        if (attempt === 1) {
          return {
            ok: false,
            status: 500,
            async text() {
              return '';
            },
          };
        }
        return {
          ok: true,
          async text() {
            return `<svg data-retry-url="${url}"></svg>`;
          },
        };
      },
    });
    const document = makeFakeDocument({
      defaultLibrary: 'bootstrap',
      icons: {
        'bootstrap:alarm': '/icons/bootstrap/alarm.svg',
      },
    });

    try {
      const { RocketIcon } = await import('./RocketIcon.js');
      RocketIcon.svgCache.clear();

      const failedIcon = new RocketIcon();
      failedIcon.ownerDocument = document;
      failedIcon.setAttribute('name', 'alarm');
      failedIcon.isConnected = true;
      failedIcon.connectedCallback();
      browser.observers[0].reveal();
      await nextTick();

      assert.equal(failedIcon.shadowRoot.iconSlot.innerHTML, '');
      assert.equal(RocketIcon.svgCache.has('/icons/bootstrap/alarm.svg'), false);
      assert.match(
        String(browser.warnings.at(-1)?.[0]),
        /failed to fetch \/icons\/bootstrap\/alarm\.svg/,
      );

      const retryIcon = new RocketIcon();
      retryIcon.ownerDocument = document;
      retryIcon.setAttribute('name', 'alarm');
      retryIcon.isConnected = true;
      retryIcon.connectedCallback();
      browser.observers[1].reveal();
      await nextTick();

      assert.deepEqual(browser.fetchCalls, [
        '/icons/bootstrap/alarm.svg',
        '/icons/bootstrap/alarm.svg',
      ]);
      assert.equal(
        retryIcon.shadowRoot.iconSlot.innerHTML,
        '<svg data-retry-url="/icons/bootstrap/alarm.svg"></svg>',
      );
      assert.equal(
        RocketIcon.svgCache.get('/icons/bootstrap/alarm.svg'),
        '<svg data-retry-url="/icons/bootstrap/alarm.svg"></svg>',
      );
    } finally {
      browser.restore();
    }
  });
});
