/** @typedef {'markdown' | 'javascript'} LoadedPageModuleKind */
/** @typedef {import('@rocket/js/types.js').Components} Components */
/** @typedef {import('@rocket/js/types.js').JavaScriptPageResult} JavaScriptPageResult */
/** @typedef {import('@rocket/js/types.js').JsPage} JsPage */
/** @typedef {import('@rocket/js/types.js').JsPageContext} JsPageContext */
/** @typedef {(components: Components) => string | Promise<string>} ParseComponents */

/**
 * @param {{
 *   kind: LoadedPageModuleKind;
 *   module: unknown;
 *   parseComponents?: ParseComponents;
 * }} options
 */
export function normalizeLoadedPageModule({ kind, module, parseComponents }) {
  if (kind === 'markdown') {
    return normalizeMarkdownPageModule(module, { parseComponents });
  }
  if (kind === 'javascript') {
    return normalizeJavaScriptPageModule(module, { parseComponents });
  }
  throw new Error(`Unsupported Loaded Page Module kind: ${kind}`);
}

/**
 * @param {unknown} module
 * @param {{ parseComponents?: ParseComponents }} [options]
 */
export function normalizeMarkdownPageModule(module, { parseComponents } = {}) {
  const rawModule =
    /** @type {{ contentFn?: unknown; components?: Components } | null | undefined} */ (module);
  return {
    kind: /** @type {'markdown'} */ ('markdown'),
    contentFn: normalizeMarkdownPageContent(rawModule, { parseComponents }),
  };
}

/**
 * @param {unknown} module
 * @param {{ parseComponents?: ParseComponents }} [options]
 */
export function normalizeJavaScriptPageModule(module, { parseComponents } = {}) {
  return {
    kind: /** @type {'javascript'} */ ('javascript'),
    body: normalizeJavaScriptPageBody(module, { parseComponents }),
  };
}

/**
 * @param {unknown} module
 * @param {{ parseComponents?: ParseComponents }} options
 */
function normalizeJavaScriptPageBody(module, { parseComponents }) {
  const rawModule =
    /** @type {{ default?: unknown; content?: unknown; components?: Components }} */ (module);
  const body = rawModule?.default || rawModule?.content;
  const components = rawModule?.components;
  if (!parseComponents || typeof body !== 'function' || !components) {
    return body;
  }
  const pageBody = /** @type {JsPage} */ (body);
  /** @type {(request: Request, context: JsPageContext) => Promise<JavaScriptPageResult>} */
  const renderHydratedJavaScriptPage = async (request, { params, pageData, adapterContext }) => {
    pageData._hasBrowserLoadedComponents = hasBrowserLoadedComponents(components);
    pageData._hydrationScript = await parseComponents(components);
    return pageBody(request, { params, pageData, adapterContext });
  };
  return renderHydratedJavaScriptPage;
}

/**
 * @param {{ contentFn?: unknown; components?: Components } | null | undefined} rawModule
 * @param {{ parseComponents?: ParseComponents }} options
 */
function normalizeMarkdownPageContent(rawModule, { parseComponents }) {
  const contentFn = rawModule?.contentFn;
  const components = rawModule?.components;
  if (!parseComponents || typeof contentFn !== 'function' || !components) {
    return contentFn;
  }
  /** @type {(pageData: { _hydrationScript?: string; _hasBrowserLoadedComponents?: boolean }, layout: unknown) => Promise<unknown>} */
  const renderMarkdownPage = async (pageData, layout) => {
    pageData._hasBrowserLoadedComponents = hasBrowserLoadedComponents(components);
    pageData._hydrationScript = await parseComponents(components);
    return contentFn(pageData, layout);
  };
  return renderMarkdownPage;
}

/**
 * @param {Components} components
 */
function hasBrowserLoadedComponents(components) {
  return Object.values(components).some(
    component => component.loading === 'client' || component.loading.startsWith('hydrate:'),
  );
}
