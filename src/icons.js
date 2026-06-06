/** Runs on: server */
import { glob, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as parse5 from 'parse5';

const require = createRequire(import.meta.url);

const ICON_LOADING_VALUES = new Set(['auto', 'server', 'client']);
const ICON_REFERENCE_CONFIG_FIELDS = new Set(['library', 'name']);
const ROCKET_ICON_ASSET_PREFIX = '/_rocket/icons/';
const ROCKET_ICON_DEFINE_MODULE_PATH = '/_rocket/rocket-icon.js';
const ROCKET_ICON_CLASS_MODULE_PATH = '/_rocket/RocketIcon.js';
const SHADOW_ICON_STYLE =
  ':host{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;line-height:1}' +
  ':host([hidden]){display:none}' +
  'span[part="icon"]{display:inline-flex;width:100%;height:100%;line-height:1}' +
  'span[part="icon"]>svg{display:block;width:100%;height:100%}';

/** @type {Map<string, Promise<Map<string, string>>>} */
const libraryIndexCache = new Map();

/**
 * @param {string} packageName
 * @param {string} files
 * @returns {import('@rocket/js/types.js').IconLibrarySource}
 */
export function iconsFromPackage(packageName, files) {
  return {
    type: 'package',
    packageName: readNonEmptyString(packageName, 'Icon package name'),
    files: readNonEmptyString(files, 'Icon package source files'),
  };
}

/**
 * @param {string} files
 * @returns {import('@rocket/js/types.js').IconLibrarySource}
 */
export function iconsFromPath(files) {
  return {
    type: 'path',
    files: readNonEmptyString(files, 'Icon path source files'),
  };
}

export const rocketBootstrapIconLibraries = {
  bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
};

export const rocketDefaultBootstrapIconLibrary = 'bootstrap';

/**
 * @param {{ addIconLibraries: (iconLibraries: import('@rocket/js/types.js').IconLibrariesConfig, options?: { defaultIconLibrary?: string }) => void }} pageData
 */
export function addBootstrapIconLibrary(pageData) {
  pageData.addIconLibraries(rocketBootstrapIconLibraries, {
    defaultIconLibrary: rocketDefaultBootstrapIconLibrary,
  });
}

export class IconAssetStore {
  constructor() {
    /** @type {Map<string, { url: string; svg: string; library: string; name: string }>} */
    this.assets = new Map();
    this.needsRuntime = false;
  }

  /**
   * @param {{ library: string; name: string; svg: string }} icon
   */
  addIcon({ library, name, svg }) {
    const url = iconAssetUrl({ library, name, svg });
    if (!this.assets.has(url)) {
      this.assets.set(url, { url, svg, library, name });
    }
    return url;
  }

  /**
   * @param {string} url
   */
  get(url) {
    return this.assets.get(url);
  }

  outputs() {
    return [...this.assets.values()];
  }
}

export function createIconAssetStore() {
  return new IconAssetStore();
}

export function rocketIconRuntimeOutputs() {
  return [
    {
      path: ROCKET_ICON_DEFINE_MODULE_PATH,
      type: 'application/javascript',
      data:
        `import { RocketIcon } from '${ROCKET_ICON_CLASS_MODULE_PATH}';\n` +
        "if (!customElements.get('rocket-icon')) {\n" +
        "  customElements.define('rocket-icon', RocketIcon);\n" +
        '}\n',
    },
    {
      path: ROCKET_ICON_CLASS_MODULE_PATH,
      type: 'application/javascript',
      data: readFileSync(new URL('./RocketIcon.js', import.meta.url), 'utf8'),
    },
  ];
}

/**
 * @param {string} requestPath
 * @param {{
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   layoutIconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig | Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>;
 *   layoutDefaultIconLibrary?: string;
 * }} [options]
 * @returns {Promise<{ url: string; svg: string; library: string; name: string } | undefined>}
 */
export async function resolveRocketIconAsset(requestPath, options = {}) {
  const match = /^\/_rocket\/icons\/([^/]+)\/(.+)\.([a-f0-9]{12})\.svg$/.exec(requestPath);
  if (!match) {
    return undefined;
  }

  const librarySegment = match[1];
  const resolver = createIconResolver({
    layoutIconLibraries: options.layoutIconLibraries,
    layoutDefaultIconLibrary: options.layoutDefaultIconLibrary,
    projectIconLibraries: options.iconLibraries,
    projectDefaultIconLibrary: options.defaultIconLibrary,
  });

  for (const [library, config] of resolver.libraries) {
    if (sanitizePathSegment(library) !== librarySegment) {
      continue;
    }
    const icons = await indexIconLibrary(library, config);
    for (const [name, svg] of icons) {
      const url = iconAssetUrl({ library, name, svg });
      if (url === requestPath) {
        return { url, svg, library, name };
      }
    }
  }

  return undefined;
}

/**
 * @param {unknown} iconLibraries
 */
export function validateIconLibrariesConfig(iconLibraries) {
  normalizeIconLibrariesConfig(iconLibraries, 'Icon Library Configuration');
}

/**
 * @param {string} html
 * @param {{
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   layoutIconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig | Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>;
 *   layoutDefaultIconLibrary?: string;
 *   pageData?: {
 *     _iconLibraries?: Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>;
 *     _defaultIconLibrary?: string;
 *     _iconReferences?: import('@rocket/js/types.js').IconReferenceConfig[];
 *     _hydrationScript?: string;
 *     _hasBrowserLoadedComponents?: boolean;
 *   };
 *   iconAssetStore?: IconAssetStore;
 * }} [options]
 * @returns {Promise<string>}
 */
export async function finalizeRocketIcons(html, options = {}) {
  const lowerHtml = html.toLowerCase();
  const hasIconHosts = lowerHtml.includes('<rocket-icon');
  const hasIconLoadingPolicy =
    lowerHtml.includes('icon-loading-region') || lowerHtml.includes('icon-server-budget');
  const extraIconReferences = options.pageData?._iconReferences || [];
  const hasExtraIconReferences = extraIconReferences.length > 0;
  if (
    !hasIconHosts &&
    !hasIconLoadingPolicy &&
    !pageNeedsDeferredIconRuntime(options.pageData) &&
    !hasExtraIconReferences
  ) {
    return html;
  }

  const resolver = createIconResolver({
    layoutIconLibraries: options.layoutIconLibraries || options.pageData?._iconLibraries,
    layoutDefaultIconLibrary:
      options.layoutDefaultIconLibrary || options.pageData?._defaultIconLibrary,
    projectIconLibraries: options.iconLibraries,
    projectDefaultIconLibrary: options.defaultIconLibrary,
  });
  const iconAssetStore = options.iconAssetStore || createIconAssetStore();
  /** @type {Map<string, { library: string; name: string; svg?: string }>} */
  const iconReferences = new Map();
  let hasClientIcon = false;

  const replacements = await finalizeRocketIconHosts(html, resolver);
  for (const replacement of replacements) {
    const renderedIcon = replacement.renderedIcon;
    iconReferences.set(iconReferenceKey(renderedIcon.library, renderedIcon.name), {
      library: renderedIcon.library,
      name: renderedIcon.name,
      svg: renderedIcon.svg || undefined,
    });
    if (renderedIcon.iconLoading === 'client') {
      hasClientIcon = true;
    }
  }
  for (const iconReference of extraIconReferences) {
    const library = resolver.resolveLibrary(iconReference.library, iconReference.name);
    const key = iconReferenceKey(library, iconReference.name);
    if (!iconReferences.has(key)) {
      iconReferences.set(key, {
        library,
        name: iconReference.name,
      });
    }
  }

  const output = applyHtmlReplacements(html, replacements);

  const needsManifest =
    hasClientIcon || hasExtraIconReferences || pageNeedsDeferredIconRuntime(options.pageData);
  if (!needsManifest) {
    return output;
  }

  /** @type {Record<string, string>} */
  const manifestIcons = {};
  for (const [key, reference] of iconReferences) {
    const svg = reference.svg || (await resolver.loadIcon(reference.library, reference.name));
    manifestIcons[key] = iconAssetStore.addIcon({
      library: reference.library,
      name: reference.name,
      svg,
    });
  }
  iconAssetStore.needsRuntime = true;

  return injectIconManifest(output, {
    defaultLibrary: resolver.defaultLibrary,
    icons: manifestIcons,
  });
}

/**
 * @param {unknown} iconLibraries
 * @param {string} owner
 * @returns {Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>}
 */
export function normalizeIconLibrariesConfig(iconLibraries, owner) {
  const normalized = new Map();
  if (iconLibraries === undefined) {
    return normalized;
  }

  const entries = iconLibraryEntries(iconLibraries, owner);
  for (const [name, config] of entries) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error(`Invalid ${owner}: Icon Library names must be non-empty strings.`);
    }
    if (normalized.has(name)) {
      throw new Error(`Invalid ${owner}: duplicate Icon Library "${name}".`);
    }
    normalized.set(name, {
      sources: normalizeIconLibrarySources(config, `${owner} "${name}"`),
    });
  }
  return normalized;
}

