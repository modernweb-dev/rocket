import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { URLPattern } from 'urlpattern-polyfill';
import { paginatedArchivePaths } from './page-pagination.js';
import { normalizeDocumentPath, standaloneDemoPaths } from './standalone-demo-url.js';
import { needsDefaultSocialPreviewImage, publicSocialPreviewPages } from './socialPreviewImages.js';

export const PUBLIC_ASSETS_DIR = 'public';

/**
 * @typedef {{
 *   file: string;
 *   relativePath: string;
 *   publicPath: string;
 * }} PublicAsset
 */

/**
 * @param {string} [projectRoot]
 * @returns {PublicAsset[]}
 */
export function discoverPublicAssets(projectRoot = process.cwd()) {
  const publicDir = path.join(projectRoot, PUBLIC_ASSETS_DIR);
  if (!existsSync(publicDir)) {
    return [];
  }
  const publicDirStats = lstatSync(publicDir);
  if (publicDirStats.isSymbolicLink()) {
    throw new Error(
      `Public Assets directory ${PUBLIC_ASSETS_DIR} is a symbolic link. ` +
        `Public Assets must be regular files.`,
    );
  }
  if (!publicDirStats.isDirectory()) {
    throw new Error(`Public Assets directory ${PUBLIC_ASSETS_DIR} must be a directory.`);
  }

  /** @type {PublicAsset[]} */
  const assets = [];
  collectPublicAssets({ publicDir, directory: publicDir, relativeDirectory: '', assets });
  return assets.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

/**
 * @param {{
 *   projectRoot: string;
 *   outDir: string;
 * }} options
 */
export function assertPublicAssetsOutputDir({ projectRoot, outDir }) {
  const publicDir = path.resolve(projectRoot, PUBLIC_ASSETS_DIR);
  const resolvedOutDir = path.resolve(outDir);
  if (resolvedOutDir === publicDir || resolvedOutDir.startsWith(`${publicDir}${path.sep}`)) {
    throw new Error(
      `Invalid build output directory ${outDir}. ` +
        `The ${PUBLIC_ASSETS_DIR} directory is reserved for Public Assets.`,
    );
  }
}

/**
 * @param {{
 *   publicDir: string;
 *   directory: string;
 *   relativeDirectory: string;
 *   assets: PublicAsset[];
 * }} options
 */
function collectPublicAssets({ publicDir, directory, relativeDirectory, assets }) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    const file = path.join(publicDir, ...relativePath.split('/'));

    if (entry.isSymbolicLink()) {
      throw new Error(
        `Public Asset ${PUBLIC_ASSETS_DIR}/${relativePath} is a symbolic link. ` +
          `Public Assets must be regular files.`,
      );
    }

    if (isExcludedDotPath(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      collectPublicAssets({
        publicDir,
        directory: file,
        relativeDirectory: relativePath,
        assets,
      });
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(
        `Public Asset ${PUBLIC_ASSETS_DIR}/${relativePath} is not a regular file. ` +
          `Public Assets must be regular files.`,
      );
    }

    assets.push({
      file,
      relativePath,
      publicPath: `/${relativePath}`,
    });
  }
}

/**
 * @param {string} relativePath
 */
function isExcludedDotPath(relativePath) {
  if (relativePath === '.well-known' || relativePath.startsWith('.well-known/')) {
    return false;
  }
  return relativePath.split('/').some(segment => segment.startsWith('.'));
}

/**
 * @param {{
 *   publicAssets: PublicAsset[];
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   generatedPages: import('@rocket/js/types.js').PageRegistry;
 *   config: import('@rocket/js/types.js').ResolvedRocketConfig;
 *   emitRedirectFallbacks?: boolean;
 * }} options
 */
export function validatePublicAssetCollisions({
  publicAssets,
  pages,
  generatedPages,
  config,
  emitRedirectFallbacks = true,
}) {
  assertNoDuplicatePublicAssetPaths(publicAssets);

  const generatedClaims = generatedOutputClaims({
    pages,
    generatedPages,
    config,
    emitRedirectFallbacks,
  });

  for (const asset of publicAssets) {
    for (const requestPath of publicAssetRequestPaths(asset)) {
      const pageCollision = matchingPage(requestPath, pages);
      if (pageCollision) {
        throw new Error(
          `Public Asset ${PUBLIC_ASSETS_DIR}/${asset.relativePath} collides with configured ` +
            `Page ${pageCollision.page.file} at ${pageCollision.routePath}.`,
        );
      }

      const generatedCollision =
        generatedClaims.get(requestPath) ||
        generatedClaims.get(normalizeDirectoryRequestPath(requestPath));
      if (generatedCollision) {
        throw new Error(
          `Public Asset ${PUBLIC_ASSETS_DIR}/${asset.relativePath} collides with ` +
            `${generatedCollision} at ${requestPath}.`,
        );
      }
    }
  }
}

/**
 * @param {string} requestPath
 */
function normalizeDirectoryRequestPath(requestPath) {
  return requestPath.endsWith('/') ? requestPath : `${path.dirname(requestPath)}/`;
}

