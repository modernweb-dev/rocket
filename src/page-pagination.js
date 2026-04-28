import { URLPattern } from 'urlpattern-polyfill';
import { PageData } from './PageData.js';
import { normalizeDocumentPath } from './standalone-demo-url.js';

/** @typedef {import('@rocket/js/types.js').Page} Page */
/** @typedef {import('@rocket/js/types.js').PagePagination} PagePagination */
/** @typedef {import('@rocket/js/types.js').PagePaginationConfig} PagePaginationConfig */
/** @typedef {import('@rocket/js/types.js').PagePaginationDeclaration} PagePaginationDeclaration */
/** @typedef {import('@rocket/js/types.js').PageRegistry} PageRegistry */

/**
 * @param {Page} page
 */
export function hasPagePagination(page) {
  return isJavaScriptPage(page) && page.module.pagination !== undefined;
}

/**
 * @param {{
 *   pages: PageRegistry;
 *   page: Page;
 *   pagePath: string;
 *   pathname: string;
 *   currentPage: number;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   defaultSocialPreviewImages?: Map<string, string>;
 * }} options
 * @returns {PageData}
 */
export function pageDataWithPagination({
  pages,
  page,
  pagePath,
  pathname,
  currentPage,
  siteHeadMetadata,
  siteOrigin,
  defaultSocialPreviewImages,
}) {
  const pageData = new PageData(pages, page.metadata, pathname, {
    siteHeadMetadata,
    pageSiteHeadMetadata: page.module.config.siteHeadMetadata,
    defaultSocialPreviewImage: defaultSocialPreviewImages?.get(pathname),
    siteOrigin,
  });
  if (page.module.config.iconReferences) {
    pageData.addIconReferences(page.module.config.iconReferences);
  }
  if (!hasPagePagination(page)) {
    return pageData;
  }
  pageData.pagination = createPagePagination({
    declaration: /** @type {PagePaginationDeclaration} */ (page.module.pagination),
    pageData,
    pagePath,
    currentPage,
  });
  return pageData;
}

/**
 * @param {{
 *   pages: PageRegistry;
 *   page: Page;
 *   pagePath: string;
 * }} options
 * @returns {string[]}
 */
export function paginatedArchivePaths({ pages, page, pagePath }) {
  if (!hasPagePagination(page)) {
    return [];
  }
  const pageCount = pagePaginationPageCount({ pages, page, pagePath });
  const paths = [];
  for (let pageNumber = 2; pageNumber <= pageCount; pageNumber += 1) {
    paths.push(paginatedArchivePath(pagePath, pageNumber));
  }
  return paths;
}

/**
 * @param {string} pagePath
 * @param {number} pageNumber
 */
export function paginatedArchivePath(pagePath, pageNumber) {
  if (pageNumber === 1) {
    return normalizeDocumentPath(pagePath);
  }
  return `${normalizeDocumentPath(pagePath)}${pageNumber}/`;
}

/**
 * @param {string} pathname
 * @param {string} origin
 * @param {PageRegistry} pages
 * @returns {{ page: Page; routePath: string; params: Record<string, string | undefined>; pageNumber: number } | null}
 */
export function matchPaginatedArchivePath(pathname, origin, pages) {
  const archivePath = parsePaginatedArchivePath(pathname);
  if (!archivePath) {
    return null;
  }

  for (const [routePath, page] of pages) {
    if (!hasPagePagination(page)) {
      continue;
    }
    const match =
      matchPagePath(archivePath.parentPathname, origin, routePath) ||
      matchPagePath(normalizeDocumentPath(archivePath.parentPathname), origin, routePath);
    if (!match) {
      continue;
    }
    const pageCount = pagePaginationPageCount({ pages, page, pagePath: routePath });
    if (archivePath.pageNumber > pageCount) {
      continue;
    }
    return {
      page,
      routePath,
      params: match.pathname.groups,
      pageNumber: archivePath.pageNumber,
    };
  }
  return null;
}

/**
 * @param {{
 *   pages: PageRegistry;
 *   page: Page;
 *   pagePath: string;
 * }} options
 */
function pagePaginationPageCount({ pages, page, pagePath }) {
  const pageData = pageDataWithPagination({
    pages,
    page,
    pagePath,
    pathname: pagePath,
    currentPage: 1,
  });
  return pageData.pagination?.totalPages || 1;
}

/**
 * @param {{
 *   declaration: PagePaginationDeclaration;
 *   pageData: PageData;
 *   pagePath: string;
 *   currentPage: number;
 * }} options
 * @returns {PagePagination}
 */
function createPagePagination({ declaration, pageData, pagePath, currentPage }) {
  const config = normalizePagePaginationConfig(
    typeof declaration === 'function' ? declaration(pageData) : declaration,
  );
  const totalPages = Math.max(1, Math.ceil(config.collection.length / config.pageSize));
  const basePath = normalizeDocumentPath(pagePath);
  const firstItemIndex = (currentPage - 1) * config.pageSize;
  const items = config.collection.slice(firstItemIndex, firstItemIndex + config.pageSize);

  return {
    items,
    currentPage,
    totalPages,
    basePath,
    ...(currentPage < totalPages
      ? { nextPath: paginatedArchivePath(pagePath, currentPage + 1) }
      : {}),
    ...(currentPage > 1 ? { previousPath: paginatedArchivePath(pagePath, currentPage - 1) } : {}),
  };
}

/**
 * @param {unknown} config
 * @returns {PagePaginationConfig}
 */
function normalizePagePaginationConfig(config) {
  if (!isPagePaginationConfig(config)) {
    throw new Error('Page pagination must return a collection array and a positive pageSize');
  }
  return config;
}

/**
 * @param {unknown} config
 * @returns {config is PagePaginationConfig}
 */
function isPagePaginationConfig(config) {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  const paginationConfig = /** @type {Record<string, unknown>} */ (config);
  return (
    Array.isArray(paginationConfig.collection) &&
    typeof paginationConfig.pageSize === 'number' &&
    Number.isInteger(paginationConfig.pageSize) &&
    paginationConfig.pageSize > 0
  );
}

/**
 * @param {string} pathname
 * @returns {{ parentPathname: string; pageNumber: number } | null}
 */
function parsePaginatedArchivePath(pathname) {
  if (!pathname.endsWith('/')) {
    return null;
  }
  const segments = pathname.split('/');
  const pageNumberSegment = segments[segments.length - 2];
  if (!/^[1-9]\d*$/.test(pageNumberSegment)) {
    return null;
  }
  const pageNumber = Number(pageNumberSegment);
  if (pageNumber === 1) {
    return null;
  }
  const parentPathname = segments.slice(0, -2).join('/') || '/';
  return { parentPathname, pageNumber };
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
 * @param {Page} page
 */
function isJavaScriptPage(page) {
  return page.file.endsWith('.js');
}
