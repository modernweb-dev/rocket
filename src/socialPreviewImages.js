import chromium from '@sparticuz/chromium';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import {
  DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
  defaultSocialPreviewTemplate,
} from './defaultSocialPreviewTemplate.js';
import { paginatedArchivePaths } from './page-pagination.js';
import { normalizeDocumentPath } from './standalone-demo-url.js';
import { createSiteHeadMetadata } from './siteHeadMetadata.js';

export {
  DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
  defaultSocialPreviewTemplate,
} from './defaultSocialPreviewTemplate.js';

const LOCAL_BROWSER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];
const SOCIAL_PREVIEW_RENDERER_VERSION = '1';

/**
 * @typedef {{
 *   html: string;
 *   width: number;
 *   height: number;
 *   pathname: string;
 * }} SocialPreviewCaptureOptions
 */

/**
 * @typedef {(options: SocialPreviewCaptureOptions) => Promise<Uint8Array> | Uint8Array} SocialPreviewCapture
 */

/**
 * @typedef {{
 *   publicPath: string;
 *   publicUrl: string;
 *   data: Uint8Array;
 * }} DefaultSocialPreviewImageOutput
 */

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   cacheDirectory?: string;
 *   captureSocialPreviewImage?: SocialPreviewCapture;
 * }} options
 * @returns {Promise<Map<string, DefaultSocialPreviewImageOutput>>}
 */
