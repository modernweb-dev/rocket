/** Runs on: server */
import { glob } from 'node:fs/promises';
import * as p from 'node:path';
import { normalizeIconReferencesConfig } from './icons.js';

/** @typedef {import('@rocket/js/types.js').PageMetadata} PageMetadata */
/** @typedef {import('@rocket/js/types.js').PageMetadataConfig} PageMetadataConfig */
/** @typedef {import('@rocket/js/types.js').PageMetadataCustom} PageMetadataCustom */

const ROCKET_OWNED_CUSTOM_ELEMENT_TAGS = new Set(['rocket-icon']);

/**
 * @param {string} root
 * @param {string[]} include
 * @param {(string | RegExp)[]} exclude
 */
export async function getPages(root, include, exclude) {
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const pages = new Map();
  for await (const file of glob(include, {
    cwd: root,
    exclude: ignoreFn(exclude),
  })) {
    if (file.endsWith('.rocket.md')) {
      const module = await tryImport(`./${p.relative(process.cwd(), file)}`);
      const path = module.config?.path;
      if (!path) {
        throw new Error('No path found in file: ' + file);
      }
      if (pages.has(path)) {
        throw new Error(
          'Duplicate path found: ' + path + ', used in ' + file + ' and ' + pages.get(path)?.file,
        );
      }
      const normalizedModule = normalizePageModule(file, module);
      validateMarkdownPageComponents(file, normalizedModule);
      const linkText =
        (normalizedModule.config.menu === false
          ? undefined
          : normalizedModule.config.menu?.linkText) || normalizedModule._$menuLinkText$;
      const metadataConfig = normalizePageMetadataConfig(file, normalizedModule.config.metadata);
      const title = metadataConfig.title || module._$title$ || linkText || titleFromPath(path);
      pages.set(path, {
        file,
        module: normalizedModule,
        metadata: pageMetadata(title, linkText, metadataConfig),
        demoNames: normalizedModule._$demoNames$ || [],
      });
    } else if (file.endsWith('.rocket.js')) {
      /** @type {import('@rocket/js/types.js').Module} */
      const module = await import(`./${p.relative(process.cwd(), file)}`, {
        with: { type: 'rocketSetupJsInitial' },
      });
      const path = module.config?.path;
      if (!path) {
        throw new Error('No path found in file: ' + file);
      }
      if (pages.has(path)) {
        throw new Error(
          'Duplicate path found: ' + path + ', used in ' + file + ' and ' + pages.get(path)?.file,
        );
      }
      const normalizedModule = normalizePageModule(file, module);
      const linkText =
        normalizedModule.config.menu === false ? undefined : normalizedModule.config.menu?.linkText;
      const metadataConfig = normalizePageMetadataConfig(file, normalizedModule.config.metadata);
      const title = metadataConfig.title || linkText || titleFromPath(path);
      pages.set(path, {
        file,
        module: normalizedModule,
        metadata: pageMetadata(title, linkText, metadataConfig),
      });
    }
  }
  return pages;
}

/**
 * @param {string} file
 * @param {import('@rocket/js/types.js').Module} module
 * @returns {import('@rocket/js/types.js').Module}
 */
function normalizePageModule(file, module) {
  const siteHeadMetadata = normalizePageSiteHeadMetadataConfig(
    file,
    module.config.siteHeadMetadata,
  );
  const hasIconReferences = module.config.iconReferences !== undefined;
  const iconReferences = normalizeIconReferencesConfig(
    module.config.iconReferences,
    `Page Icon References in ${file}: config.iconReferences`,
  );
  if (siteHeadMetadata === undefined && !hasIconReferences) {
    return module;
  }
  return {
    ...module,
    config: {
      ...module.config,
      ...(siteHeadMetadata !== undefined ? { siteHeadMetadata } : {}),
      ...(hasIconReferences ? { iconReferences } : {}),
    },
  };
}