/**
 * @param {unknown} iconReferences
 * @param {string} owner
 * @returns {import('@rocket/js/types.js').IconReferenceConfig[]}
 */
export function normalizeIconReferencesConfig(iconReferences, owner) {
  if (iconReferences === undefined) {
    return [];
  }
  if (!Array.isArray(iconReferences)) {
    throw new Error(`Invalid ${owner}: must be an array.`);
  }

  /** @type {import('@rocket/js/types.js').IconReferenceConfig[]} */
  const normalized = [];
  const seen = new Set();
  for (const [index, iconReference] of iconReferences.entries()) {
    const field = `${owner}[${index}]`;
    if (!isPlainRecord(iconReference)) {
      throw new Error(`Invalid ${field}: must be an object.`);
    }
    for (const key of Object.keys(iconReference)) {
      if (!ICON_REFERENCE_CONFIG_FIELDS.has(key)) {
        throw new Error(`Invalid ${field}.${key}: is not a known Icon Reference field.`);
      }
    }

    const name = readNonEmptyString(iconReference.name, `${field}.name`).trim();
    const library =
      iconReference.library === undefined
        ? undefined
        : readNonEmptyString(iconReference.library, `${field}.library`).trim();
    const dedupeKey = `${library || ''}:${name}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      normalized.push({
        ...(library ? { library } : {}),
        name,
      });
    }
  }
  return normalized;
}

/**
 * @typedef {{ remaining?: number }} IconLoadingRegion
 * @typedef {{
 *   start: number;
 *   end: number;
 *   html: string;
 *   renderedIcon: Awaited<ReturnType<typeof renderRocketIconHost>>;
 * }} IconHostReplacement
 */

/**
 * @param {string} html
 * @param {ReturnType<typeof createIconResolver>} resolver
 * @returns {Promise<IconHostReplacement[]>}
 */
async function finalizeRocketIconHosts(html, resolver) {
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });
  /** @type {IconHostReplacement[]} */
  const replacements = [];

  /**
   * @param {import('parse5').DefaultTreeAdapterTypes.Node} node
   * @param {IconLoadingRegion | undefined} region
   */
  async function visitNode(node, region) {
    if (!isElementNode(node)) {
      await visitChildren(node, region);
      return;
    }

    if (node.tagName === 'rocket-icon') {
      const replacement = await finalizeRocketIconElement(html, node, resolver, region);
      replacements.push(replacement);
      return;
    }

    const childRegion = iconLoadingRegionForElement(node) || region;
    await visitChildren(node, childRegion);
  }

  /**
   * @param {import('parse5').DefaultTreeAdapterTypes.Node} node
   * @param {IconLoadingRegion | undefined} region
   */
  async function visitChildren(node, region) {
    if (!('childNodes' in node)) {
      return;
    }
    for (const child of node.childNodes) {
      await visitNode(child, region);
    }
    if (isTemplateElement(node)) {
      await visitNode(node.content, region);
    }
  }

  await visitNode(document, undefined);
  replacements.sort((first, second) => first.start - second.start);
  return replacements;
}

/**
 * @param {string} html
 * @param {import('parse5').DefaultTreeAdapterTypes.Element} node
 * @param {ReturnType<typeof createIconResolver>} resolver
 * @param {IconLoadingRegion | undefined} region
 * @returns {Promise<IconHostReplacement>}
 */
async function finalizeRocketIconElement(html, node, resolver, region) {
  const location = node.sourceCodeLocation;
  const startTag = location?.startTag;
  if (!location || !startTag) {
    throw new Error('rocket-icon host is missing a source location in rendered HTML.');
  }
  if (!location.endTag) {
    throw new Error('rocket-icon hosts must use an explicit closing </rocket-icon> tag.');
  }

  const attributes = attributesForElement(node);
  const effectiveIconLoading = effectiveLoadingForIcon(attributes, region);
  const renderedIcon = await renderRocketIconHost(
    html.slice(startTag.startOffset, startTag.endOffset),
    attributes,
    resolver,
    effectiveIconLoading,
  );

  return {
    start: location.startOffset,
    end: location.endOffset,
    html: renderedIcon.html,
    renderedIcon,
  };
}

/**
 * @param {Map<string, string | true>} attributes
 * @param {IconLoadingRegion | undefined} region
 */
function effectiveLoadingForIcon(attributes, region) {
  const iconLoading = iconLoadingForAttributes(attributes);
  if (iconLoading !== 'auto') {
    return iconLoading;
  }
  if (!region || region.remaining === undefined) {
    return 'server';
  }
  if (region.remaining > 0) {
    region.remaining -= 1;
    return 'server';
  }
  return 'client';
}

/**
 * @param {import('parse5').DefaultTreeAdapterTypes.Element} node
 * @returns {IconLoadingRegion | undefined}
 */
function iconLoadingRegionForElement(node) {
  const attributes = attributesForElement(node);
  if (!attributes.has('icon-loading-region')) {
    return undefined;
  }
  const budgetAttribute = attributes.get('icon-server-budget');
  if (budgetAttribute === undefined) {
    return {};
  }
  if (typeof budgetAttribute !== 'string' || !/^\d+$/.test(budgetAttribute)) {
    throw new Error(
      `Invalid icon-server-budget ${JSON.stringify(
        budgetAttribute === true ? '' : budgetAttribute,
      )}. Expected a non-negative integer.`,
    );
  }
  return { remaining: Number(budgetAttribute) };
}

/**
 * @param {import('parse5').DefaultTreeAdapterTypes.Element} node
 * @returns {Map<string, string | true>}
 */
function attributesForElement(node) {
  const attributes = new Map();
  for (const attribute of node.attrs) {
    attributes.set(attribute.name.toLowerCase(), attribute.value);
  }
  return attributes;
}

/**
 * @param {import('parse5').DefaultTreeAdapterTypes.Node} node
 * @returns {node is import('parse5').DefaultTreeAdapterTypes.Element}
 */
function isElementNode(node) {
  return 'tagName' in node && typeof node.tagName === 'string';
}

/**
 * @param {import('parse5').DefaultTreeAdapterTypes.Node} node
 * @returns {node is import('parse5').DefaultTreeAdapterTypes.Template}
 */
function isTemplateElement(node) {
  return isElementNode(node) && node.tagName === 'template' && 'content' in node;
}

/**
 * @param {string} html
 * @param {IconHostReplacement[]} replacements
 */
function applyHtmlReplacements(html, replacements) {
  let output = '';
  let cursor = 0;
  for (const replacement of replacements) {
    output += html.slice(cursor, replacement.start);
    output += replacement.html;
    cursor = replacement.end;
  }
  return output + html.slice(cursor);
}

/**
 * @param {string} startTag
 * @param {Map<string, string | true>} attributes
 * @param {ReturnType<typeof createIconResolver>} resolver
 * @param {string} [effectiveIconLoading]
 */
async function renderRocketIconHost(startTag, attributes, resolver, effectiveIconLoading) {
  const name = stringAttribute(attributes, 'name')?.trim();
  if (!name) {
    throw new Error('rocket-icon requires a non-empty name attribute.');
  }

  const iconLoading = iconLoadingForAttributes(attributes);
  if (!ICON_LOADING_VALUES.has(iconLoading)) {
    throw new Error(
      `Invalid rocket-icon icon-loading ${JSON.stringify(
        iconLoading,
      )}. Expected "auto", "server", or "client".`,
    );
  }

  const libraryAttribute = stringAttribute(attributes, 'library');
  const library = resolver.resolveLibrary(libraryAttribute, name);
  const resolvedIconLoading = effectiveIconLoading || iconLoading;
  const svg = resolvedIconLoading === 'client' ? '' : await resolver.loadIcon(library, name);

  return {
    html: `${startTag}${shadowTemplate(svg)}</rocket-icon>`,
    iconLoading: resolvedIconLoading,
    library,
    name,
    svg,
  };
}

/**
 * @param {{
 *   layoutIconLibraries?: unknown;
 *   layoutDefaultIconLibrary?: string;
 *   projectIconLibraries?: unknown;
 *   projectDefaultIconLibrary?: string;
 * }} options
 */
function createIconResolver({
  layoutIconLibraries,
  layoutDefaultIconLibrary,
  projectIconLibraries,
  projectDefaultIconLibrary,
}) {
  const layoutLibraries = normalizeIconLibrariesConfig(
    layoutIconLibraries,
    'Layout Icon Libraries',
  );
  const projectLibraries = normalizeIconLibrariesConfig(
    projectIconLibraries,
    'Project Icon Library Configuration',
  );
  for (const name of projectLibraries.keys()) {
    if (layoutLibraries.has(name)) {
      throw new Error(
        `Icon Library "${name}" is supplied by both project configuration and the active layout.`,
      );
    }
  }

  const libraries = new Map([...layoutLibraries, ...projectLibraries]);
  const defaultLibrary = selectDefaultIconLibrary({
    libraries,
    layoutDefaultIconLibrary,
    projectDefaultIconLibrary,
  });

  return {
    defaultLibrary,
    libraries,
    /**
     * @param {string | undefined} explicitLibrary
     * @param {string} iconName
     */
    resolveLibrary(explicitLibrary, iconName) {
      if (explicitLibrary !== undefined) {
        const trimmed = explicitLibrary.trim();
        if (!trimmed) {
          throw new Error(`rocket-icon library must be non-empty when provided.`);
        }
        if (!libraries.has(trimmed)) {
          throw new Error(`Unknown Icon Library "${trimmed}" for rocket-icon "${iconName}".`);
        }
        return trimmed;
      }
      if (defaultLibrary) {
        return defaultLibrary;
      }
      if (libraries.size === 0) {
        throw new Error(
          `rocket-icon "${iconName}" has no Icon Library. Configure iconLibraries or provide library.`,
        );
      }
      throw new Error(
        `Ambiguous unqualified rocket-icon "${iconName}". Provide library or configure defaultIconLibrary.`,
      );
    },
    /**
     * @param {string} library
     * @param {string} iconName
     */
    async loadIcon(library, iconName) {
      const config = libraries.get(library);
      if (!config) {
        throw new Error(`Unknown Icon Library "${library}" for rocket-icon "${iconName}".`);
      }
      const icons = await indexIconLibrary(library, config);
      const svg = icons.get(iconName);
      if (svg === undefined) {
        throw new Error(`Icon "${iconName}" was not found in Icon Library "${library}".`);
      }
      return svg;
    },
  };
}

/**
 * @param {object} options
 * @param {Map<string, import('@rocket/js/types.js').NormalizedIconLibraryConfig>} options.libraries
 * @param {string} [options.layoutDefaultIconLibrary]
 * @param {string} [options.projectDefaultIconLibrary]
 */
function selectDefaultIconLibrary({
  libraries,
  layoutDefaultIconLibrary,
  projectDefaultIconLibrary,
}) {
  const configuredDefault = projectDefaultIconLibrary || layoutDefaultIconLibrary;
  if (configuredDefault !== undefined) {
    const defaultName = configuredDefault.trim();
    if (!defaultName) {
      throw new Error('defaultIconLibrary must be a non-empty string.');
    }
    if (!libraries.has(defaultName)) {
      throw new Error(`Default Icon Library "${defaultName}" is not configured.`);
    }
    return defaultName;
  }
  if (libraries.size === 1) {
    return [...libraries.keys()][0];
  }
  return undefined;
}

/**
 * @param {string} libraryName
 * @param {import('@rocket/js/types.js').NormalizedIconLibraryConfig} config
 */
async function indexIconLibrary(libraryName, config) {
  const cacheKey = `${libraryName}:${JSON.stringify(config.sources)}`;
  let cached = libraryIndexCache.get(cacheKey);
  if (!cached) {
    cached = readIconLibrary(libraryName, config);
    libraryIndexCache.set(cacheKey, cached);
  }
  return cached;
}

/**
 * @param {string} libraryName
 * @param {import('@rocket/js/types.js').NormalizedIconLibraryConfig} config
 */
async function readIconLibrary(libraryName, config) {
  /** @type {Map<string, string>} */
  const icons = new Map();
  for (const source of config.sources) {
    const files = await iconSourceFiles(source);
    if (files.length === 0) {
      throw new Error(
        `Icon Library "${libraryName}" source ${JSON.stringify(source.files)} matched no SVG files.`,
      );
    }
    for (const file of files) {
      const iconName = path.basename(file, '.svg');
      if (icons.has(iconName)) {
        throw new Error(`Duplicate Icon Name "${iconName}" in Icon Library "${libraryName}".`);
      }
      icons.set(iconName, await readFile(file, 'utf8'));
    }
  }
  return icons;
}

/**
 * @param {import('@rocket/js/types.js').IconLibrarySource} source
 * @returns {Promise<string[]>}
 */
async function iconSourceFiles(source) {
  const pattern =
    source.type === 'package'
      ? path.join(packageRoot(source.packageName), source.files)
      : path.resolve(source.files);
  const files = [];
  for await (const file of glob(pattern)) {
    if (file.endsWith('.svg')) {
      files.push(path.resolve(file));
    }
  }
  files.sort();
  return files;
}

/**
 * @param {string} packageName
 */
function packageRoot(packageName) {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`, { paths: [process.cwd()] }));
  } catch (error) {
    throw new Error(`Could not resolve Icon package ${JSON.stringify(packageName)}.`, {
      cause: error,
    });
  }
}