export async function generateStaticDefaultSocialPreviewImages({
  pages,
  siteHeadMetadata,
  siteOrigin,
  cacheDirectory,
  captureSocialPreviewImage = captureSocialPreviewImageWithBrowser,
}) {
  /** @type {Map<string, DefaultSocialPreviewImageOutput>} */
  const outputs = new Map();
  if (!siteHeadMetadata || !hasStaticSocialPreviewDelivery(siteHeadMetadata)) {
    return outputs;
  }
  if (!siteOrigin) {
    throw new Error(
      `Static Social Preview Images require a Site Origin. ` +
        `Add siteOrigin: 'https://example.com' to rocket-config.js.`,
    );
  }

  for (const [pagePath, page] of pages) {
    if (!needsDefaultSocialPreviewImage({ pagePath, page, siteHeadMetadata })) {
      continue;
    }
    const { html, template, templateData } = createSocialPreviewTemplateHtml({
      page,
      pagePath,
      siteHeadMetadata,
      siteOrigin,
    });
    const fingerprint = createSocialPreviewImageFingerprint({
      html,
      pagePath,
      siteOrigin,
      template,
      templateData,
    });
    const publicPath = defaultSocialPreviewImagePath(fingerprint);
    const cachedData = readCachedSocialPreviewImage(cacheDirectory, fingerprint);

    if (cachedData) {
      outputs.set(pagePath, {
        publicPath,
        publicUrl: new URL(publicPath, `${siteOrigin}/`).href,
        data: cachedData,
      });
      continue;
    }

    try {
      const data = await captureSocialPreviewImage({
        html,
        width: DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
        height: DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
        pathname: pagePath,
      });
      outputs.set(pagePath, {
        publicPath,
        publicUrl: new URL(publicPath, `${siteOrigin}/`).href,
        data,
      });
      writeCachedSocialPreviewImage(cacheDirectory, fingerprint, data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to capture Default Social Preview Image for ${pagePath}: ${message}`,
        { cause: error },
      );
    }
  }
  return outputs;
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
export function configuredConcreteSocialPreviewPages(pages) {
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const concretePages = new Map();
  for (const [pagePath, page] of pages) {
    if (hasPathParameter(pagePath)) {
      continue;
    }
    concretePages.set(pagePath, page);
  }
  return concretePages;
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
export function publicSocialPreviewPages(pages) {
  const concretePages = configuredConcreteSocialPreviewPages(pages);
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const previewPages = new Map(concretePages);
  for (const [pagePath, page] of concretePages) {
    for (const archivePath of paginatedArchivePaths({ pages, page, pagePath })) {
      previewPages.set(archivePath, page);
    }
  }
  return previewPages;
}

/**
 * @param {{
 *   pagePath: string;
 *   page: import('@rocket/js/types.js').Page;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 * }} options
 */
export function needsDefaultSocialPreviewImage({ pagePath, page, siteHeadMetadata }) {
  return (
    hasStaticSocialPreviewDelivery(siteHeadMetadata) &&
    !isFileOutputPath(pagePath) &&
    !page.module.config.siteHeadMetadata?.socialPreview?.image
  );
}

/**
 * @param {import('@rocket/js/types.js').SiteHeadMetadataConfig | undefined} siteHeadMetadata
 */
export function hasStaticSocialPreviewDelivery(siteHeadMetadata) {
  return (
    siteHeadMetadata?.socialPreview !== undefined &&
    (siteHeadMetadata.socialPreview.delivery ?? 'static') === 'static'
  );
}

/**
 * @param {string} pathnameOrFingerprint
 */
export function defaultSocialPreviewImagePath(pathnameOrFingerprint) {
  if (/^[a-f0-9]{64}$/.test(pathnameOrFingerprint)) {
    return `/_rocket/social-preview/${pathnameOrFingerprint}.png`;
  }
  return `/_rocket/social-preview${normalizeDocumentPath(pathnameOrFingerprint)}image.png`;
}

/**
 * @param {{
 *   html: string;
 *   pagePath: string;
 *   siteOrigin: string;
 *   template: Function;
 *   templateData: ReturnType<typeof createSocialPreviewTemplateData>;
 * }} options
 */
function createSocialPreviewImageFingerprint({
  html,
  pagePath,
  siteOrigin,
  template,
  templateData,
}) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        rendererVersion: SOCIAL_PREVIEW_RENDERER_VERSION,
        dimensions: {
          width: DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
          height: DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
        },
        template:
          template === defaultSocialPreviewTemplate ? 'rocket:default' : template.toString(),
        templateData,
        pagePath,
        siteOrigin,
        html,
      }),
    )
    .digest('hex');
}

/**
 * @param {string | undefined} cacheDirectory
 * @param {string} fingerprint
 */
function readCachedSocialPreviewImage(cacheDirectory, fingerprint) {
  if (!cacheDirectory) {
    return undefined;
  }
  const filePath = path.join(cacheDirectory, `${fingerprint}.png`);
  if (!existsSync(filePath)) {
    return undefined;
  }
  return readFileSync(filePath);
}

/**
 * @param {string | undefined} cacheDirectory
 * @param {string} fingerprint
 * @param {Uint8Array} data
 */
function writeCachedSocialPreviewImage(cacheDirectory, fingerprint, data) {
  if (!cacheDirectory) {
    return;
  }
  mkdirSync(cacheDirectory, { recursive: true });
  writeFileSync(path.join(cacheDirectory, `${fingerprint}.png`), data);
}

/**
 * @param {{
 *   page: import('@rocket/js/types.js').Page;
 *   pagePath: string;
 *   siteHeadMetadata: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin: string;
 *   overrides?: { title?: string; description?: string };
 * }} options
 */
export function createSocialPreviewTemplateHtml({
  page,
  pagePath,
  siteHeadMetadata,
  siteOrigin,
  overrides = {},
}) {
  const metadata = createSiteHeadMetadata({
    config: siteHeadMetadata,
    pageMetadata: page.metadata,
    pageSiteHeadMetadata: page.module.config.siteHeadMetadata,
    pathname: pagePath,
    siteOrigin,
  });
  const template = siteHeadMetadata.socialPreview?.template ?? defaultSocialPreviewTemplate;
  const templateData = createSocialPreviewTemplateData({
    metadata,
    pageMetadata: page.metadata,
    pathname: pagePath,
  });
  if (overrides.title !== undefined) {
    templateData.page.title = overrides.title;
    templateData.page.documentTitle = overrides.title;
  }
  if (overrides.description !== undefined) {
    templateData.page.description = overrides.description;
  }
  return {
    html: template(templateData),
    template,
    templateData,
  };
}

/**
 * @param {{
 *   metadata: import('@rocket/js/types.js').SiteHeadMetadata;
 *   pageMetadata?: import('@rocket/js/types.js').PageMetadata;
 *   pathname: string;
 * }} options
 */
export function createSocialPreviewTemplateData({ metadata, pageMetadata, pathname }) {
  return {
    site: {
      name: metadata.siteName,
      defaultDescription: metadata.defaultDescription,
      language: metadata.language,
      ...(metadata.themeColor ? { themeColor: metadata.themeColor } : {}),
    },
    page: {
      pathname,
      title: pageMetadata?.title ?? metadata.title,
      documentTitle: metadata.title,
      description: metadata.description,
      canonicalUrl: metadata.canonicalUrl,
      language: metadata.language,
    },
  };
}

/**
 * @param {SocialPreviewCaptureOptions} options
 */
export async function captureSocialPreviewImageWithBrowser({ html }) {
  return renderSocialPreviewImage(html);
}

/**
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
export async function renderSocialPreviewImage(html) {
  /** @type {import('puppeteer-core').Browser | undefined} */
  let browser;
  try {
    browser = await puppeteer.launch(await createSocialPreviewBrowserLaunchOptions());
    const page = await browser.newPage();
    await page.setViewport({
      width: DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
      height: DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
      deviceScaleFactor: 1,
    });

    await runSocialPreviewCaptureStep('set Social Preview HTML content', () =>
      page.setContent(html, { waitUntil: 'load' }),
    );
    await runSocialPreviewCaptureStep('wait for Social Preview fonts', () =>
      page.evaluateHandle('document.fonts.ready'),
    );
    const screenshot = await runSocialPreviewCaptureStep('capture Social Preview screenshot', () =>
      page.screenshot({
        type: 'png',
      }),
    );
    return Buffer.from(screenshot);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * @param {{
 *   platform?: NodeJS.Platform;
 *   env?: NodeJS.ProcessEnv;
 *   fileExists?: (path: string) => boolean;
 *   chromiumExecutablePath?: () => Promise<string> | string;
 * }} [options]
 */
export async function createSocialPreviewBrowserLaunchOptions(options = {}) {
  const platform = options.platform || process.platform;
  return {
    args: platform === 'linux' ? chromium.args : LOCAL_BROWSER_ARGS,
    executablePath: await resolveSocialPreviewBrowserExecutablePath(options),
    headless: true,
  };
}

/**
 * @param {{
 *   platform?: NodeJS.Platform;
 *   env?: NodeJS.ProcessEnv;
 *   fileExists?: (path: string) => boolean;
 *   chromiumExecutablePath?: () => Promise<string> | string;
 * }} [options]
 */
export async function resolveSocialPreviewBrowserExecutablePath({
  platform = process.platform,
  env = process.env,
  fileExists = existsSync,
  chromiumExecutablePath = () => chromium.executablePath(),
} = {}) {
  const explicitPath = env.PUPPETEER_EXECUTABLE_PATH || env.CHROME_EXECUTABLE_PATH;
  if (explicitPath) {
    return explicitPath;
  }
  if (platform === 'linux') {
    return chromiumExecutablePath();
  }
  const localBrowserPath = findLocalBrowserExecutable({ platform, env, fileExists });
  if (localBrowserPath) {
    return localBrowserPath;
  }
  throw new Error(
    `Unable to find a local browser executable for Social Preview Capture. ` +
      `Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH to a Chromium-compatible browser.`,
  );
}

/**
 * @param {{
 *   platform: NodeJS.Platform;
 *   env: NodeJS.ProcessEnv;
 *   fileExists: (path: string) => boolean;
 * }} options
 */
function findLocalBrowserExecutable({ platform, env, fileExists }) {
  const home = env.HOME || env.USERPROFILE;
  const paths = [];
  if (platform === 'darwin') {
    paths.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    );
  }
  if (platform === 'win32') {
    for (const root of [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA]) {
      if (!root) {
        continue;
      }
      paths.push(
        path.join(root, 'Google/Chrome/Application/chrome.exe'),
        path.join(root, 'Chromium/Application/chrome.exe'),
        path.join(root, 'Microsoft/Edge/Application/msedge.exe'),
      );
    }
  }
  if (home && platform === 'darwin') {
    paths.push(
      path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
      path.join(home, 'Applications/Chromium.app/Contents/MacOS/Chromium'),
    );
  }
  return paths.find(candidate => fileExists(candidate));
}

/**
 * @template T
 * @param {string} action
 * @param {() => Promise<T>} callback
 * @returns {Promise<T>}
 */
async function runSocialPreviewCaptureStep(action, callback) {
  try {
    return await callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ${action}: ${message}`, { cause: error });
  }
}

/**
 * @param {string} pagePath
 */
function isFileOutputPath(pagePath) {
  return path.extname(pagePath) !== '';
}

/**
 * @param {string} pagePath
 */
function hasPathParameter(pagePath) {
  return /(^|\/):[^/]+/.test(pagePath);
}