/**
 * @param {string} title
 * @param {string | undefined} linkText
 * @param {PageMetadataConfig} metadataConfig
 * @returns {PageMetadata}
 */
function pageMetadata(title, linkText, metadataConfig) {
  return {
    title,
    ...(linkText ? { linkText } : {}),
    ...(hasOwn(metadataConfig, 'description') ? { description: metadataConfig.description } : {}),
    ...(hasOwn(metadataConfig, 'date') ? { date: metadataConfig.date } : {}),
    ...(hasOwn(metadataConfig, 'updated') ? { updated: metadataConfig.updated } : {}),
    ...(hasOwn(metadataConfig, 'tags') ? { tags: metadataConfig.tags } : {}),
    ...(hasOwn(metadataConfig, 'authors') ? { authors: metadataConfig.authors } : {}),
    ...(hasOwn(metadataConfig, 'custom') ? { custom: metadataConfig.custom } : {}),
  };
}

const pageMetadataFields = new Set([
  'title',
  'description',
  'date',
  'updated',
  'tags',
  'authors',
  'custom',
]);
const pageSiteHeadMetadataFields = new Set(['indexing', 'socialPreview']);
const pageSiteHeadMetadataIndexingValues = new Set(['index', 'noindex']);
const pageSiteHeadMetadataSocialPreviewFields = new Set(['image']);

/**
 * @param {string} file
 * @param {unknown} siteHeadMetadataConfig
 * @returns {import('@rocket/js/types.js').PageSiteHeadMetadataConfig | undefined}
 */
function normalizePageSiteHeadMetadataConfig(file, siteHeadMetadataConfig) {
  if (siteHeadMetadataConfig === undefined) {
    return undefined;
  }
  if (!isPlainRecord(siteHeadMetadataConfig)) {
    throw invalidPageSiteHeadMetadata(file, 'siteHeadMetadata', 'must be an object');
  }
  const config = /** @type {Record<string, unknown>} */ (siteHeadMetadataConfig);
  for (const field of Object.keys(config)) {
    if (!pageSiteHeadMetadataFields.has(field)) {
      throw invalidPageSiteHeadMetadata(
        file,
        `siteHeadMetadata.${field}`,
        'is not a known Site Head Metadata Page Option',
      );
    }
  }

  const normalized = /** @type {import('@rocket/js/types.js').PageSiteHeadMetadataConfig} */ ({});
  if (hasOwn(config, 'indexing')) {
    if (!pageSiteHeadMetadataIndexingValues.has(/** @type {string} */ (config.indexing))) {
      throw invalidPageSiteHeadMetadata(
        file,
        'siteHeadMetadata.indexing',
        "must be 'index' or 'noindex'",
      );
    }
    normalized.indexing = /** @type {import('@rocket/js/types.js').SiteHeadMetadataIndexing} */ (
      config.indexing
    );
  }
  if (hasOwn(config, 'socialPreview')) {
    normalized.socialPreview = readPageSiteHeadMetadataSocialPreview(file, config.socialPreview);
  }
  return normalized;
}

/**
 * @param {string} file
 * @param {unknown} socialPreview
 * @returns {import('@rocket/js/types.js').PageSiteHeadMetadataSocialPreviewConfig}
 */
function readPageSiteHeadMetadataSocialPreview(file, socialPreview) {
  if (!isPlainRecord(socialPreview)) {
    throw invalidPageSiteHeadMetadata(file, 'siteHeadMetadata.socialPreview', 'must be an object');
  }
  for (const field of Object.keys(socialPreview)) {
    if (!pageSiteHeadMetadataSocialPreviewFields.has(field)) {
      throw invalidPageSiteHeadMetadata(
        file,
        `siteHeadMetadata.socialPreview.${field}`,
        'is not a known Social Preview field',
      );
    }
  }

  const normalized =
    /** @type {import('@rocket/js/types.js').PageSiteHeadMetadataSocialPreviewConfig} */ ({});
  if (hasOwn(socialPreview, 'image')) {
    normalized.image = readPageSiteHeadMetadataSocialPreviewImage(file, socialPreview.image);
  }
  return normalized;
}