/**
 * @param {unknown} iconLibraries
 * @param {string} owner
 * @returns {[string, unknown][]}
 */
function iconLibraryEntries(iconLibraries, owner) {
  if (iconLibraries instanceof Map) {
    return [...iconLibraries.entries()];
  }
  if (!isPlainRecord(iconLibraries)) {
    throw new Error(`Invalid ${owner}: iconLibraries must be an object.`);
  }
  return Object.entries(iconLibraries);
}

/**
 * @param {unknown} config
 * @param {string} field
 * @returns {import('@rocket/js/types.js').IconLibrarySource[]}
 */
function normalizeIconLibrarySources(config, field) {
  if (isIconLibrarySource(config)) {
    return [normalizeIconLibrarySource(config, field)];
  }
  if (isPlainRecord(config) && Object.prototype.hasOwnProperty.call(config, 'type')) {
    return [normalizeIconLibrarySource(config, field)];
  }
  if (Array.isArray(config)) {
    return config.map(source => normalizeIconLibrarySource(source, field));
  }
  if (isPlainRecord(config) && Object.prototype.hasOwnProperty.call(config, 'sources')) {
    return normalizeIconLibrarySources(config.sources, `${field}.sources`);
  }
  throw new Error(
    `Invalid ${field}: expected an Icon Library Source, an array of sources, or { sources } configuration.`,
  );
}

