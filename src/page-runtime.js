import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { URLPattern } from 'urlpattern-polyfill';
import { layout, singleDemoLayout } from './layouts/layout.js';
import { PageData } from './PageData.js';
import { finalizeRocketIcons } from './icons.js';
import { matchPaginatedArchivePath, pageDataWithPagination } from './page-pagination.js';
import { matchStandaloneDemoUrl } from './standalone-demo-url.js';

/** @typedef {import('@rocket/js/types.js').PageRegistry} PageRegistry */
/** @typedef {{ file: string; module: import('@rocket/js/types.js').Module; metadata: import('@rocket/js/types.js').PageMetadata; demoNames?: string[] }} Page */
/** @typedef {'default' | { kind: 'standalone-demo'; demoName: string } | { kind: 'paginated-archive'; pageNumber: number }} PageVariant */
/** @typedef {{ kind: 'javascript'; body: unknown }} LoadedJavaScriptPageModule */
/** @typedef {{ kind: 'markdown'; contentFn: unknown }} LoadedMarkdownPageModule */
/** @typedef {LoadedJavaScriptPageModule | LoadedMarkdownPageModule} LoadedPageModule */
/** @typedef {{ page: Page; routePath: string; request: Request; variant: PageVariant }} PageModuleLoaderOptions */
/** @typedef {{ load(options: PageModuleLoaderOptions): LoadedPageModule | Promise<LoadedPageModule> }} PageModuleLoader */
/** @typedef {import('@rocket/js/types.js').UrlLifecycleConfig} UrlLifecycleConfig */
/** @typedef {import('@rocket/js/types.js').RedirectConfig} RedirectConfig */
/** @typedef {'INVALID_PAGE_MODULE' | 'PAGE_RENDER_FAILED'} PageRuntimeErrorCode */

export class PageRuntimeError extends Error {
  /**
   * @param {PageRuntimeErrorCode} code
   * @param {string} message
   * @param {{ cause?: unknown; page?: Page; routePath?: string }} [options]
   */
  constructor(code, message, options = {}) {
    super(message, { cause: options.cause });
    this.name = 'PageRuntimeError';
    this.code = code;
    this.page = options.page;
    this.routePath = options.routePath;
  }
}

export class PageRuntime {
  /**
   * @param {{
   *   pages: PageRegistry;
   *   pageModuleLoader: PageModuleLoader;
   *   urlLifecycle?: UrlLifecycleConfig;
   *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
   *   siteOrigin?: string;
   *   defaultSocialPreviewImages?: Map<string, string>;
   *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
   *   defaultIconLibrary?: string;
   *   iconAssetStore?: import('./icons.js').IconAssetStore;
   * }} options
   */
  constructor({
    pages,
    pageModuleLoader,
    urlLifecycle,
    siteHeadMetadata,
    siteOrigin,
    defaultSocialPreviewImages,
    iconLibraries,
    defaultIconLibrary,
    iconAssetStore,
  }) {
    this.pages = pages;
    this.pageModuleLoader = pageModuleLoader;
    this.urlLifecycle = urlLifecycle;
    this.siteHeadMetadata = siteHeadMetadata;
    this.siteOrigin = siteOrigin;
    this.defaultSocialPreviewImages = defaultSocialPreviewImages;
    this.iconLibraries = iconLibraries;
    this.defaultIconLibrary = defaultIconLibrary;
    this.iconAssetStore = iconAssetStore;
  }

  /**
   * @param {Request} request
   * @param {{ adapterContext?: unknown }} [options]
   * @returns {Promise<Response>}
   */
  async render(request, { adapterContext } = {}) {
    const url = new URL(request.url);
    const redirect = findRedirect(url.pathname, this.urlLifecycle?.redirects);
    if (redirect) {
      return new Response(null, {
        status: redirect.status || 308,
        headers: {
          location: redirect.target,
        },
      });
    }

    const pageMatch = findPage(url.pathname, url.origin, this.pages);
    if (!pageMatch) {
      return new Response('Page not found', { status: 404 });
    }

    const variant = pageMatch.variant;
    const loadedPageModule = await this.pageModuleLoader.load({
      page: pageMatch.page,
      routePath: pageMatch.routePath,
      request,
      variant,
    });
    if (loadedPageModule.kind === 'javascript') {
      return renderJavaScriptPage({
        loadedPageModule,
        request,
        pages: this.pages,
        page: pageMatch.page,
        routePath: pageMatch.routePath,
        params: pageMatch.params,
        pathname: url.pathname,
        variant,
        siteHeadMetadata: this.siteHeadMetadata,
        siteOrigin: this.siteOrigin,
        defaultSocialPreviewImages: this.defaultSocialPreviewImages,
        iconLibraries: this.iconLibraries,
        defaultIconLibrary: this.defaultIconLibrary,
        iconAssetStore: this.iconAssetStore,
        adapterContext,
      });
    }
    if (loadedPageModule.kind === 'markdown') {
      return renderMarkdownPage({
        loadedPageModule,
        pages: this.pages,
        page: pageMatch.page,
        routePath: pageMatch.routePath,
        pathname: url.pathname,
        variant,
        siteHeadMetadata: this.siteHeadMetadata,
        siteOrigin: this.siteOrigin,
        defaultSocialPreviewImages: this.defaultSocialPreviewImages,
        iconLibraries: this.iconLibraries,
        defaultIconLibrary: this.defaultIconLibrary,
        iconAssetStore: this.iconAssetStore,
      });
    }

    throw new Error('Unsupported Page module kind');
  }
}

