/* eslint-disable no-console */
/** Runs on: server */
import { getPages } from './pages.js';
import { URLPattern } from 'urlpattern-polyfill';
import fs from 'node:fs';
import { debounce } from './debounce.js';
import path from 'node:path';
import { createIconAssetStore, rocketIconRuntimeOutputs } from './icons.js';
import { createDevelopmentPageModuleLoader } from './development-page-module-loader.js';
import { PageRuntime, PageRuntimeError } from './page-runtime.js';
import {
  PUBLIC_ASSETS_DIR,
  discoverPublicAssets,
  findPublicAsset,
  readPublicAsset,
  validatePublicAssetCollisions,
} from './publicAssets.js';
import { serveSocialPreviewTemplatePreview } from './socialPreviewTemplatePreview.js';

/** @type {import('@rocket/js/types.js').PageRegistry} */
let pageRegistry = new Map();

/** @type {Map<string, Set<string>>} */
let modules = new Map();

/** @typedef {import('@rocket/js/types.js').UrlLifecycleConfig} UrlLifecycleConfig */
/** @typedef {{ urlLifecycle?: UrlLifecycleConfig; siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig; siteOrigin?: string; siteDiscoverability?: import('@rocket/js/types.js').SiteDiscoverabilityConfig; iconLibraries?: import('@rocket/js/types.js').IconLibrariesConfig; defaultIconLibrary?: string; captureSocialPreviewImage?: import('./socialPreviewImages.js').SocialPreviewCapture; watch?: boolean }} RocketDevServerPluginOptions */
/** @typedef {RocketDevServerPluginOptions | UrlLifecycleConfig} RocketDevServerPluginInput */

/** @type {(include: string[], exclude: (string | RegExp)[], resolverPort: import('node:worker_threads').MessagePort, options?: RocketDevServerPluginInput) => import('@web/dev-server-core').Plugin} */
export default (include, exclude, resolverPort, options = {}) => {
  const pluginOptions = normalizePluginOptions(options);
  const watchEnabled = pluginOptions.watch !== false;
  const iconAssetStore = createIconAssetStore();
  /** @type {import('node:fs').FSWatcher[]} */
  const watchers = [];
  /** @type {Set<string>} */
  const watchedDirs = new Set();
  return {
    name: 'custom-rocket-plugin',
    injectWebSocket: true,
    async serverStart({ fileWatcher, webSockets }) {
      modules.clear();
      const onFileChange = debounce(async () => {
        resolverPort.postMessage('reload');
        pageRegistry = await getPages(process.cwd(), include, exclude);
        validateDevelopmentPublicAssets(pluginOptions);
        webSockets?.sendImport('data:text/javascript,window.location.reload()');
      }, 100);
      /**
       * @param {string} file
       */
      const watchFileDirectory = file => {
        const dir = path.join(file, '../');
        if (watchedDirs.has(dir)) {
          return;
        }
        watchedDirs.add(dir);
        watchers.push(fs.watch(dir, onFileChange));
      };
      // listen to module resolution
      resolverPort.on('message', (/** @type {{parent: string; url: string}} */ message) => {
        const existing = modules.get(message.url);
        if (existing) {
          existing.add(message.parent);
        } else {
          modules.set(message.url, new Set([message.parent]));
        }
        if (watchEnabled) {
          watchFileDirectory(message.url);
        }
        resolverPort.postMessage('ok');
      });
      pageRegistry = await getPages(process.cwd(), include, exclude);
      validateDevelopmentPublicAssets(pluginOptions);
      if (watchEnabled) {
        pageRegistry.forEach(page => {
          watchFileDirectory(page.file);
        });
        modules.forEach((_, url) => {
          watchFileDirectory(url);
        });
      }
      const publicDir = path.join(process.cwd(), PUBLIC_ASSETS_DIR);
      if (watchEnabled && fs.existsSync(publicDir)) {
        fileWatcher?.add(publicDir);
      }
    },
    serverStop() {
      for (const watcher of watchers) {
        watcher.close();
      }
      watchers.length = 0;
      watchedDirs.clear();
      modules.clear();
    },
    /**
     * @param {import('@web/dev-server-core').Context} context
     */
    async serve(context) {
      if (context.path.startsWith('/__wds-outside-root__')) {
        return;
      }
      const socialPreviewTemplatePreview = await serveSocialPreviewTemplatePreview(
        webRequestFromContext(context),
        {
          pages: pageRegistry,
          siteHeadMetadata: pluginOptions.siteHeadMetadata,
          siteOrigin: pluginOptions.siteOrigin,
          captureSocialPreviewImage: pluginOptions.captureSocialPreviewImage,
        },
      );
      if (socialPreviewTemplatePreview) {
        context.status = socialPreviewTemplatePreview.status;
        return responseToServe(socialPreviewTemplatePreview, 'text/html');
      }
      const rocketIconRuntime = findRocketIconRuntimeOutput(context.path);
      if (rocketIconRuntime) {
        return {
          body: rocketIconRuntime.data,
          type: rocketIconRuntime.type,
        };
      }
      const iconAsset = iconAssetStore.get(context.path);
      if (iconAsset) {
        return {
          body: iconAsset.svg,
          type: 'image/svg+xml',
        };
      }
      const publicAssets = validateDevelopmentPublicAssets(pluginOptions);
      const publicAsset = findPublicAsset(publicAssets, context.path);
      if (publicAsset) {
        return /** @type {any} */ ({
          body: readPublicAsset(publicAsset),
        });
      }

      // check if the request is for a page
      let isPage = true;
      if (context.header['sec-fetch-dest']) {
        if (context.header['sec-fetch-dest'] === 'style') {
          return;
        }
        if (
          context.header['sec-fetch-dest'] !== 'document' &&
          context.header['sec-fetch-dest'] !== 'iframe'
        ) {
          isPage = false;
        }
      } else if (context.header.accept === '*/*') {
        isPage = false;
      }
      if (!isPage) {
        const pathname = new URLPattern().exec(context.header.referer)?.pathname.input;
        if (!pathname) {
          return;
        }
        const page = pageRegistry.get(pathname);
        if (!page) {
          return;
        }
        const file = path.join(page.file, '..', context.path);
        if (!fs.existsSync(file)) {
          return;
        }
        return fs.readFileSync(file).toString();
      }
      try {
        return await renderPageRuntime(context, pluginOptions, iconAssetStore);
      } catch (error) {
        if (!(error instanceof PageRuntimeError)) {
          throw error;
        }
        console.error('Failed to render page: ' + context.path, error);
        context.status = 500;
        return;
      }
    },
  };
};