/**
 * @param {PublicAsset[]} publicAssets
 */
function assertNoDuplicatePublicAssetPaths(publicAssets) {
  const claimedPaths = new Map();
  for (const asset of publicAssets) {
    for (const requestPath of publicAssetRequestPaths(asset)) {
      const existing = claimedPaths.get(requestPath);
      if (existing) {
        throw new Error(
          `Public Asset ${PUBLIC_ASSETS_DIR}/${asset.relativePath} collides with Public Asset ` +
            `${PUBLIC_ASSETS_DIR}/${existing.relativePath} at ${requestPath}.`,
        );
      }
      claimedPaths.set(requestPath, asset);
    }
  }
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   generatedPages: import('@rocket/js/types.js').PageRegistry;
 *   config: import('@rocket/js/types.js').ResolvedRocketConfig;
 *   emitRedirectFallbacks: boolean;
 * }} options
 * @returns {Map<string, string>}
 */
function generatedOutputClaims({ pages, generatedPages, config, emitRedirectFallbacks }) {
  const claims = new Map();

  for (const [pagePath, page] of generatedPages) {
    for (const demoPath of standaloneDemoPaths(pagePath, page)) {
      claims.set(normalizeDocumentPath(demoPath), `Standalone Demo URL ${demoPath}`);
    }
    for (const archivePath of paginatedArchivePaths({ pages, page, pagePath })) {
      claims.set(normalizeDocumentPath(archivePath), `generated archive Page ${archivePath}`);
    }
  }

  for (const [pagePath, page] of publicSocialPreviewPages(pages)) {
    if (
      needsDefaultSocialPreviewImage({
        pagePath,
        page,
        siteHeadMetadata: config.siteHeadMetadata,
      })
    ) {
      claims.set('/_rocket/social-preview/', `Default Social Preview Image for Page ${pagePath}`);
    }
  }

  for (const redirect of config.urlLifecycle?.redirects || []) {
    claims.set(redirect.source, `Redirect source ${redirect.source}`);
    if (emitRedirectFallbacks && !isFileOutputPath(redirect.source)) {
      claims.set(normalizeDocumentPath(redirect.source), `Redirect fallback ${redirect.source}`);
    }
  }

  if (config.siteDiscoverability?.sitemap === true) {
    claims.set('/sitemap.xml', 'generated Sitemap');
  }
  if (config.siteDiscoverability?.robots === true) {
    claims.set('/robots.txt', 'generated Robots File');
  }
  if (config.adapter?.name === 'netlify' && config.urlLifecycle?.redirects?.length) {
    claims.set('/_redirects', 'Netlify Redirect output');
  }

  return claims;
}

/**
 * @param {string} requestPath
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 */
function matchingPage(requestPath, pages) {
  for (const [routePath, page] of pages) {
    const pattern = new URLPattern({ pathname: routePath });
    if (pattern.exec(requestPath, 'http://localhost')) {
      return { routePath, page };
    }
  }
  return undefined;
}

/**
 * @param {PublicAsset} asset
 * @returns {string[]}
 */
export function publicAssetRequestPaths(asset) {
  const requestPaths = new Set([asset.publicPath]);
  if (isIndexHtmlPath(asset.relativePath)) {
    const documentPath = indexHtmlDocumentPath(asset.relativePath);
    requestPaths.add(documentPath);
    if (documentPath !== '/') {
      requestPaths.add(documentPath.slice(0, -1));
    }
  }
  return Array.from(requestPaths);
}

/**
 * @param {string} relativePath
 */
function isIndexHtmlPath(relativePath) {
  return relativePath === 'index.html' || relativePath.endsWith('/index.html');
}

/**
 * @param {string} relativePath
 */
function indexHtmlDocumentPath(relativePath) {
  if (relativePath === 'index.html') {
    return '/';
  }
  return normalizeDocumentPath(`/${relativePath.slice(0, -'/index.html'.length)}`);
}

/**
 * @param {{
 *   publicAssets: PublicAsset[];
 *   outDir: string;
 * }} options
 */
export function copyPublicAssets({ publicAssets, outDir }) {
  for (const asset of publicAssets) {
    const destination = path.join(outDir, ...asset.relativePath.split('/'));
    if (existsSync(destination)) {
      throw new Error(
        `Public Asset ${PUBLIC_ASSETS_DIR}/${asset.relativePath} collides with generated ` +
          `output ${asset.publicPath}.`,
      );
    }
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(asset.file, destination);
  }
}

/**
 * @param {PublicAsset[]} publicAssets
 * @param {string} requestPath
 * @returns {PublicAsset | undefined}
 */
export function findPublicAsset(publicAssets, requestPath) {
  return publicAssets.find(asset => publicAssetRequestPaths(asset).includes(requestPath));
}

/**
 * @param {PublicAsset} asset
 */
export function readPublicAsset(asset) {
  return readFileSync(asset.file);
}

/**
 * @param {string} pagePath
 * @returns {boolean}
 */
function isFileOutputPath(pagePath) {
  return path.extname(pagePath) !== '';
}
