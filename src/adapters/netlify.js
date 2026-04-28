/** Runs on: server */
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { normalizeIconLibrariesConfig, rocketIconRuntimeOutputs } from '../icons.js';
import { rocketMarkdownPlugin } from '../markdownCompiler.js';
import { standaloneDemoRoutePatterns } from '../standalone-demo-url.js';

const ROCKET_ICON_FUNCTION_PATHS = [
  '/_rocket/icons/:library/:iconFile',
  '/_rocket/rocket-icon.js',
  '/_rocket/RocketIcon.js',
];
const ROCKET_BOOTSTRAP_ICON_INCLUDED_FILES = [
  'node_modules/bootstrap-icons/package.json',
  'node_modules/bootstrap-icons/icons/*.svg',
];
const ROCKET_BOOTSTRAP_ICON_LIBRARIES = {
  bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
};

/**
 * @returns {import('@rocket/js/types.js').RocketAdapter}
 */
export function netlify() {
  return {
    name: 'netlify',
    async build(context) {
      writeNetlifyRedirectOutput(context);
      await buildNetlifyFunction(context);
    },
  };
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 */
function writeNetlifyRedirectOutput(context) {
  const redirects = context.config.urlLifecycle?.redirects || [];
  if (!redirects.length) {
    return;
  }

  mkdirSync(context.outDir, { recursive: true });
  writeFileSync(path.join(context.outDir, '_redirects'), makeNetlifyRedirectsSource(redirects));
}

/**
 * @param {import('@rocket/js/types.js').RedirectConfig[]} redirects
 */
function makeNetlifyRedirectsSource(redirects) {
  return redirects
    .map(redirect => `${redirect.source} ${redirect.target} ${redirect.status || 308}`)
    .join('\n')
    .concat('\n');
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 */
async function buildNetlifyFunction(context) {
  if (context.serverPages.size === 0) {
    return;
  }

  const tempDir = path.join(context.projectRoot, 'tmp-netlify-rocket');
  const entryFile = path.join(tempDir, 'rocket-ssr-entry.js');
  const componentsEntryFile = path.join(tempDir, 'rocket-live-components.js');
  const functionsDir = path.join(context.projectRoot, '.netlify', 'v1', 'functions');
  const functionFile = path.join(functionsDir, 'rocket-ssr.mjs');
  const liveAssets = new LiveAssets(context);

  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
  }
  mkdirSync(tempDir, { recursive: true });
  mkdirSync(functionsDir, { recursive: true });
  if (existsSync(functionFile)) {
    rmSync(functionFile);
  }

  try {
    copyServerAssets(context, functionsDir);
    writeFileSync(componentsEntryFile, makeLiveComponentsSource(context, liveAssets));
    writeFileSync(entryFile, makeNetlifyFunctionSource(context));

    await build({
      configFile: false,
      publicDir: false,
      root: context.projectRoot,
      plugins: [rocketMarkdownPlugin(), liveAssetPlugin(context, liveAssets)],
      resolve: {
        alias: [
          { find: '@rocket/js/components.js', replacement: componentsEntryFile },
          {
            find: path.join(context.projectRoot, 'exports/components.js'),
            replacement: componentsEntryFile,
          },
          {
            find: path.join(context.projectRoot, 'src/components.js'),
            replacement: componentsEntryFile,
          },
        ],
      },
      ssr: {
        noExternal: true,
      },
      build: {
        ssr: entryFile,
        outDir: functionsDir,
        emptyOutDir: false,
        target: 'node22',
        minify: false,
        rollupOptions: {
          output: {
            entryFileNames: 'rocket-ssr.mjs',
            format: 'es',
          },
        },
      },
    });

    await buildLiveAssets(context, liveAssets);
  } finally {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true });
    }
  }
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {string} functionsDir
 */
