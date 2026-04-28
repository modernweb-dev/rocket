/** Runs on: server */
import path from 'node:path';
import { validateIconLibrariesConfig } from './icons.js';

const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);

/**
 * @param {string} [filePath]
 * @returns {Promise<import("@rocket/js/types.js").ResolvedRocketConfig>}
 */
export async function readConfig(filePath) {
  const configFile = await import(
    filePath ? path.join(process.cwd(), filePath) : path.join(process.cwd(), 'rocket-config.js')
  );
  if (configFile.default === undefined) {
    throw new Error('rocket-config.js must have a default export');
  }
  /** @type {import("@rocket/js/types.js").RocketConfig} */
  const config = configFile.default;
  validateRedirectConfig(config.urlLifecycle?.redirects);
  const siteHeadMetadata = normalizeSiteHeadMetadataConfig(config.siteHeadMetadata);
  validateIconLibrariesConfig(config.iconLibraries);
  validateDefaultIconLibraryConfig(config.defaultIconLibrary);
  const siteOrigin = siteHeadMetadata
    ? requireSiteHeadMetadataSiteOrigin(config.siteOrigin)
    : config.siteOrigin;
  config.includeGlobs = config.includeGlobs.map(glob => {
    if (!glob.includes('*') && !glob.includes('.')) {
      // If the glob is a directory, include all files in the directory
      return `${glob}${glob.endsWith('/') ? '' : '/'}**`;
    }
    return glob;
  });

  return {
    excludeRegex: [],
    adjustDevServerConfig: _ => _,
    ...config,
    ...(siteOrigin ? { siteOrigin } : {}),
    ...(siteHeadMetadata ? { siteHeadMetadata } : {}),
  };
}

/**
 * @param {unknown} defaultIconLibrary
 */
function validateDefaultIconLibraryConfig(defaultIconLibrary) {
  if (defaultIconLibrary === undefined) {
    return;
  }
  if (typeof defaultIconLibrary !== 'string' || defaultIconLibrary.trim() === '') {
    throw new Error(
      'Invalid Icon Library Configuration: defaultIconLibrary must be a non-empty string',
    );
  }
}

const siteHeadMetadataFields = new Set([
  'siteName',
  'defaultDescription',
  'language',
  'icons',
  'themeColor',
  'socialPreview',
]);
const siteHeadMetadataIconFields = new Set(['ico', 'svg', 'appleTouchIcon']);
const siteHeadMetadataSocialPreviewFields = new Set(['delivery', 'template']);
const siteHeadMetadataSocialPreviewDeliveryValues = new Set(['static']);

/**
 * @param {unknown} siteHeadMetadata
 * @returns {import("@rocket/js/types.js").SiteHeadMetadataConfig | undefined}
 */
function normalizeSiteHeadMetadataConfig(siteHeadMetadata) {
  if (siteHeadMetadata === undefined) {
    return undefined;
  }
  if (!isPlainRecord(siteHeadMetadata)) {
    throw invalidSiteHeadMetadata('siteHeadMetadata', 'must be an object');
  }
  for (const field of Object.keys(siteHeadMetadata)) {
    if (!siteHeadMetadataFields.has(field)) {
      throw invalidSiteHeadMetadata(
        `siteHeadMetadata.${field}`,
        'is not a known Site Head Metadata field',
      );
    }
  }
  const normalized = /** @type {import("@rocket/js/types.js").SiteHeadMetadataConfig} */ ({
    siteName: readRequiredSiteHeadMetadataString(siteHeadMetadata, 'siteName'),
    defaultDescription: readRequiredSiteHeadMetadataString(siteHeadMetadata, 'defaultDescription'),
    language: readRequiredSiteHeadMetadataString(siteHeadMetadata, 'language'),
  });
  if (hasOwn(siteHeadMetadata, 'icons')) {
    normalized.icons = readSiteHeadMetadataIcons(siteHeadMetadata.icons);
  }
  if (hasOwn(siteHeadMetadata, 'themeColor')) {
    normalized.themeColor = readSiteHeadMetadataString(
      siteHeadMetadata.themeColor,
      'siteHeadMetadata.themeColor',
    );
  }
  if (hasOwn(siteHeadMetadata, 'socialPreview')) {
    normalized.socialPreview = readSiteHeadMetadataSocialPreview(siteHeadMetadata.socialPreview);
  }
  return normalized;
}

/**
 * @param {unknown} socialPreview
 * @returns {NonNullable<import('@rocket/js/types.js').SiteHeadMetadataConfig['socialPreview']>}
 */