/**
 * @param {string} pathname
 * @param {RedirectConfig[] | undefined} redirects
 */
function findRedirect(pathname, redirects = []) {
  return redirects.find(redirect => redirect.source === pathname);
}

/**
 * @param {{
 *   loadedPageModule: LoadedJavaScriptPageModule;
 *   request: Request;
 *   pages: PageRegistry;
 *   page: Page;
 *   routePath: string;
 *   params: Record<string, string | undefined>;
 *   pathname: string;
 *   variant: PageVariant;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   defaultSocialPreviewImages?: Map<string, string>;
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   iconAssetStore?: import('./icons.js').IconAssetStore;
 *   adapterContext: unknown;
 * }} options
 */
async function renderJavaScriptPage({
  loadedPageModule,
  request,
  pages,
  page,
  routePath,
  params,
  pathname,
  variant,
  siteHeadMetadata,
  siteOrigin,
  defaultSocialPreviewImages,
  iconLibraries,
  defaultIconLibrary,
  iconAssetStore,
  adapterContext,
}) {
  const body = loadedPageModule.body;
  if (typeof body === 'function') {
    const pageData = pageDataWithPagination({
      pages,
      page,
      pagePath: routePath,
      pathname,
      currentPage: archivePageNumber(variant),
      siteHeadMetadata,
      siteOrigin,
      defaultSocialPreviewImages,
    });
    /** @type {unknown} */
    let result;
    try {
      result = await body(request, { params, pageData, adapterContext });
    } catch (error) {
      if (error instanceof PageRuntimeError) {
        throw error;
      }
      throw new PageRuntimeError(
        'PAGE_RENDER_FAILED',
        `Failed to render JavaScript Page ${page.file}`,
        {
          cause: error,
          page,
          routePath,
        },
      );
    }
    return finalizeHtmlResponse(normalizeJavaScriptPageResult(result), pageData, {
      iconLibraries,
      defaultIconLibrary,
      iconAssetStore,
    });
  }
  if (body instanceof Response) {
    return body;
  }
  throw new PageRuntimeError(
    'INVALID_PAGE_MODULE',
    `Invalid JavaScript Page module ${page.file}: default or content export must be a function or Response`,
    { page, routePath },
  );
}

/**
 * @param {{
 *   loadedPageModule: LoadedMarkdownPageModule;
 *   pages: PageRegistry;
 *   page: Page;
 *   routePath: string;
 *   pathname: string;
 *   variant: PageVariant;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   defaultSocialPreviewImages?: Map<string, string>;
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   iconAssetStore?: import('./icons.js').IconAssetStore;
 * }} options
 */
