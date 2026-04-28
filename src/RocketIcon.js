/* eslint-disable no-console */
/** Runs on: browser */

const SHADOW_ICON_STYLE =
  ':host{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;line-height:1}' +
  ':host([hidden]){display:none}' +
  'span[part="icon"]{display:inline-flex;width:100%;height:100%;line-height:1}' +
  'span[part="icon"]>svg{display:block;width:100%;height:100%}';

/** @type {WeakMap<Document, { defaultLibrary?: string; icons: Record<string, string> } | null>} */
const manifestCache = new WeakMap();

export class RocketIcon extends HTMLElement {
  static observedAttributes = ['name', 'library', 'icon-loading', 'aria-label', 'aria-labelledby'];

  /** @type {Map<string, string | Promise<string>>} */
  static svgCache = new Map();

  /** @type {string | undefined} */
  pendingUrl;

  /** @type {IntersectionObserver | undefined} */
  intersectionObserver;

  hasCompletedInitialConnection = false;

  hasSetIconRole = false;

  connectedCallback() {
    this.ensureShadowRoot();
    this.syncAccessibilitySemantics();
    this.hasCompletedInitialConnection = true;
    if (this.hasRenderedIcon()) {
      return;
    }
    this.resolveIcon();
  }

  disconnectedCallback() {
    this.disconnectObserver();
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.hasCompletedInitialConnection) {
      return;
    }
    if (name === 'aria-label' || name === 'aria-labelledby') {
      this.syncAccessibilitySemantics();
      return;
    }
    this.clearIcon();
    if (this.isConnected) {
      this.resolveIcon();
    }
  }

  ensureShadowRoot() {
    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `<style>${SHADOW_ICON_STYLE}</style><span part="icon"></span>`;
      return;
    }
    if (!this.iconSlot) {
      this.shadowRoot.innerHTML = `<style>${SHADOW_ICON_STYLE}</style><span part="icon"></span>`;
    }
  }

  get iconSlot() {
    return this.shadowRoot?.querySelector('[part="icon"]') || null;
  }

  hasRenderedIcon() {
    return this.iconSlot?.hasChildNodes() === true;
  }

  syncAccessibilitySemantics() {
    const hasIconLabel =
      hasNonEmptyAttribute(this, 'aria-label') || hasNonEmptyAttribute(this, 'aria-labelledby');
    if (hasIconLabel) {
      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'img');
        this.hasSetIconRole = true;
      }
      return;
    }

    if (this.hasSetIconRole && this.getAttribute('role') === 'img') {
      this.removeAttribute('role');
    }
    this.hasSetIconRole = false;
  }

  clearIcon() {
    this.disconnectObserver();
    this.pendingUrl = undefined;
    const iconSlot = this.iconSlot;
    if (iconSlot) {
      iconSlot.innerHTML = '';
    }
  }

  resolveIcon() {
    this.ensureShadowRoot();
    const name = this.getAttribute('name')?.trim();
    if (!name) {
      warn('rocket-icon requires a non-empty name attribute.');
      return;
    }

    const loading = this.getAttribute('icon-loading') || 'auto';
    if (loading === 'server') {
      warn('Browser-created rocket-icon cannot use icon-loading="server"; using client loading.');
    } else if (loading !== 'auto' && loading !== 'client') {
      warn(`Invalid rocket-icon icon-loading ${JSON.stringify(loading)}; using client loading.`);
    }

    const manifest = readManifest(this.ownerDocument);
    if (!manifest) {
      warn(`rocket-icon "${name}" cannot load because the Icon Manifest is missing.`);
      return;
    }

    const library = this.getAttribute('library')?.trim() || manifest.defaultLibrary;
    if (!library) {
      warn(`rocket-icon "${name}" has no Icon Library in the Icon Manifest.`);
      return;
    }

    const key = `${library}:${name}`;
    const url = manifest.icons[key];
    if (!url) {
      warn(`rocket-icon "${key}" is absent from the Icon Manifest.`);
      return;
    }

    this.pendingUrl = url;
    this.observeVisibility(url);
  }

  /**
   * @param {string} url
   */
  observeVisibility(url) {
    this.disconnectObserver();
    if (!('IntersectionObserver' in globalThis)) {
      warn('rocket-icon cannot load until IntersectionObserver is available.');
      return;
    }
    this.intersectionObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) {
        return;
      }
      this.disconnectObserver();
      this.loadSvg(url);
    });
    this.intersectionObserver.observe(this);
  }

  disconnectObserver() {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
  }

  /**
   * @param {string} url
   */
  async loadSvg(url) {
    try {
      const svg = await cachedSvg(url);
      if (this.pendingUrl !== url) {
        return;
      }
      const iconSlot = this.iconSlot;
      if (iconSlot) {
        iconSlot.innerHTML = svg;
      }
    } catch (error) {
      warn(`rocket-icon failed to fetch ${url}.`, error);
    }
  }
}

/**
 * @param {string} url
 */
async function cachedSvg(url) {
  const cached = RocketIcon.svgCache.get(url);
  if (typeof cached === 'string') {
    return cached;
  }
  if (cached) {
    return cached;
  }
  const promise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    })
    .then(svg => {
      RocketIcon.svgCache.set(url, svg);
      return svg;
    })
    .catch(error => {
      RocketIcon.svgCache.delete(url);
      throw error;
    });
  RocketIcon.svgCache.set(url, promise);
  return promise;
}

/**
 * @param {Document} document
 */
function readManifest(document) {
  if (manifestCache.has(document)) {
    return manifestCache.get(document);
  }
  const script = document.querySelector(
    'script[type="application/json"][data-rocket-icon-manifest]',
  );
  if (!script?.textContent) {
    manifestCache.set(document, null);
    return null;
  }
  try {
    const manifest = JSON.parse(script.textContent);
    if (!manifest || typeof manifest !== 'object' || !isPlainRecord(manifest.icons)) {
      manifestCache.set(document, null);
      warn('rocket-icon Icon Manifest is invalid.');
      return null;
    }
    const defaultLibrary =
      typeof manifest.defaultLibrary === 'string' ? manifest.defaultLibrary : undefined;
    const icons = /** @type {Record<string, string>} */ (manifest.icons);
    manifestCache.set(document, { defaultLibrary, icons });
    return { defaultLibrary, icons };
  } catch (error) {
    manifestCache.set(document, null);
    warn('rocket-icon Icon Manifest could not be parsed.', error);
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainRecord(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * @param {string} message
 * @param {unknown} [error]
 */
function warn(message, error) {
  if (!isDevelopment()) {
    return;
  }
  if (error) {
    console.warn(message, error);
  } else {
    console.warn(message);
  }
}

function isDevelopment() {
  const hostname = globalThis.location?.hostname;
  return (
    !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.test')
  );
}

/**
 * @param {Element} element
 * @param {string} name
 */
function hasNonEmptyAttribute(element, name) {
  return Boolean(element.getAttribute(name)?.trim());
}
