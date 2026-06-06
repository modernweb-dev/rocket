import { URLPattern } from 'urlpattern-polyfill';

/** @typedef {import('@rocket/js/types.js').PageRegistry} PageRegistry */
/** @typedef {import('@rocket/js/types.js').Page} Page */
/** @typedef {{ kind: 'standalone-demo'; demoName: string }} StandaloneDemoPageVariant */

/**
 * @param {string} parentUrl
 * @param {string} demoName
 */
export function standaloneDemoUrl(parentUrl, demoName) {
  const url = new URL(parentUrl);
  url.pathname = standaloneDemoPath(url.pathname, demoName);
  url.search = '';
  url.hash = '';
  return url.href;
}

/**
 * @param {string} parentPathname
 * @param {string} demoName
 */
export function standaloneDemoPath(parentPathname, demoName) {
  return `${normalizeDocumentPath(parentPathname)}_demo/${demoName}/`;
}

/**
 * @param {string} parentPathname
 */
export function standaloneDemoRoutePattern(parentPathname) {
  return `${normalizeDocumentPath(parentPathname)}_demo/:demoName/`;
}

/**
 * @param {string} pagePath
 * @param {Page} page
 * @returns {string[]}
 */
export function standaloneDemoPaths(pagePath, page) {
  if (!isMarkdownPage(page)) {
    return [];
  }
  return (page.demoNames || []).map(demoName => standaloneDemoPath(pagePath, demoName));
}

/**
 * @param {string} pagePath
 * @param {Page} page
 * @returns {string[]}
 */
export function standaloneDemoRoutePatterns(pagePath, page) {
  if (!isMarkdownPage(page) || !page.demoNames?.length) {
    return [];
  }
  return [standaloneDemoRoutePattern(pagePath)];
}

/**
 * @param {string} pathname
 * @returns {{ parentPathname: string; demoName: string } | null}
 */
export function parseStandaloneDemoUrl(pathname) {
  if (!pathname.endsWith('/')) {
    return null;
  }
  const segments = pathname.split('/');
  const marker = segments[segments.length - 3];
  const demoName = segments[segments.length - 2];
  if (marker !== '_demo' || !demoName) {
    return null;
  }
  const parentPathname = segments.slice(0, -3).join('/') || '/';
  return { parentPathname, demoName };
}

/**
 * @param {string} pathname
 * @param {string} origin
 * @param {PageRegistry} pages
 * @returns {{ page: Page; routePath: string; params: Record<string, string | undefined>; variant: StandaloneDemoPageVariant } | null}
 */
export function matchStandaloneDemoUrl(pathname, origin, pages) {
  const standaloneDemo = parseStandaloneDemoUrl(pathname);
  if (!standaloneDemo) {
    return null;
  }

  for (const [routePath, page] of pages) {
    if (!isMarkdownPage(page) || !page.demoNames?.includes(standaloneDemo.demoName)) {
      continue;
    }
    for (const parentPathname of parentPathnameCandidates(standaloneDemo.parentPathname)) {
      const match = matchPagePath(parentPathname, origin, routePath);
      if (match) {
        return {
          page,
          routePath,
          params: match.pathname.groups,
          variant: { kind: 'standalone-demo', demoName: standaloneDemo.demoName },
        };
      }
    }
  }
  return null;
}

/**
 * @param {string} pagePath
 */
export function normalizeDocumentPath(pagePath) {
  let path = pagePath;
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path;
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
 * @param {string} parentPathname
 */
function parentPathnameCandidates(parentPathname) {
  const documentPath = normalizeDocumentPath(parentPathname);
  if (documentPath === parentPathname) {
    return [parentPathname];
  }
  return [parentPathname, documentPath];
}

/**
 * @param {Page} page
 */
function isMarkdownPage(page) {
  return !page.file.endsWith('.js');
}
