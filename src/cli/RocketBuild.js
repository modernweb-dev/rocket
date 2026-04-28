import { getPages } from '../pages.js';
import { copyFileSync, existsSync, globSync, mkdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { register } from 'node:module';
import { MessageChannel } from 'node:worker_threads';
import { build } from 'vite';
import path from 'node:path';
import { PageRuntime } from '../page-runtime.js';
import { createIconAssetStore, rocketIconRuntimeOutputs } from '../icons.js';
import { paginatedArchivePaths } from '../page-pagination.js';
import { createStaticPageModuleLoader } from '../static-page-module-loader.js';
import { writeSiteDiscoverabilityOutputs } from '../siteDiscoverability.js';
import { normalizeDocumentPath, standaloneDemoPaths } from '../standalone-demo-url.js';
import {
  assertPublicAssetsOutputDir,
  copyPublicAssets,
  discoverPublicAssets,
  validatePublicAssetCollisions,
} from '../publicAssets.js';
import {
  validateUrlLifecycleGeneratedOutputCollisions,
  validateUrlLifecyclePageCollisions,
} from '../urlLifecycle.js';
import {
  captureSocialPreviewImageWithBrowser,
  generateStaticDefaultSocialPreviewImages,
  publicSocialPreviewPages,
} from '../socialPreviewImages.js';

export class RocketBuild {
  /**
   * @type {((options: {
   *   html: string;
   *   width: number;
   *   height: number;
   *   pathname: string;
   * }) => Promise<Uint8Array> | Uint8Array) | undefined}
   */
  socialPreviewCapture;

  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;

    program
      .command('build')
      .option('-o, --output-dir <path>', 'Path where to output built files')
      .action(async ({ outputDir }) => {
        if (outputDir) {
          this.outputDir = outputDir;
        }
        await this.build();
      });
  }

  async build() {
    await this.cli?.getConfig?.();
    if (!this.cli?.config) {
      throw new Error('Missing Config');
    }

    const { port1 } = new MessageChannel();

    // register must be AFTER the config is read
    register('../markdownHook.js', {
      parentURL: import.meta.url,
      data: { port: port1 },
      transferList: [port1],
    });

    process.env.ENVIRONMENT = 'BUILD';

    const pages = await getPages(
      process.cwd(),
      this.cli.config.includeGlobs,
      this.cli.config.excludeRegex,
    );
    validateUrlLifecyclePageCollisions({
      redirects: this.cli.config.urlLifecycle?.redirects,
      pages,
    });
    const { staticPages, serverPages } = splitPages(pages);
    if (serverPages.size && !this.cli.config.adapter) {
      throw new Error(
        `${serverPages.size} page(s) use config.render = 'server', but no adapter is configured`,
      );
    }
    const publicAssets = discoverPublicAssets(process.cwd());
    validatePublicAssetCollisions({
      publicAssets,
      pages,
      generatedPages: staticPages,
      config: this.cli.config,
      emitRedirectFallbacks: !this.cli.config.adapter,
    });
    const outDir = this.outputDir ? path.resolve(this.outputDir) : path.resolve('dist');
    assertPublicAssetsOutputDir({ projectRoot: process.cwd(), outDir });

    try {
      if (existsSync('tmp-dist-rocket')) {
        rmSync('tmp-dist-rocket', { recursive: true });
      }

      const { defaultSocialPreviewImages } = await renderStaticPages({
        pages,
        staticPages,
        urlLifecycle: this.cli.config.urlLifecycle,
        siteHeadMetadata: this.cli.config.siteHeadMetadata,
        siteOrigin: this.cli.config.siteOrigin,
        iconLibraries: this.cli.config.iconLibraries,
        defaultIconLibrary: this.cli.config.defaultIconLibrary,
        socialPreviewCacheDirectory: path.resolve('.rocket/social-preview-images'),
        captureSocialPreviewImage: this.socialPreviewCapture,
        emitRedirectFallbacks: !this.cli.config.adapter,
      });

      const entries = existsSync('tmp-dist-rocket')
        ? globSync('**/*.html', { cwd: 'tmp-dist-rocket' }).map(p =>
            path.resolve('tmp-dist-rocket', p),
          )
        : [];

      if (entries.length) {
        await build({
          configFile: false,
          root: 'tmp-dist-rocket',
          build: {
            outDir,
            target: 'esnext',
            emptyOutDir: true,
            manifest: true,
            rollupOptions: {
              external: [/^\/assets\//, /^\/_rocket\//, '/src/components/RocketDrawer.js'],
              input: entries,
            },
          },
        });
      } else {
        clearExistingOutputDir(outDir);
        mkdirSync(outDir, { recursive: true });
      }

      copyStaticFileOutputs(outDir);
      writeSiteDiscoverabilityOutputs({ pages, outDir, config: this.cli.config });

      if (this.cli.config.adapter) {
        await this.cli.config.adapter.build({
          pages,
          staticPages,
          serverPages,
          outDir,
          projectRoot: process.cwd(),
          config: this.cli.config,
          defaultSocialPreviewImages,
        });
      }

      copyPublicAssets({ publicAssets, outDir });
    } finally {
      if (existsSync('tmp-dist-rocket')) {
        rmSync('tmp-dist-rocket', { recursive: true });
      }
    }
  }
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @returns {{ staticPages: import('@rocket/js/types.js').PageRegistry; serverPages: import('@rocket/js/types.js').PageRegistry }}
 */
export function splitPages(pages) {
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const staticPages = new Map();
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const serverPages = new Map();
  for (const [pagePath, page] of pages) {
    const renderMode = page.module.config.render || 'static';
    if (renderMode === 'server') {
      serverPages.set(pagePath, page);
    } else if (renderMode === 'static') {
      staticPages.set(pagePath, page);
    } else {
      throw new Error(
        `Invalid render mode ${JSON.stringify(renderMode)} for page ${page.file}. ` +
          `Expected "static" or "server".`,
      );
    }
  }
  return { staticPages, serverPages };
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   staticPages: import('@rocket/js/types.js').PageRegistry;
 *   pageModuleLoader?: import('../page-runtime.js').PageModuleLoader;
 *   origin?: string;
 *   urlLifecycle?: import('@rocket/js/types.js').UrlLifecycleConfig;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig;
 *   defaultIconLibrary?: string;
 *   iconAssetStore?: import('../icons.js').IconAssetStore;
 *   socialPreviewCacheDirectory?: string;
 *   captureSocialPreviewImage?: (options: {
 *     html: string;
 *     width: number;
 *     height: number;
 *     pathname: string;
 *   }) => Promise<Uint8Array> | Uint8Array;
 *   emitRedirectFallbacks?: boolean;
 * }} options
 * @returns {Promise<{ defaultSocialPreviewImages: Map<string, string> }>}
 */
export async function renderStaticPages({
  pages,
  staticPages,
  pageModuleLoader = createStaticPageModuleLoader(),
  origin = 'http://localhost',
  urlLifecycle,
  siteHeadMetadata,
  siteOrigin,
  iconLibraries,
  defaultIconLibrary,
  iconAssetStore = createIconAssetStore(),
  socialPreviewCacheDirectory,
  captureSocialPreviewImage = captureSocialPreviewImageWithBrowser,
  emitRedirectFallbacks = true,
}) {
  assertStaticJavaScriptPagesHaveConcretePaths(staticPages);
  assertNoStandaloneDemoPathCollisions(pages, staticPages);
  assertNoPaginatedArchivePathCollisions(pages, staticPages);
  validateUrlLifecycleGeneratedOutputCollisions({
    redirects: urlLifecycle?.redirects,
    pages,
    staticPages,
  });
  const socialPreviewPages = publicSocialPreviewPages(pages);
  const defaultSocialPreviewImageOutputs = await generateStaticDefaultSocialPreviewImages({
    pages: socialPreviewPages,
    siteHeadMetadata,
    siteOrigin,
    cacheDirectory: socialPreviewCacheDirectory,
    captureSocialPreviewImage,
  });
  /** @type {Map<string, string>} */
  const defaultSocialPreviewImages = new Map();
  for (const [pagePath, output] of defaultSocialPreviewImageOutputs) {
    defaultSocialPreviewImages.set(pagePath, output.publicUrl);
  }
  for (const output of defaultSocialPreviewImageOutputs.values()) {
    writeFileOutput(output.publicPath, output.data);
  }
  const pageRuntime = new PageRuntime({
    pages,
    pageModuleLoader,
    siteHeadMetadata,
    siteOrigin,
    iconLibraries,
    defaultIconLibrary,
    iconAssetStore,
    defaultSocialPreviewImages,
  });
  for (const [pagePath, page] of staticPages) {
    try {
      const response = await pageRuntime.render(new Request(new URL(pagePath, origin)));
      await writeStaticResponse(pagePath, response);
      for (const archivePath of paginatedArchivePaths({ pages, page, pagePath })) {
        const archiveResponse = await pageRuntime.render(new Request(new URL(archivePath, origin)));
        await writeStaticResponse(archivePath, archiveResponse);
      }
      for (const demoPath of standaloneDemoPaths(pagePath, page)) {
        const demoResponse = await pageRuntime.render(new Request(new URL(demoPath, origin)));
        writeHtml(demoPath, await demoResponse.text());
      }
    } catch (error) {
      throw new Error('Failed to render page: ' + pagePath, { cause: error });
    }
  }
  writeIconAssetOutputs(iconAssetStore);
  if (emitRedirectFallbacks) {
    writeRedirectFallbackFiles(urlLifecycle?.redirects);
  }
  return { defaultSocialPreviewImages };
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} staticPages
 */
function assertStaticJavaScriptPagesHaveConcretePaths(staticPages) {
  for (const [pagePath, page] of staticPages) {
    if (!page.file.endsWith('.js') || !hasPathParameter(pagePath)) {
      continue;
    }
    throw new Error(
      `Static JavaScript Page ${pagePath} (${page.file}) cannot be rendered as one static ` +
        `output document because its path is parameterized. Parameterized JavaScript Pages need ` +
        `request-time rendering until Rocket has an API for enumerating static params. Use ` +
        `render: 'server' for this Page today.`,
    );
  }
}

/**
 * @param {string} pagePath
 */
function hasPathParameter(pagePath) {
  return /(^|\/):[^/]+/.test(pagePath);
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @param {import('@rocket/js/types.js').PageRegistry} staticPages
 */
function assertNoStandaloneDemoPathCollisions(pages, staticPages) {
  const configuredPages = configuredPageOutputPaths(pages);
  for (const [pagePath, page] of staticPages) {
    for (const demoPath of standaloneDemoPaths(pagePath, page)) {
      const collision = configuredPages.get(normalizeDocumentPath(demoPath));
      if (collision) {
        throw new Error(
          `Standalone Demo URL ${demoPath} for page ${page.file} collides with configured ` +
            `Page ${collision.page.file} at ${collision.path}`,
        );
      }
    }
  }
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @param {import('@rocket/js/types.js').PageRegistry} staticPages
 */
function assertNoPaginatedArchivePathCollisions(pages, staticPages) {
  const configuredPages = configuredPageOutputPaths(pages);
  const standaloneDemoPages = standaloneDemoOutputPaths(staticPages);
  const archivePages = new Map();
  for (const [pagePath, page] of staticPages) {
    for (const archivePath of paginatedArchivePaths({ pages, page, pagePath })) {
      const archiveOutputPath = normalizeDocumentPath(archivePath);
      const collision = configuredPages.get(archiveOutputPath);
      if (collision) {
        throw new Error(
          `Generated archive Page ${archivePath} for page ${page.file} collides with ` +
            `configured Page ${collision.page.file} at ${collision.path}`,
        );
      }
      const archiveCollision = archivePages.get(archiveOutputPath);
      if (archiveCollision) {
        throw new Error(
          `Generated archive Page ${archivePath} for page ${page.file} collides with ` +
            `generated archive Page ${archiveCollision.path} for page ${archiveCollision.page.file}`,
        );
      }
      const standaloneDemoCollision = standaloneDemoPages.get(archiveOutputPath);
      if (standaloneDemoCollision) {
        throw new Error(
          `Generated archive Page ${archivePath} for page ${page.file} collides with ` +
            `Standalone Demo URL ${standaloneDemoCollision.path} for page ${standaloneDemoCollision.page.file}`,
        );
      }
      archivePages.set(archiveOutputPath, { path: archivePath, page });
    }
  }
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} staticPages
 */
function standaloneDemoOutputPaths(staticPages) {
  const paths = new Map();
  for (const [pagePath, page] of staticPages) {
    for (const demoPath of standaloneDemoPaths(pagePath, page)) {
      paths.set(normalizeDocumentPath(demoPath), { path: demoPath, page });
    }
  }
  return paths;
}

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @returns {Map<string, { path: string; page: import('../page-runtime.js').Page }>}
 */
function configuredPageOutputPaths(pages) {
  const paths = new Map();
  for (const [pagePath, page] of pages) {
    paths.set(normalizeDocumentPath(pagePath), { path: pagePath, page });
  }
  return paths;
}

/**
 * @param {string} outDir
 */
function copyStaticFileOutputs(outDir) {
  if (!existsSync('tmp-dist-rocket')) {
    return;
  }
  for (const file of globSync('**/*', { cwd: 'tmp-dist-rocket' })) {
    const source = path.join('tmp-dist-rocket', file);
    if (!statSync(source).isFile() || file.endsWith('.html')) {
      continue;
    }
    const destination = path.join(outDir, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
}

/**
 * @param {import('../icons.js').IconAssetStore} iconAssetStore
 */
function writeIconAssetOutputs(iconAssetStore) {
  for (const output of iconAssetStore.outputs()) {
    writeFileOutput(output.url, Buffer.from(output.svg, 'utf8'));
  }
  if (!iconAssetStore.needsRuntime) {
    return;
  }
  for (const output of rocketIconRuntimeOutputs()) {
    writeFileOutput(output.path, Buffer.from(output.data, 'utf8'));
  }
}

/**
 * @param {string} outDir
 */
function clearExistingOutputDir(outDir) {
  if (!existsSync(outDir)) {
    return;
  }
  const projectRoot = path.resolve(process.cwd());
  const relativeOutDir = path.relative(projectRoot, outDir);
  if (
    relativeOutDir === '' ||
    relativeOutDir.startsWith(`..${path.sep}`) ||
    relativeOutDir === '..' ||
    path.isAbsolute(relativeOutDir)
  ) {
    throw new Error(
      `Invalid build output directory ${outDir}. ` +
        `Rocket can only clear an existing output directory inside the project root.`,
    );
  }
  rmSync(outDir, { recursive: true });
}

/**
 * @param {import('@rocket/js/types.js').RedirectConfig[] | undefined} redirects
 */
function writeRedirectFallbackFiles(redirects = []) {
  for (const redirect of redirects) {
    const html = redirectFallbackHtml(redirect.target);
    if (isFileOutputPath(redirect.source)) {
      writeFileOutput(redirect.source, Buffer.from(html, 'utf8'));
      continue;
    }
    writeHtml(redirect.source, html);
  }
}

/**
 * @param {string} target
 */
function redirectFallbackHtml(target) {
  const escapedTarget = escapeHtml(target);
  const scriptTarget = JSON.stringify(target).replaceAll('<', '\\u003C');
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    `  <meta http-equiv="refresh" content="0; url=${escapedTarget}">`,
    `  <link rel="canonical" href="${escapedTarget}" vite-ignore>`,
    '  <title>Redirecting</title>',
    '</head>',
    '<body>',
    `  <p>Redirecting to <a href="${escapedTarget}">${escapedTarget}</a>.</p>`,
    `  <script>window.location.replace(${scriptTarget});</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/**
 * @param {string} pagePath
 * @param {Response} response
 */
async function writeStaticResponse(pagePath, response) {
  const data = new Uint8Array(await response.arrayBuffer());
  if (isFileOutputPath(pagePath)) {
    writeFileOutput(pagePath, data);
    return;
  }
  writeHtml(pagePath, Buffer.from(data).toString('utf8'));
}

/**
 * @param {string} pagePath
 * @returns {boolean}
 */
function isFileOutputPath(pagePath) {
  return path.extname(pagePath) !== '';
}

/**
 * @param {string} pagePath
 * @param {Uint8Array} data
 */
function writeFileOutput(pagePath, data) {
  if (!pagePath.startsWith('/')) {
    pagePath = '/' + pagePath;
  }
  const outputPath = 'tmp-dist-rocket' + pagePath;
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, data);
}

/**
 * @param {string} pagePath
 * @param {string} data
 */
function writeHtml(pagePath, data) {
  pagePath = normalizeDocumentPath(pagePath);
  const outputPath = 'tmp-dist-rocket' + pagePath;
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }
  writeFileSync(outputPath + 'index.html', data);
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
