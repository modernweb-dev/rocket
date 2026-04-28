import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  hasPagePagination,
  paginatedArchivePath,
  paginatedArchivePaths,
} from './page-pagination.js';

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   outDir: string;
 *   config: import('@rocket/js/types.js').ResolvedRocketConfig;
 * }} options
 */
export function writeSiteDiscoverabilityOutputs({ pages, outDir, config }) {
  const shouldWriteSitemap = config.siteDiscoverability?.sitemap === true;
  const shouldWriteRobots = config.siteDiscoverability?.robots === true;
  if (!shouldWriteSitemap && !shouldWriteRobots) {
    return;
  }

  const siteOrigin = requireSiteOrigin(
    config.siteOrigin,
    shouldWriteSitemap ? 'Sitemap' : 'Robots File',
  );
  mkdirSync(outDir, { recursive: true });
  if (shouldWriteSitemap) {
    writeFileSync(path.join(outDir, 'sitemap.xml'), createSitemap({ pages, siteOrigin }));
  }
  if (shouldWriteRobots) {
    writeFileSync(path.join(outDir, 'robots.txt'), createRobotsFile({ pages, siteOrigin }));
  }
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   siteOrigin: string;
 * }} options
 */
export function createSitemap({ pages, siteOrigin }) {
  const locations = sitemapPageLocations({ pages, siteOrigin });
  const urls = locations
    .map(location => ['  <url>', `    <loc>${escapeXml(location)}</loc>`, '  </url>'].join('\n'))
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * @param {{
 *   pages?: import('@rocket/js/types.js').PageRegistry;
 *   siteOrigin: string;
 * }} options
 */
export function createRobotsFile({ pages = new Map(), siteOrigin }) {
  const sitemapUrl = new URL('/sitemap.xml', `${siteOrigin}/`).href;
  const disallowDirectives = robotsDisallowPaths({ pages })
    .map(pagePath => `Disallow: ${pagePath}`)
    .sort();

  if (disallowDirectives.length === 0) {
    return `Sitemap: ${sitemapUrl}\n`;
  }

  return ['User-agent: *', ...disallowDirectives, '', `Sitemap: ${sitemapUrl}`, ''].join('\n');
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   siteOrigin: string;
 * }} options
 */
function sitemapPageLocations({ pages, siteOrigin }) {
  return Array.from(pages.entries())
    .filter(([pagePath, page]) => {
      return !hasPathParameter(pagePath) && page.module.config.discoverability?.sitemap !== false;
    })
    .flatMap(([pagePath, page]) => discoverabilityPagePaths({ pages, pagePath, page }))
    .map(pagePath => absolutePageUrl(siteOrigin, pagePath))
    .sort();
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 * }} options
 */
function robotsDisallowPaths({ pages }) {
  return Array.from(pages.entries())
    .filter(([, page]) => page.module.config.discoverability?.robots === 'disallow')
    .flatMap(([pagePath, page]) => discoverabilityPagePaths({ pages, pagePath, page }));
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   pagePath: string;
 *   page: import('@rocket/js/types.js').Page;
 * }} options
 */
function discoverabilityPagePaths({ pages, pagePath, page }) {
  if (!hasPagePagination(page)) {
    return [pagePath];
  }
  return [paginatedArchivePath(pagePath, 1), ...paginatedArchivePaths({ pages, page, pagePath })];
}

/**
 * @param {string | undefined} siteOrigin
 * @param {'Sitemap' | 'Robots File'} outputName
 */
function requireSiteOrigin(siteOrigin, outputName) {
  if (typeof siteOrigin !== 'string' || siteOrigin.trim() === '') {
    throw new Error(
      `Site Discoverability ${outputName} requires a Site Origin. ` +
        `Add siteOrigin: 'https://example.com' to rocket-config.js.`,
    );
  }
  return normalizeSiteOrigin(siteOrigin);
}

/**
 * @param {string} siteOrigin
 */
function normalizeSiteOrigin(siteOrigin) {
  let url;
  try {
    url = new URL(siteOrigin);
  } catch {
    throw invalidSiteOriginError(siteOrigin);
  }

  if (url.origin === 'null' || url.pathname !== '/' || url.search || url.hash) {
    throw invalidSiteOriginError(siteOrigin);
  }
  return url.origin;
}

/**
 * @param {string} siteOrigin
 */
function invalidSiteOriginError(siteOrigin) {
  return new Error(
    `Invalid Site Origin ${JSON.stringify(siteOrigin)}. ` +
      `Use an absolute origin such as 'https://example.com'.`,
  );
}

/**
 * @param {string} siteOrigin
 * @param {string} pagePath
 */
function absolutePageUrl(siteOrigin, pagePath) {
  const pathname = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return new URL(pathname, `${siteOrigin}/`).href;
}

/**
 * @param {string} pagePath
 */
function hasPathParameter(pagePath) {
  return /(^|\/):[^/]+/.test(pagePath);
}

/**
 * @param {string} value
 */
function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