/**
 * @param {RocketDevServerPluginOptions} pluginOptions
 * @returns {import('./publicAssets.js').PublicAsset[]}
 */
function validateDevelopmentPublicAssets(pluginOptions) {
  const publicAssets = discoverPublicAssets(process.cwd());
  validatePublicAssetCollisions({
    publicAssets,
    pages: pageRegistry,
    generatedPages: pageRegistry,
    config: /** @type {import('@rocket/js/types.js').ResolvedRocketConfig} */ ({
      urlLifecycle: pluginOptions.urlLifecycle,
      siteDiscoverability: pluginOptions.siteDiscoverability,
    }),
    emitRedirectFallbacks: false,
  });
  return publicAssets;
}

/**
 * @param {RocketDevServerPluginInput} options
 * @returns {RocketDevServerPluginOptions}
 */
function normalizePluginOptions(options) {
  if ('redirects' in options) {
    return { urlLifecycle: options };
  }
  return /** @type {RocketDevServerPluginOptions} */ (options);
}

/**
 * @param {import('@web/dev-server-core').Context} context
 * @param {RocketDevServerPluginOptions} options
 * @param {import('./icons.js').IconAssetStore} iconAssetStore
 */
async function renderPageRuntime(
  context,
  { urlLifecycle, siteHeadMetadata, siteOrigin, iconLibraries, defaultIconLibrary },
  iconAssetStore,
) {
  const pageRuntime = new PageRuntime({
    pages: pageRegistry,
    pageModuleLoader: createDevelopmentPageModuleLoader(),
    urlLifecycle,
    siteHeadMetadata,
    siteOrigin,
    iconLibraries,
    defaultIconLibrary,
    iconAssetStore,
  });
  const response = await pageRuntime.render(webRequestFromContext(context), {
    adapterContext: context,
  });
  context.status = response.status;
  return responseToServe(response, 'text/html');
}

/**
 * @param {string} requestPath
 */
function findRocketIconRuntimeOutput(requestPath) {
  return rocketIconRuntimeOutputs().find(output => output.path === requestPath);
}

/**
 *
 * @param {Response} res
 * @param {string} [fallbackType]
 * @returns {Promise<{ body: string | Buffer; type?: string; headers?: Record<string, string> }>}
 */
async function responseToServe(res, fallbackType) {
  /** @type {Record<string, string>} */
  const headers = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const type = res.headers.get('content-type') || fallbackType;
  if (type) {
    if (!isTextResponseType(type)) {
      return { body: Buffer.from(await res.arrayBuffer()), type, headers };
    }
    return { body: await res.text(), type, headers };
  }
  return { body: await res.text(), headers };
}

/**
 * @param {string} type
 */
function isTextResponseType(type) {
  return (
    type.startsWith('text/') ||
    type.startsWith('application/json') ||
    type.startsWith('application/javascript')
  );
}

/**
 * @param {import('@web/dev-server-core').Context} context
 * @returns {Request}
 */
function webRequestFromContext(context) {
  return new Request(new URL(context.url, context.origin), {
    method: context.method,
    headers: webHeadersFromContext(context),
  });
}

/**
 * @param {import('@web/dev-server-core').Context} context
 * @returns {Headers}
 */
function webHeadersFromContext(context) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(context.header)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(name, entry);
      }
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}