/**
 * @param {string} file
 * @param {unknown} image
 * @returns {string}
 */
function readPageSiteHeadMetadataSocialPreviewImage(file, image) {
  if (typeof image !== 'string') {
    throw invalidPageSiteHeadMetadata(
      file,
      'siteHeadMetadata.socialPreview.image',
      'must be a string',
    );
  }
  const normalized = image.trim();
  if (!normalized) {
    throw invalidPageSiteHeadMetadata(
      file,
      'siteHeadMetadata.socialPreview.image',
      'must be a non-empty string',
    );
  }
  if (!isSupportedSocialPreviewImageSource(normalized)) {
    throw invalidPageSiteHeadMetadata(
      file,
      'siteHeadMetadata.socialPreview.image',
      'must be a Page-relative path, site-root path, or absolute http: or https: URL',
    );
  }
  return normalized;
}

/**
 * @param {string} value
 */
function isSupportedSocialPreviewImageSource(value) {
  if (value.startsWith('//')) {
    return false;
  }
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {string} file
 * @param {unknown} metadataConfig
 * @returns {PageMetadataConfig}
 */
function normalizePageMetadataConfig(file, metadataConfig) {
  if (metadataConfig === undefined) {
    return {};
  }
  if (!isPlainRecord(metadataConfig)) {
    throw invalidPageMetadata(file, 'metadata', 'must be an object');
  }
  const config = /** @type {Record<string, unknown>} */ (metadataConfig);
  for (const field of Object.keys(config)) {
    if (!pageMetadataFields.has(field)) {
      throw invalidPageMetadata(file, `metadata.${field}`, 'is not a known Page Metadata field');
    }
  }

  const normalized = /** @type {PageMetadataConfig} */ ({});
  if (hasOwn(config, 'title')) {
    normalized.title = readStringMetadata(file, 'metadata.title', config.title);
  }
  if (hasOwn(config, 'description')) {
    normalized.description = readStringMetadata(file, 'metadata.description', config.description);
  }
  if (hasOwn(config, 'date')) {
    normalized.date = readDateMetadata(file, 'metadata.date', config.date);
  }
  if (hasOwn(config, 'updated')) {
    normalized.updated = readDateMetadata(file, 'metadata.updated', config.updated);
  }
  if (hasOwn(config, 'tags')) {
    normalized.tags = readStringListMetadata(file, 'metadata.tags', config.tags);
  }
  if (hasOwn(config, 'authors')) {
    normalized.authors = readStringListMetadata(file, 'metadata.authors', config.authors);
  }
  if (hasOwn(config, 'custom')) {
    normalized.custom = readCustomMetadata(file, 'metadata.custom', config.custom);
  }
  return normalized;
}

/**
 * @param {string} file
 * @param {string} field
 * @param {unknown} value
 */
function readStringMetadata(file, field, value) {
  if (typeof value !== 'string') {
    throw invalidPageMetadata(file, field, 'must be a string');
  }
  return value;
}

/**
 * @param {string} file
 * @param {string} field
 * @param {unknown} value
 */
function readDateMetadata(file, field, value) {
  const dateValue = readStringMetadata(file, field, value);
  if (!isDateOnlyIsoString(dateValue)) {
    throw invalidPageMetadata(file, field, 'must be a date-only ISO string like YYYY-MM-DD');
  }
  return dateValue;
}

/**
 * @param {string} file
 * @param {string} field
 * @param {unknown} value
 */
function readStringListMetadata(file, field, value) {
  if (!Array.isArray(value)) {
    throw invalidPageMetadata(file, field, 'must be a string array');
  }
  return normalizeStringList(file, field, value);
}

/**
 * @param {string} file
 * @param {string} field
 * @param {unknown} value
 */
function readCustomMetadata(file, field, value) {
  if (!isPlainRecord(value) || !isStructuredData(value)) {
    throw invalidPageMetadata(file, field, 'must be structured data');
  }
  return /** @type {PageMetadataCustom} */ (value);
}

/**
 * @param {string} file
 * @param {string} field
 * @param {unknown[]} values
 */
function normalizeStringList(file, field, values) {
  const normalized = [];
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string') {
      throw invalidPageMetadata(file, field, 'must be a string array');
    }
    const trimmed = value.trim();
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      normalized.push(trimmed);
    }
  }
  return normalized;
}