function copyServerAssets(context, functionsDir) {
  const componentAssets = path.join(context.projectRoot, 'src/components/assets');
  if (existsSync(componentAssets)) {
    cpSync(componentAssets, path.join(functionsDir, 'assets'), { recursive: true });
  }
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 */
export function makeNetlifyFunctionSource(context) {
  const allPages = Array.from(context.pages, ([pagePath, page]) => ({
    path: pagePath,
    file: page.file,
    metadata: page.metadata,
    demoNames: page.demoNames,
    config: page.module.config,
  }));
  const serverPages = Array.from(context.serverPages, ([pagePath, page], index) => {
    const type = page.file.endsWith('.rocket.md') ? 'markdown' : 'javascript';
    const demoNames = page.demoNames || [];
    return {
      path: pagePath,
      file: page.file,
      metadata: page.metadata,
      demoNames,
      config: page.module.config,
      moduleName: `pageModule${index}`,
      routePatterns: standaloneDemoRoutePatterns(pagePath, page),
      type,
      standaloneDemos:
        type === 'markdown'
          ? demoNames.map((demoName, demoIndex) => ({
              demoName,
              moduleName: `pageModule${index}StandaloneDemo${demoIndex}`,
            }))
          : [],
    };
  });

  const imports = serverPages
    .flatMap(page => {
      const specifier = pageModuleSpecifier(context, page.file);
      return [
        `import * as ${page.moduleName} from ${JSON.stringify(specifier)};`,
        ...page.standaloneDemos.map(demo => {
          const demoSpecifier = standaloneDemoModuleSpecifier(context, page.file, demo.demoName);
          return `import * as ${demo.moduleName} from ${JSON.stringify(demoSpecifier)};`;
        }),
      ];
    })
    .join('\n');

  const configPaths = JSON.stringify([
    ...serverPages.flatMap(page => [page.path, ...page.routePatterns]),
    ...ROCKET_ICON_FUNCTION_PATHS,
  ]);
  const includedFiles = JSON.stringify(netlifyIncludedFiles(context));
  const rocketIconRuntimeOutputEntries = JSON.stringify(rocketIconRuntimeOutputs());
  const urlLifecycle = JSON.stringify(context.config.urlLifecycle);
  const siteOrigin = JSON.stringify(context.config.siteOrigin);
  const siteHeadMetadata = JSON.stringify(context.config.siteHeadMetadata);
  const defaultSocialPreviewImages = JSON.stringify(
    Array.from(context.defaultSocialPreviewImages || []),
  );
  const standaloneDemoModuleEntries = serverPages
    .filter(page => page.standaloneDemos.length)
    .map(
      page =>
        `[${JSON.stringify(page.path)}, new Map([${page.standaloneDemos
          .map(demo => `[${JSON.stringify(demo.demoName)}, ${demo.moduleName}]`)
          .join(',')}])]`,
    )
    .join(',');
  const manifest = serverPages.map(page => ({
    path: page.path,
    file: page.file,
    metadata: page.metadata,
    config: page.config,
    type: page.type,
  }));

  return `import { normalizeLoadedPageModule } from '@rocket/js/loaded-page-module.js';
import { PageRuntime, PageRuntimeError } from '@rocket/js/page-runtime.js';
import { parseComponents } from '@rocket/js/components.js';
import { createIconAssetStore, resolveRocketIconAsset } from '@rocket/js/icons.js';
${imports}

const pageModules = [${serverPages.map(page => page.moduleName).join(', ')}];
const standaloneDemoModules = new Map([${standaloneDemoModuleEntries}]);
const allPages = ${JSON.stringify(allPages)};
const serverPages = ${JSON.stringify(manifest)}.map((page, index) => ({
  ...page,
  module: pageModules[index],
}));
const pageRegistry = new Map(
  allPages.map(page => [
    page.path,
    {
      file: page.file,
      metadata: page.metadata,
      demoNames: page.demoNames,
      module: { config: page.config },
    },
  ]),
);
const serverPageModules = new Map(serverPages.map(page => [page.path, page.module]));
const urlLifecycle = ${urlLifecycle};
const siteOrigin = ${siteOrigin};
const siteHeadMetadata = ${siteHeadMetadata};
const iconLibraries = ${JSON.stringify(context.config.iconLibraries)};
const defaultIconLibrary = ${JSON.stringify(context.config.defaultIconLibrary)};
const rocketBootstrapIconLibraries = ${JSON.stringify(ROCKET_BOOTSTRAP_ICON_LIBRARIES)};
const defaultSocialPreviewImages = new Map(${defaultSocialPreviewImages});
const iconAssetStore = createIconAssetStore();
const rocketIconRuntimeOutputsByPath = new Map(
  ${rocketIconRuntimeOutputEntries}.map(output => [output.path, output]),
);
const pageModuleLoader = {
  async load({ page, routePath, variant }) {
    if (page.file.endsWith('.rocket.md')) {
      const module = getMarkdownPageModule(routePath, variant);
      return normalizeLoadedPageModule({ kind: 'markdown', module, parseComponents });
    }
    const module = serverPageModules.get(routePath);
    return normalizeLoadedPageModule({ kind: 'javascript', module, parseComponents });
  },
};
const pageRuntime = new PageRuntime({
  pages: pageRegistry,
  pageModuleLoader,
  urlLifecycle,
  siteHeadMetadata,
  siteOrigin,
  iconLibraries,
  defaultIconLibrary,
  iconAssetStore,
  defaultSocialPreviewImages,
});

export const config = {
  path: ${configPaths},
  preferStatic: true,
  generator: '@rocket/js',
  includedFiles: ${includedFiles},
};

export default async function handler(request, context) {
  const url = new URL(request.url);

  try {
    const rocketIconResponse = await renderRocketIconOutput(url.pathname);
    if (rocketIconResponse) {
      return rocketIconResponse;
    }
    return await pageRuntime.render(request, { adapterContext: context });
  } catch (error) {
    if (!(error instanceof PageRuntimeError)) {
      throw error;
    }
    console.error('Failed to render page: ' + url.pathname, error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function renderRocketIconOutput(pathname) {
  const runtimeOutput = rocketIconRuntimeOutputsByPath.get(pathname);
  if (runtimeOutput) {
    return new Response(runtimeOutput.data, {
      headers: { 'content-type': runtimeOutput.type },
    });
  }

  const iconAsset =
    iconAssetStore.get(pathname) ||
    (await resolveRocketIconAsset(pathname, {
      iconLibraries,
      defaultIconLibrary,
    })) ||
    (await resolveRocketIconAsset(pathname, {
      iconLibraries: rocketBootstrapIconLibraries,
    }));
  if (!iconAsset) {
    return undefined;
  }
  return new Response(iconAsset.svg, {
    headers: { 'content-type': 'image/svg+xml' },
  });
}

function getMarkdownPageModule(routePath, variant) {
  if (typeof variant === 'object' && variant.kind === 'standalone-demo') {
    const module = standaloneDemoModules.get(routePath)?.get(variant.demoName);
    if (module) {
      return module;
    }
  }
  return serverPageModules.get(routePath);
}

`;
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @returns {string[]}
 */
function netlifyIncludedFiles(context) {
  const includedFiles = new Set(['assets/**', ...ROCKET_BOOTSTRAP_ICON_INCLUDED_FILES]);
  const iconLibraries = normalizeIconLibrariesConfig(
    context.config.iconLibraries,
    'Icon Library Configuration',
  );
  for (const config of iconLibraries.values()) {
    for (const source of config.sources) {
      if (source.type === 'package') {
        includedFiles.add(
          normalizePath(path.join('node_modules', source.packageName, 'package.json')),
        );
        includedFiles.add(
          normalizePath(path.join('node_modules', source.packageName, source.files)),
        );
      } else {
        includedFiles.add(netlifyIncludedPathSource(source.files, context.projectRoot));
      }
    }
  }
  return [...includedFiles];
}

/**
 * @param {string} files
 * @param {string} projectRoot
 */
function netlifyIncludedPathSource(files, projectRoot) {
  const resolved = path.resolve(projectRoot, files);
  const relative = path.relative(projectRoot, resolved);
  if (relative && !relative.startsWith(`..${path.sep}`) && relative !== '..') {
    return normalizePath(relative);
  }
  return normalizePath(files);
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {string} file
 */
function pageModuleSpecifier(context, file) {
  return pathToFileURL(path.resolve(context.projectRoot, file)).href;
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {string} file
 * @param {string} demoName
 */
function standaloneDemoModuleSpecifier(context, file, demoName) {
  const specifier = new URL(pageModuleSpecifier(context, file));
  specifier.searchParams.set('rocketSingleDemo', demoName);
  return specifier.href;
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {LiveAssets} liveAssets
 */
export function makeLiveComponentsSource(context, liveAssets) {
  const componentFiles = collectComponentFiles(context);
  const moduleImports = [];
  const moduleEntries = [];
  const publicPathEntries = [];
  let index = 0;

  for (const [componentFile, { needsClient }] of componentFiles) {
    const moduleName = `componentModule${index++}`;
    const resolvedFile = resolveComponentFile(componentFile, context);
    moduleImports.push(
      `import * as ${moduleName} from ${JSON.stringify(pathToFileURL(resolvedFile).href)};`,
    );
    moduleEntries.push(`[${JSON.stringify(componentFile)}, ${moduleName}]`);
    if (needsClient) {
      publicPathEntries.push(
        `[${JSON.stringify(componentFile)}, ${JSON.stringify(liveAssets.registerEntry(resolvedFile))}]`,
      );
    }
  }

  const hydrationLoaderPath = liveAssets.registerEntry(
    path.join(context.projectRoot, 'src/hydration/hydrationLoader.js'),
  );

  return `import { customElements } from '@lit-labs/ssr-dom-shim';
import { createComponentHydration } from '@rocket/js/component-hydration.js';
${moduleImports.join('\n')}

customElements.define = (name, ctor) => {
  customElements.__definitions.set(name, {
    ctor,
    observedAttributes: ctor.observedAttributes ?? [],
  });
};

const componentModules = new Map([${moduleEntries.join(', ')}]);
const componentPublicPaths = new Map([${publicPathEntries.join(', ')}]);

export const parseComponents = createComponentHydration({
  customElementsRegistry: customElements,
  loadComponentModule: getComponentModule,
  resolveBrowserImport: getComponentPublicPath,
  hydrationLoaderSpecifier: ${JSON.stringify(hydrationLoaderPath)},
});

async function getComponentModule(file) {
  const module = componentModules.get(file);
  if (module) {
    return module;
  }
  return import(file);
}

function getComponentPublicPath(file) {
  return componentPublicPaths.get(file) || file;
}
`;
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @returns {Map<string, {needsClient: boolean}>}
 */
function collectComponentFiles(context) {
  /** @type {Map<string, {needsClient: boolean}>} */
  const componentFiles = new Map();
  for (const page of context.serverPages.values()) {
    const components = page.module.components;
    if (!components) {
      continue;
    }
    for (const component of Object.values(components)) {
      const existing = componentFiles.get(component.file);
      const needsClient =
        component.loading === 'client' || component.loading.startsWith('hydrate:');
      componentFiles.set(component.file, {
        needsClient: needsClient || existing?.needsClient || false,
      });
    }
  }
  return componentFiles;
}

/**
 * @param {string} file
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @returns {string}
 */
function resolveComponentFile(file, context) {
  if (file.startsWith('.')) {
    return path.resolve(context.projectRoot, 'src', file);
  }
  if (path.isAbsolute(file)) {
    return file;
  }
  return fileURLToPath(import.meta.resolve(file));
}

class LiveAssets {
  /**
   * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
   */
  constructor(context) {
    this.context = context;
    /** @type {Map<string, {file: string; name: string; publicPath: string; outputPath: string}>} */
    this.entries = new Map();
    /** @type {Map<string, {file: string; publicPath: string; outputPath: string}>} */
    this.assets = new Map();
  }

  /**
   * @param {string} file
   * @returns {string}
   */
  register(file) {
    const cleanFile = stripQuery(file);
    const ext = path.extname(cleanFile).toLowerCase();
    if (isBundledAsset(ext)) {
      return this.registerEntry(cleanFile);
    }
    return this.registerCopiedAsset(cleanFile);
  }

  /**
   * @param {string} file
   * @returns {string}
   */
  registerEntry(file) {
    const cleanFile = stripQuery(file);
    const existing = this.entries.get(cleanFile);
    if (existing) {
      return existing.publicPath;
    }
    const ext = path.extname(cleanFile).toLowerCase();
    const name = liveAssetName(cleanFile);
    const publicExt = ext === '.css' ? '.css' : '.js';
    const publicPath = `/assets/rocket-live/${name}${publicExt}`;
    this.entries.set(cleanFile, {
      file: cleanFile,
      name,
      publicPath,
      outputPath: path.join(this.context.outDir, publicPath.slice(1)),
    });
    return publicPath;
  }

  /**
   * @param {string} file
   * @returns {string}
   */
  registerCopiedAsset(file) {
    const cleanFile = stripQuery(file);
    const existing = this.assets.get(cleanFile);
    if (existing) {
      return existing.publicPath;
    }
    const ext = path.extname(cleanFile);
    const publicPath = `/assets/rocket-live/${liveAssetName(cleanFile)}${ext}`;
    this.assets.set(cleanFile, {
      file: cleanFile,
      publicPath,
      outputPath: path.join(this.context.outDir, publicPath.slice(1)),
    });
    return publicPath;
  }

  getInput() {
    return Object.fromEntries(Array.from(this.entries.values(), entry => [entry.name, entry.file]));
  }

  copyAssets() {
    for (const asset of this.assets.values()) {
      mkdirSync(path.dirname(asset.outputPath), { recursive: true });
      copyFileSync(asset.file, asset.outputPath);
    }
  }
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {LiveAssets} liveAssets
 */
async function buildLiveAssets(context, liveAssets) {
  const input = liveAssets.getInput();
  if (Object.keys(input).length) {
    await build({
      configFile: false,
      publicDir: false,
      root: context.projectRoot,
      build: {
        outDir: context.outDir,
        emptyOutDir: false,
        target: 'esnext',
        rollupOptions: {
          preserveEntrySignatures: 'strict',
          input,
          output: {
            entryFileNames: 'assets/rocket-live/[name].js',
            chunkFileNames: 'assets/rocket-live/[name]-[hash].js',
            assetFileNames: 'assets/rocket-live/[name][extname]',
          },
        },
      },
    });
  }
  liveAssets.copyAssets();
}

/**
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 * @param {LiveAssets} liveAssets
 * @returns {import('vite').Plugin}
 */
function liveAssetPlugin(context, liveAssets) {
  const rocketResolveModules = new Set([
    normalizePath(path.join(context.projectRoot, 'src/resolve.js')),
    normalizePath(path.join(context.projectRoot, 'exports/resolve.js')),
  ]);

  return {
    name: 'rocket-live-assets',
    enforce: 'post',
    async transform(code, id) {
      if (!code.includes('resolve') || !code.includes('import.meta')) {
        return;
      }

      let ast;
      try {
        ast = this.parse(code);
      } catch {
        return;
      }

      const resolveNames = await findRocketResolveNames(ast, id, this, rocketResolveModules);
      if (resolveNames.size === 0) {
        return;
      }

      /** @type {any[]} */
      const callNodes = [];
      walk(ast, node => {
        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          resolveNames.has(node.callee.name) &&
          node.arguments.length >= 2 &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string' &&
          isImportMeta(node.arguments[1])
        ) {
          callNodes.push(node);
        }
      });

      if (callNodes.length === 0) {
        return;
      }

      const replacements = [];
      for (const node of callNodes) {
        const specifier = node.arguments[0].value;
        const resolved = await this.resolve(specifier, id, { skipSelf: true });
        if (!resolved || resolved.external) {
          continue;
        }
        replacements.push({
          start: node.start,
          end: node.end,
          value: JSON.stringify(liveAssets.register(resolved.id)),
        });
      }

      if (replacements.length === 0) {
        return;
      }

      return {
        code: applyReplacements(code, replacements),
        map: null,
      };
    },
  };
}

/**
 * @param {any} ast
 * @param {string} id
 * @param {any} pluginContext
 * @param {Set<string>} rocketResolveModules
 * @returns {Promise<Set<string>>}
 */
async function findRocketResolveNames(ast, id, pluginContext, rocketResolveModules) {
  /** @type {{source: string; localName: string}[]} */
  const imports = [];
  walk(ast, node => {
    if (node.type !== 'ImportDeclaration') {
      return;
    }
    for (const specifier of node.specifiers) {
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported.type === 'Identifier' &&
        specifier.imported.name === 'resolve'
      ) {
        imports.push({
          source: node.source.value,
          localName: specifier.local.name,
        });
      }
    }
  });

  const resolveNames = new Set();
  for (const importData of imports) {
    const resolved = await pluginContext.resolve(importData.source, id, { skipSelf: true });
    if (!resolved || resolved.external) {
      continue;
    }
    if (rocketResolveModules.has(normalizePath(stripQuery(resolved.id)))) {
      resolveNames.add(importData.localName);
    }
  }
  return resolveNames;
}

/**
 * @param {any} node
 * @param {(node: any) => void} visitor
 */
function walk(node, visitor) {
  if (!node || typeof node.type !== 'string') {
    return;
  }
  visitor(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        walk(child, visitor);
      }
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      walk(value, visitor);
    }
  }
}

/**
 * @param {any} node
 * @returns {boolean}
 */
function isImportMeta(node) {
  return (
    node.type === 'MetaProperty' &&
    node.meta.type === 'Identifier' &&
    node.meta.name === 'import' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'meta'
  );
}

/**
 * @param {string} code
 * @param {{start: number; end: number; value: string}[]} replacements
 * @returns {string}
 */
function applyReplacements(code, replacements) {
  let result = '';
  let lastIndex = 0;
  for (const replacement of replacements.sort((a, b) => a.start - b.start)) {
    result += code.slice(lastIndex, replacement.start);
    result += replacement.value;
    lastIndex = replacement.end;
  }
  result += code.slice(lastIndex);
  return result;
}

/**
 * @param {string} file
 * @returns {string}
 */
function liveAssetName(file) {
  const ext = path.extname(file);
  const baseName = path.basename(file, ext).replace(/[^a-zA-Z0-9_-]/g, '-') || 'asset';
  const hash = createHash('sha1').update(file).digest('hex').slice(0, 10);
  return `${baseName}-${hash}`;
}

/**
 * @param {string} ext
 * @returns {boolean}
 */
function isBundledAsset(ext) {
  return ext === '.js' || ext === '.mjs' || ext === '.css';
}

/**
 * @param {string} id
 * @returns {string}
 */
function stripQuery(id) {
  return id.split('?')[0];
}

/**
 * @param {string} id
 * @returns {string}
 */
function normalizePath(id) {
  return path.normalize(id).split(path.sep).join('/');
}