/**
 * @param {unknown} source
 * @param {string} field
 * @returns {import('@rocket/js/types.js').IconLibrarySource}
 */
function normalizeIconLibrarySource(source, field) {
  if (!isPlainRecord(source)) {
    throw new Error(`Invalid ${field}: Icon Library Sources must be objects.`);
  }
  if (source.type === 'package') {
    return iconsFromPackage(
      readNonEmptyString(source.packageName, `${field}.packageName`),
      readNonEmptyString(source.files, `${field}.files`),
    );
  }
  if (source.type === 'path') {
    return iconsFromPath(readNonEmptyString(source.files, `${field}.files`));
  }
  throw new Error(`Invalid ${field}: Icon Library Source type must be "package" or "path".`);
}

/**
 * @param {unknown} value
 * @returns {value is import('@rocket/js/types.js').IconLibrarySource}
 */
function isIconLibrarySource(value) {
  return isPlainRecord(value) && (value.type === 'package' || value.type === 'path');
}

/**
 * @param {string} svg
 */
function shadowTemplate(svg) {
  return `<template shadowrootmode="open"><style>${SHADOW_ICON_STYLE}</style><span part="icon">${svg}</span></template>`;
}

/**
 * @param {string} library
 * @param {string} name
 */
function iconReferenceKey(library, name) {
  return `${library}:${name}`;
}