function readSiteHeadMetadataSocialPreview(socialPreview) {
  if (!isPlainRecord(socialPreview)) {
    throw invalidSiteHeadMetadata('siteHeadMetadata.socialPreview', 'must be an object');
  }
  for (const field of Object.keys(socialPreview)) {
    if (!siteHeadMetadataSocialPreviewFields.has(field)) {
      throw invalidSiteHeadMetadata(
        `siteHeadMetadata.socialPreview.${field}`,
        'is not a known Social Preview field',
      );
    }
  }
  if (
    hasOwn(socialPreview, 'delivery') &&
    !siteHeadMetadataSocialPreviewDeliveryValues.has(/** @type {string} */ (socialPreview.delivery))
  ) {
    throw invalidSiteHeadMetadata('siteHeadMetadata.socialPreview.delivery', "must be 'static'");
  }
  if (hasOwn(socialPreview, 'template') && typeof socialPreview.template !== 'function') {
    throw invalidSiteHeadMetadata('siteHeadMetadata.socialPreview.template', 'must be a function');
  }
  const template =
    /** @type {NonNullable<import('@rocket/js/types.js').SiteHeadMetadataConfig['socialPreview']>['template'] | undefined} */ (
      socialPreview.template
    );
  return {
    delivery: 'static',
    ...(hasOwn(socialPreview, 'template') ? { template } : {}),
  };
}

/**
 * @param {Record<string, unknown>} siteHeadMetadata
 * @param {'siteName' | 'defaultDescription' | 'language'} field
 */
function readRequiredSiteHeadMetadataString(siteHeadMetadata, field) {
  return readSiteHeadMetadataString(siteHeadMetadata[field], `siteHeadMetadata.${field}`);
}

/**
 * @param {unknown} icons
 * @returns {import("@rocket/js/types.js").SiteHeadMetadataIconsConfig}
 */
function readSiteHeadMetadataIcons(icons) {
  if (!isPlainRecord(icons)) {
    throw invalidSiteHeadMetadata('siteHeadMetadata.icons', 'must be an object');
  }
  for (const field of Object.keys(icons)) {
    if (!siteHeadMetadataIconFields.has(field)) {
      throw invalidSiteHeadMetadata(
        `siteHeadMetadata.icons.${field}`,
        'is not a known Favicon Asset field',
      );
    }
  }
  return {
    ...(hasOwn(icons, 'ico')
      ? { ico: readSiteHeadMetadataString(icons.ico, 'siteHeadMetadata.icons.ico') }
      : {}),
    ...(hasOwn(icons, 'svg')
      ? { svg: readSiteHeadMetadataString(icons.svg, 'siteHeadMetadata.icons.svg') }
      : {}),
    ...(hasOwn(icons, 'appleTouchIcon')
      ? {
          appleTouchIcon: readSiteHeadMetadataString(
            icons.appleTouchIcon,
            'siteHeadMetadata.icons.appleTouchIcon',
          ),
        }
      : {}),
  };
}

/**
 * @param {unknown} value
 * @param {string} field
 */
function readSiteHeadMetadataString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalidSiteHeadMetadata(field, 'must be a non-empty string');
  }
  return value;
}

/**
 * @param {string} field
 * @param {string} message
 */
function invalidSiteHeadMetadata(field, message) {
  return new Error(`Invalid Site Head Metadata: ${field} ${message}`);
}

/**
 * @param {string | undefined} siteOrigin
 */
function requireSiteHeadMetadataSiteOrigin(siteOrigin) {
  if (typeof siteOrigin !== 'string' || siteOrigin.trim() === '') {
    throw new Error(
      `Site Head Metadata requires a Site Origin. ` +
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
 * @param {import("@rocket/js/types.js").RedirectConfig[] | undefined} redirects
 */
function validateRedirectConfig(redirects = []) {
  const sources = new Set();
  for (const redirect of redirects) {
    if (!isInternalAbsolutePath(redirect.source)) {
      throw new Error(
        `Invalid Redirect source ${JSON.stringify(
          redirect.source,
        )}. Redirect sources must be internal absolute paths.`,
      );
    }
    if (sources.has(redirect.source)) {
      throw new Error(`Duplicate Redirect source ${JSON.stringify(redirect.source)}.`);
    }
    sources.add(redirect.source);
    if (!isInternalAbsolutePath(redirect.target) && !isAbsoluteHttpUrl(redirect.target)) {
      throw new Error(
        `Invalid Redirect target ${JSON.stringify(
          redirect.target,
        )}. Redirect targets must be internal absolute paths or absolute http: or https: URLs.`,
      );
    }
    if (redirect.status !== undefined && !REDIRECT_STATUSES.has(redirect.status)) {
      throw new Error(
        `Invalid Redirect status ${JSON.stringify(
          redirect.status,
        )}. Redirect statuses must be 301, 302, 307, or 308.`,
      );
    }
  }
}

/**
 * @param {unknown} value
 */
function isInternalAbsolutePath(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

/**
 * @param {unknown} value
 */
function isAbsoluteHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
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
 * @param {object} object
 * @param {string} key
 */
function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