async function renderMarkdownPage({
  loadedPageModule,
  pages,
  page,
  routePath,
  pathname,
  variant,
  siteHeadMetadata,
  siteOrigin,
  defaultSocialPreviewImages,
  iconLibraries,
  defaultIconLibrary,
  iconAssetStore,
}) {
  const contentFn = loadedPageModule.contentFn;
  if (typeof contentFn !== 'function') {
    throw new PageRuntimeError(
      'INVALID_PAGE_MODULE',
      `Invalid Markdown Page module ${page.file}: contentFn export must be a function`,
      { page, routePath },
    );
  }
  const pageData = new PageData(pages, page.metadata, pathname, {
    siteHeadMetadata,
    pageSiteHeadMetadata: page.module.config.siteHeadMetadata,
    defaultSocialPreviewImage: defaultSocialPreviewImages?.get(pathname),
    siteOrigin,
  });
  if (page.module.config.iconReferences) {
    pageData.addIconReferences(page.module.config.iconReferences);
  }
  /** @type {string} */
  let body;
  try {
    const content = await contentFn(pageData, layoutForPageVariant(variant));
    body = await collectResult(content);
  } catch (error) {
    if (error instanceof PageRuntimeError) {
      throw error;
    }
    throw new PageRuntimeError(
      'PAGE_RENDER_FAILED',
      `Failed to render Markdown Page ${page.file}`,
      {
        cause: error,
        page,
        routePath,
      },
    );
  }
  const finalizedBody = await finalizeRocketIcons(body, {
    pageData,
    iconLibraries,
    defaultIconLibrary,
    iconAssetStore,
  });
  return new Response(finalizedBody, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

/**
 * @param {unknown} result
 * @returns {Response}
 */
export function normalizeJavaScriptPageResult(result) {
  if (result instanceof Response) {
    return result;
  }
  if (result === null || result === undefined) {
    return new Response(null);
  }
  if (typeof result === 'string') {
    return new Response(result, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  return Response.json(result);
}

/**
 * @param {Response} response
 * @param {PageData} pageData
 * @param {{
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   iconAssetStore?: import('./icons.js').IconAssetStore;
 * }} options
 */
async function finalizeHtmlResponse(
  response,
  pageData,
  { iconLibraries, defaultIconLibrary, iconAssetStore },
) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('text/html')) {
    return response;
  }

  const body = await response.text();
  const finalizedBody = await finalizeRocketIcons(body, {
    pageData,
    iconLibraries,
    defaultIconLibrary,
    iconAssetStore,
  });
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(finalizedBody, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * @param {string} pathname
 * @param {string} origin
 * @param {PageRegistry} pages
 * @returns {{ page: Page; routePath: string; params: Record<string, string | undefined>; variant: PageVariant } | null}
 */
function findPage(pathname, origin, pages) {
  const exactPage = findExactPage(pathname, pages);
  if (exactPage) {
    return { ...exactPage, params: {}, variant: 'default' };
  }

  const standaloneDemoMatch = matchStandaloneDemoUrl(pathname, origin, pages);
  if (standaloneDemoMatch) {
    return standaloneDemoMatch;
  }

  const paginatedArchiveMatch = matchPaginatedArchivePath(pathname, origin, pages);
  if (paginatedArchiveMatch) {
    return {
      page: paginatedArchiveMatch.page,
      routePath: paginatedArchiveMatch.routePath,
      params: paginatedArchiveMatch.params,
      variant: {
        kind: 'paginated-archive',
        pageNumber: paginatedArchiveMatch.pageNumber,
      },
    };
  }

  const matchPathnames = pageMatchPathnames(pathname);
  for (const [routePath, page] of pages) {
    for (const matchPathname of matchPathnames) {
      const match = matchPagePath(matchPathname, origin, routePath);
      if (match) {
        return { page, routePath, params: match.pathname.groups, variant: 'default' };
      }
    }
  }
  return null;
}

/**
 * @param {string} pathname
 * @param {PageRegistry} pages
 * @returns {{ page: Page; routePath: string } | null}
 */
function findExactPage(pathname, pages) {
  const exactPage = pages.get(pathname);
  if (exactPage) {
    return { page: exactPage, routePath: pathname };
  }
  const configuredDocumentPath = configuredDocumentPathFromRequest(pathname);
  if (configuredDocumentPath === pathname) {
    return null;
  }
  const documentPage = pages.get(configuredDocumentPath);
  return documentPage ? { page: documentPage, routePath: configuredDocumentPath } : null;
}

/**
 * @param {string} pathname
 * @returns {string[]}
 */
function pageMatchPathnames(pathname) {
  const configuredDocumentPath = configuredDocumentPathFromRequest(pathname);
  return configuredDocumentPath === pathname ? [pathname] : [pathname, configuredDocumentPath];
}

/**
 * @param {string} pathname
 */
function configuredDocumentPathFromRequest(pathname) {
  if (pathname === '/' || !pathname.endsWith('/')) {
    return pathname;
  }
  const withoutTrailingSlash = pathname.slice(0, -1);
  if (isFilePath(withoutTrailingSlash)) {
    return pathname;
  }
  return withoutTrailingSlash || '/';
}

/**
 * @param {string} pathname
 */
function isFilePath(pathname) {
  const segment = pathname.split('/').at(-1) || '';
  return /\.[^/.]+$/.test(segment);
}

/**
 * @param {PageVariant} variant
 */
function archivePageNumber(variant) {
  if (typeof variant === 'object' && variant.kind === 'paginated-archive') {
    return variant.pageNumber;
  }
  return 1;
}

/**
 * @param {string} pathname
 * @param {string} origin
 * @param {string} routePath
 */
function matchPagePath(pathname, origin, routePath) {
  const pattern = new URLPattern({ pathname: routePath });
  return pattern.exec(pathname, origin);
}

/**
 * @param {PageVariant} variant
 */
function layoutForPageVariant(variant) {
  if (typeof variant === 'object' && variant.kind === 'standalone-demo') {
    return singleDemoLayout;
  }
  return layout;
}