/**
 * @param {{ library: string; name: string; svg: string }} icon
 */
function iconAssetUrl({ library, name, svg }) {
  const hash = createHash('sha256').update(svg).digest('hex').slice(0, 12);
  return `${ROCKET_ICON_ASSET_PREFIX}${sanitizePathSegment(library)}/${sanitizePathSegment(
    name,
  )}.${hash}.svg`;
}

/**
 * @param {string} html
 * @param {{ defaultLibrary?: string; icons: Record<string, string> }} manifest
 */
function injectIconManifest(html, manifest) {
  const manifestJson = JSON.stringify(
    manifest.defaultLibrary
      ? { defaultLibrary: manifest.defaultLibrary, icons: manifest.icons }
      : { icons: manifest.icons },
  ).replaceAll('<', '\\u003C');
  const runtimeHtml =
    `<script type="application/json" data-rocket-icon-manifest>${manifestJson}</script>` +
    `<script type="module" data-rocket-icon-runtime>import '${ROCKET_ICON_DEFINE_MODULE_PATH}';</script>`;
  const headClose = html.toLowerCase().indexOf('</head>');
  if (headClose !== -1) {
    return html.slice(0, headClose) + runtimeHtml + html.slice(headClose);
  }
  return html + runtimeHtml;
}

/**
 * @param {{ _hydrationScript?: string; _hasBrowserLoadedComponents?: boolean } | undefined} pageData
 */
function pageNeedsDeferredIconRuntime(pageData) {
  return Boolean(pageData?._hasBrowserLoadedComponents || pageData?._hydrationScript);
}

/**
 * @param {string} value
 */
function sanitizePathSegment(value) {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || 'icon';
}

/**
 * @param {Map<string, string | true>} attributes
 * @param {string} name
 */
function stringAttribute(attributes, name) {
  const value = attributes.get(name);
  return typeof value === 'string' ? value : undefined;
}

/**
 * @param {Map<string, string | true>} attributes
 */
function iconLoadingForAttributes(attributes) {
  return attributes.has('icon-loading')
    ? stringAttribute(attributes, 'icon-loading') || ''
    : 'auto';
}

/**
 * @param {unknown} value
 * @param {string} field
 */
function readNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value;
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
