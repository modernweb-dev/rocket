import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { treeFromPages } from './menu.js';
import { createSiteHeadMetadata } from './siteHeadMetadata.js';
import { normalizeIconLibrariesConfig, normalizeIconReferencesConfig } from './icons.js';

/** @typedef {import('@rocket/js/types.js').Page} Page */
/** @typedef {import('@rocket/js/types.js').PageCollectionEntry} PageCollectionEntry */
/** @typedef {import('@rocket/js/types.js').PageRegistry} PageRegistry */
/** @typedef {import('@rocket/js/types.js').PageRegistryQueryOptions} PageRegistryQueryOptions */

export class PageData {
  /**
   * @param {PageRegistry} pageRegistry
   * @param {import('@rocket/js/types.js').PageMetadata | string} metadata
   * @param {string} url
   * @param {{
   *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
   *   pageSiteHeadMetadata?: import('@rocket/js/types.js').PageSiteHeadMetadataConfig;
   *   defaultSocialPreviewImage?: string;
   *   siteOrigin?: string;
   * }} [options]
   */
  constructor(
    pageRegistry,
    metadata,
    url,
    { siteHeadMetadata, pageSiteHeadMetadata, defaultSocialPreviewImage, siteOrigin } = {},
  ) {
    const pageMetadata = typeof metadata === 'string' ? { title: metadata } : metadata;
    this.pageRegistry = pageRegistry;
    /** @type {import('@rocket/js/types.js').PageRegistryQuery} */
    this.pages = new PageRegistryQuery(pageRegistry);
    this.pageTree = treeFromPages(pageRegistry);
    this._clientCode = '';
    this._hydrationScript = '';
    /** @type {boolean} */
    this._hasBrowserLoadedComponents = false;
    /** @type {Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>} */
    this._iconLibraries = new Map();
    /** @type {string | undefined} */
    this._defaultIconLibrary = undefined;
    /** @type {import('@rocket/js/types.js').IconReferenceConfig[]} */
    this._iconReferences = [];
    /** @type {import('@rocket/js/types.js').PageMetadata} */
    this.metadata = pageMetadata;
    /** @type {string | import('lit').TemplateResult} */
    this.content = '';
    this.url = url;
    /** @type {import('@rocket/js/types.js').PagePagination | undefined} */
    this.pagination = undefined;
    /** @type {import('@rocket/js/types.js').TableOfContents} */
    this.toc = { children: [] };
    /** @type {import('@rocket/js/types.js').SiteHeadMetadata | undefined} */
    this.siteHeadMetadata =
      siteHeadMetadata && siteOrigin
        ? createSiteHeadMetadata({
            config: siteHeadMetadata,
            pageMetadata,
            pageSiteHeadMetadata,
            defaultSocialPreviewImage,
            pathname: url,
            siteOrigin,
          })
        : undefined;
  }

  get title() {
    return this.metadata.title;
  }

  /**
   * @param {string} title
   */
  set title(title) {
    this.metadata.title = title;
  }

  get clientCode() {
    if (!this._clientCode && !this._hydrationScript) {
      return '';
    }
    return unsafeHTML(
      '<script type="module">' + this._clientCode + ';' + this._hydrationScript + '</script>',
    );
  }

  /**
   * @param {import('@rocket/js/types.js').IconLibrariesConfig} iconLibraries
   * @param {{ defaultIconLibrary?: string }} [options]
   */
  addIconLibraries(iconLibraries, { defaultIconLibrary } = {}) {
    const normalized = normalizeIconLibrariesConfig(iconLibraries, 'Layout Icon Libraries');
    for (const [name, config] of normalized) {
      if (this._iconLibraries.has(name)) {
        throw new Error(`Layout Icon Library "${name}" is already configured.`);
      }
      this._iconLibraries.set(name, config);
    }
    if (defaultIconLibrary !== undefined) {
      if (typeof defaultIconLibrary !== 'string' || defaultIconLibrary.trim() === '') {
        throw new Error('Layout defaultIconLibrary must be a non-empty string.');
      }
      if (this._defaultIconLibrary && this._defaultIconLibrary !== defaultIconLibrary) {
        throw new Error(
          `Layout Default Icon Library is already "${this._defaultIconLibrary}" and cannot be changed to "${defaultIconLibrary}".`,
        );
      }
      this._defaultIconLibrary = defaultIconLibrary;
    }
  }

  /**
   * @param {import('@rocket/js/types.js').IconReferenceConfig[]} iconReferences
   */
  addIconReferences(iconReferences) {
    this._iconReferences.push(
      ...normalizeIconReferencesConfig(iconReferences, 'PageData Icon References'),
    );
  }
}

export class PageRegistryQuery {
  /**
   * @param {PageRegistry} pageRegistry
   */
  constructor(pageRegistry) {
    this.pageRegistry = pageRegistry;
  }

  /**
   * @param {PageRegistryQueryOptions} [options]
   * @returns {PageCollectionEntry[]}
   */
  query(options = {}) {
    const tags = toList(options.tags);
    const authors = toList(options.authors);
    if (options.author) {
      authors.push(options.author);
    }

    const entries = [];
    for (const [path, page] of this.pageRegistry) {
      const entry = pageCollectionEntry(path, page);
      if (!matchesPathPrefix(entry, options.pathPrefix)) {
        continue;
      }
      if (!matchesTags(entry, tags)) {
        continue;
      }
      if (!matchesAuthors(entry, authors)) {
        continue;
      }
      entries.push(entry);
    }

    if (options.sortBy === 'date') {
      entries.sort((left, right) =>
        compareByMetadataDate(left, right, options.sortDirection || 'asc'),
      );
    }

    return entries;
  }
}

/**
 * @param {string} path
 * @param {Page} page
 * @returns {PageCollectionEntry}
 */
function pageCollectionEntry(path, page) {
  return {
    path,
    url: path,
    metadata: page.metadata,
    file: page.file,
    page,
  };
}

/**
 * @param {PageCollectionEntry} entry
 * @param {string | undefined} pathPrefix
 */
function matchesPathPrefix(entry, pathPrefix) {
  return pathPrefix ? entry.path.startsWith(pathPrefix) : true;
}

/**
 * @param {PageCollectionEntry} entry
 * @param {string[]} tags
 */
function matchesTags(entry, tags) {
  if (tags.length === 0) {
    return true;
  }
  const pageTags = entry.metadata.tags || [];
  return tags.every(tag => pageTags.includes(tag));
}

/**
 * @param {PageCollectionEntry} entry
 * @param {string[]} authors
 */
function matchesAuthors(entry, authors) {
  if (authors.length === 0) {
    return true;
  }
  const pageAuthors = entry.metadata.authors || [];
  return authors.every(author => pageAuthors.includes(author));
}

/**
 * @param {PageCollectionEntry} left
 * @param {PageCollectionEntry} right
 * @param {'asc' | 'desc'} direction
 */
function compareByMetadataDate(left, right, direction) {
  const leftDate = left.metadata.date;
  const rightDate = right.metadata.date;
  if (!leftDate && !rightDate) {
    return 0;
  }
  if (!leftDate) {
    return 1;
  }
  if (!rightDate) {
    return -1;
  }
  return direction === 'desc'
    ? rightDate.localeCompare(leftDate)
    : leftDate.localeCompare(rightDate);
}

/**
 * @param {string | string[] | undefined} value
 * @returns {string[]}
 */
function toList(value) {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? [...value] : [value];
}