/**
 * @param {string} value
 */
function isDateOnlyIsoString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isStructuredData(value) {
  if (value === null) {
    return true;
  }
  if (['string', 'boolean'].includes(typeof value)) {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(item => isStructuredData(item));
  }
  if (isPlainRecord(value)) {
    return Object.values(value).every(item => isStructuredData(item));
  }
  return false;
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

/**
 * @param {string} file
 * @param {string} field
 * @param {string} message
 */
function invalidPageMetadata(file, field, message) {
  return new Error(`Invalid Page Metadata in ${file}: config.${field} ${message}`);
}

/**
 * @param {string} file
 * @param {string} field
 * @param {string} message
 */
function invalidPageSiteHeadMetadata(file, field, message) {
  return new Error(`Invalid Page-level Site Head Metadata in ${file}: config.${field} ${message}`);
}

/**
 * @param {(string | RegExp)[]} exclude
 * @returns {(path: string) => boolean}
 */
function ignoreFn(exclude) {
  /**
   * @param {string} path
   */
  return function (path) {
    for (const pattern of exclude) {
      if (path.includes('node_modules')) {
        return true;
      } else if (typeof pattern === 'string') {
        if (path.includes(pattern)) return true;
      } else {
        if (pattern.test(path)) return true;
      }
    }
    return false;
  };
}

/**
 * @param {string} path
 * @returns {string}
 */
function titleFromPath(path) {
  const parts = path.split('/');
  const last = parts.findLast(part => !part.startsWith(':'));
  if (!last) {
    return parts[0] ? capitalize(parts[0].slice(1)) : 'Home';
  }
  return capitalize(last);
}

/**
 * @param {string} string
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {string} path
 * @returns {Promise<import('@rocket/js/types.js').Module>}
 */
async function tryImport(path) {
  try {
    const module = await import(path, {
      with: { type: 'rocketSetupMdInitial' },
    });
    return module;
  } catch (error) {
    const typedError = /** @type {Error} */ (error);
    typedError.message += ' in file: ' + path;
    throw typedError;
  }
}

/**
 * @param {string} file
 * @param {import('@rocket/js/types.js').Module} module
 */
function validateMarkdownPageComponents(file, module) {
  const customElementTags = module._$customElementTags$ || [];
  const components = module.components || {};
  const pageLocalCustomElementTags = new Set(module._$pageLocalCustomElementTags$ || []);
  const conflictingTags = customElementTags.filter(
    tag =>
      Object.prototype.hasOwnProperty.call(components, tag) && pageLocalCustomElementTags.has(tag),
  );
  const missingTags = customElementTags.filter(
    tag =>
      !ROCKET_OWNED_CUSTOM_ELEMENT_TAGS.has(tag) &&
      !Object.prototype.hasOwnProperty.call(components, tag) &&
      !pageLocalCustomElementTags.has(tag),
  );

  if (conflictingTags.length) {
    const tagLabel = conflictingTags.length === 1 ? 'tag' : 'tags';
    throw new Error(
      `Markdown Page ${file} defines custom element ${tagLabel} ${conflictingTags.join(
        ', ',
      )} as both Registered Components and Page-local Custom Elements`,
    );
  }

  if (missingTags.length) {
    const tagLabel = missingTags.length === 1 ? 'tag' : 'tags';
    throw new Error(
      `Markdown Page ${file} uses unregistered custom element ${tagLabel} ${missingTags.join(
        ', ',
      )}`,
    );
  }
}
