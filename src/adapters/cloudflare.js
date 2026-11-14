/** Runs on: server */
/* eslint-disable no-console */
import { mkdirSync, watch, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { debounce } from '../debounce.js';
import { makeRedirectsFileSource, writeRedirectsFile } from './redirects.js';

/**
 * @typedef {typeof import('wrangler')} Wrangler
 * @typedef {Awaited<ReturnType<Wrangler['unstable_startWorker']>>} Worker
 * @typedef {import('koa').Context} KoaContext
 */

/**
 * Deploys Rocket's static output to Cloudflare Workers Static Assets and runs the site's Worker
 * inside `rocket start`, on the same origin as the Rocket Pages.
 *
 * @param {{ config?: string }} [options]
 * @returns {import('@rocket/js/types.js').RocketAdapter}
 */
export function cloudflare({ config = './wrangler.jsonc' } = {}) {
  return {
    name: 'cloudflare',
    async adjustDevServerConfig(devServerConfig, context) {
      const configPath = path.resolve(context.projectRoot, config);
      const wrangler = await loadWrangler();
      const workerPaths = workerPathPrefixes(
        wrangler.unstable_readConfig({ config: configPath }).assets?.run_worker_first,
        configPath,
      );
      assertNotShadowed(context, workerPaths);
      /** @param {string} requestPath */
      const isWorkerPath = requestPath =>
        workerPaths.some(prefix => requestPath.startsWith(prefix));
      const devWorker = new DevWorker({
        wrangler,
        configPath,
        projectRoot: context.projectRoot,
        watch: devServerConfig.watch !== false,
      });

      return {
        ...devServerConfig,
        middleware: [
          async (ctx, next) => {
            if (!isWorkerPath(ctx.path)) {
              return next();
            }
            const worker = await devWorker.ready();
            if (!worker) {
              respondWithStartupError(ctx, devWorker.startupError);
              return;
            }
            try {
              await forwardToWorker(ctx, worker);
            } catch (error) {
              if (devWorker.startupError) {
                // The Worker broke while this request waited for it.
                respondWithStartupError(ctx, devWorker.startupError);
              } else if (!ctx.res.headersSent) {
                respondWithWorkerError(ctx, error);
              }
            }
          },
          ...(devServerConfig.middleware ?? []),
        ],
        plugins: [
          ...(devServerConfig.plugins ?? []),
          {
            name: 'rocket-cloudflare-worker',
            serverStart() {
              devWorker.ready();
            },
            async serverStop() {
              await devWorker.dispose();
            },
          },
        ],
      };
    },
    async build(context) {
      assertNoServerPages(context);
      const configPath = path.resolve(context.projectRoot, config);
      const wrangler = await loadWrangler();
      const { assets } = wrangler.unstable_readConfig({ config: configPath });
      assertNotShadowed(context, workerPathPrefixes(assets?.run_worker_first, configPath));
      assertCloudflareRedirects(context.config.urlLifecycle?.redirects ?? []);
      const assetsDirectory =
        assets?.directory && path.resolve(path.dirname(configPath), assets.directory);
      if (assetsDirectory !== path.resolve(context.outDir)) {
        throw new Error(
          `assets.directory ${JSON.stringify(assets?.directory)} in ${configPath} does not match ` +
            `Rocket's build output ${context.outDir}. Set "assets": { "directory": ` +
            `${JSON.stringify(`./${path.relative(path.dirname(configPath), context.outDir)}`)} }.`,
        );
      }
      // Rocket skips dotfiles in public/, so the ignore file is written here. It keeps Vite's
      // manifest out of the upload.
      mkdirSync(context.outDir, { recursive: true });
      writeFileSync(path.join(context.outDir, '.assetsignore'), '.vite\n');
      // Wrangler reads `_redirects` itself and leaves it out of the upload.
      writeRedirectsFile(context);
    },
  };
}

/**
 * Server-rendered Pages need a Rocket request handler inside the Worker, which this adapter does
 * not generate yet.
 *
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 */
function assertNoServerPages(context) {
  if (context.serverPages.size) {
    throw new Error(
      `The cloudflare() adapter does not support Pages with render: 'server' yet: ` +
        `${Array.from(context.serverPages.keys()).join(', ')}`,
    );
  }
}

// Wrangler's `_redirects` limits. It skips rules past them with a warning instead of failing.
const MAX_STATIC_REDIRECTS = 2000;
const MAX_REDIRECT_LINE_LENGTH = 2000;

/**
 * Rocket Redirects match their source exactly. Cloudflare reads `*` and `:name` in a source as a
 * splat or placeholder, so such a source would match other paths too.
 *
 * @param {import('@rocket/js/types.js').RedirectConfig[]} redirects
 */
function assertCloudflareRedirects(redirects) {
  if (redirects.length > MAX_STATIC_REDIRECTS) {
    throw new Error(
      `${redirects.length} Redirects are configured, but Cloudflare's _redirects file supports ` +
        `at most ${MAX_STATIC_REDIRECTS}. Handle the rest in the Worker.`,
    );
  }
  for (const redirect of redirects) {
    if (/\*|:[A-Za-z]/.test(redirect.source)) {
      throw new Error(
        `The Redirect source ${JSON.stringify(redirect.source)} contains "*" or ":name", ` +
          `which Cloudflare's _redirects file reads as a pattern rather than an exact path.`,
      );
    }
    const line = makeRedirectsFileSource([redirect]).trimEnd();
    if (line.length > MAX_REDIRECT_LINE_LENGTH) {
      throw new Error(
        `The Redirect from ${JSON.stringify(redirect.source)} is longer than the ` +
          `${MAX_REDIRECT_LINE_LENGTH} characters Cloudflare's _redirects file allows per rule.`,
      );
    }
  }
}

const SUPPORTED_WRANGLER = '^4.162.0';

/**
 * Wrangler is an optional peer dependency, so it is only loaded once a site uses this adapter.
 *
 * @returns {Promise<Wrangler>}
 */
async function loadWrangler() {
  /** @type {Wrangler} */
  let wrangler;
  try {
    wrangler = await import('wrangler');
  } catch (error) {
    if (/** @type {{ code?: string }} */ (error).code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `The cloudflare() adapter needs Wrangler. Install it with: npm install --save-dev wrangler@${SUPPORTED_WRANGLER}`,
        { cause: error },
      );
    }
    throw error;
  }
  const { version } = createRequire(import.meta.url)('wrangler/package.json');
  assertSupportedWrangler(wrangler, version);
  return wrangler;
}

/**
 * `unstable_startWorker` and `unstable_readConfig` are unstable Wrangler APIs, so a Wrangler that
 * renamed them stops startup with a clear message instead of a TypeError later.
 *
 * @param {object} wrangler
 * @param {string} version
 */
export function assertSupportedWrangler(wrangler, version) {
  const required = ['unstable_startWorker', 'unstable_readConfig'];
  const missing = required.filter(
    name => typeof (/** @type {Record<string, unknown>} */ (wrangler)[name]) !== 'function',
  );
  if (missing.length) {
    throw new Error(
      `Wrangler ${version} is not supported by this Rocket version: it has no ${missing.join(' or ')}. ` +
        `Install a Wrangler matching ${SUPPORTED_WRANGLER}.`,
    );
  }
}

/**
 * Keeps the site's Worker running for `rocket start` and tracks whether it currently fails to
 * start. Wrangler recovers from a broken save by itself once the Worker has started, but not from
 * a Worker that never started, so that case is restarted on the next file change.
 */
class DevWorker {
  /** @type {Promise<Worker> | undefined} */
  #starting;
  /** @type {Worker | undefined} */
  #worker;
  /** @type {import('node:fs').FSWatcher | undefined} */
  #retryWatcher;
  #disposed = false;

  /** @type {string | undefined} */
  startupError;

  /**
   * @param {{ wrangler: Wrangler; configPath: string; projectRoot: string; watch: boolean }} options
   */
  constructor(options) {
    this.options = options;
    // Wrangler refuses to start without an assets directory. Rocket serves the frontend in dev, so
    // the Worker gets an empty one instead of the build output (which may not exist yet).
    this.devAssetsDir = path.join(options.projectRoot, '.wrangler', 'rocket-dev-assets');
  }

  /**
   * The running Worker, or `undefined` while it has a startup error.
   *
   * @returns {Promise<Worker | undefined>}
   */
  async ready() {
    if (this.startupError) {
      return undefined;
    }
    this.#starting ??= this.#start();
    try {
      return await this.#starting;
    } catch {
      return undefined;
    }
  }

  async dispose() {
    this.#disposed = true;
    this.#retryWatcher?.close();
    await this.#starting?.catch(() => undefined);
    await this.#teardown();
  }

  async #start() {
    mkdirSync(this.devAssetsDir, { recursive: true });
    let started = false;
    /** @type {Worker} */
    let worker;
    try {
      worker = await this.options.wrangler.unstable_startWorker({
        config: this.options.configPath,
        assets: this.devAssetsDir,
        dev: { watch: this.options.watch, inspector: false, server: { port: 0 } },
      });
    } catch (error) {
      this.#failedFirstStart(error);
      throw error;
    }
    this.#worker = worker;
    worker.raw.on('reloadComplete', () => {
      started = true;
      this.startupError = undefined;
    });
    worker.raw.on('buildFailed', (/** @type {{ cause: unknown }} */ event) => {
      this.startupError = errorMessage(event.cause);
    });
    worker.raw.on('error', (/** @type {unknown} */ event) => {
      if (!isWorkerStartupError(event)) {
        return;
      }
      this.startupError = errorMessage(event instanceof Error ? event : event.cause);
      if (!started) {
        this.#failedFirstStart(event);
      }
    });
    return worker;
  }

  /**
   * @param {unknown} error
   */
  #failedFirstStart(error) {
    this.startupError = errorMessage(error);
    this.#starting = undefined;
    this.#teardown();
    if (!this.options.watch || this.#disposed || this.#retryWatcher) {
      return;
    }
    console.error('[rocket] The Worker failed to start. Rocket starts it again on the next save.');
    // Saves often touch several files at once; restart once they are written.
    const restart = debounce(() => {
      if (this.#disposed) {
        return;
      }
      this.#retryWatcher?.close();
      this.#retryWatcher = undefined;
      this.startupError = undefined;
      this.ready();
    }, 100);
    this.#retryWatcher = watch(this.options.projectRoot, { recursive: true }, (_, filename) => {
      if (filename && !isIgnoredForRetry(filename)) {
        restart();
      }
    });
  }

  async #teardown() {
    const worker = this.#worker;
    this.#worker = undefined;
    // `dispose()` waits for the Worker to become ready, which never happens after a failed start.
    await worker?.raw.teardown().catch(() => undefined);
  }
}

/**
 * @param {unknown} event
 * @returns {event is Error | { cause: unknown }}
 */
function isWorkerStartupError(event) {
  if (event instanceof Error) {
    return true;
  }
  const source = /** @type {{ source?: string }} */ (event)?.source;
  return source === 'LocalRuntimeController' || source === 'ConfigController';
}

/**
 * @param {string} filename
 */
function isIgnoredForRetry(filename) {
  const [first] = filename.split(path.sep);
  return ['node_modules', '.wrangler', '.git', 'dist'].includes(first);
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? `\n${error.cause.message}` : '';
    return `${error.message}${cause}`;
  }
  const cause = /** @type {{ cause?: unknown }} */ (error)?.cause;
  return cause ? errorMessage(cause) : String(error);
}

/**
 * @param {KoaContext} ctx
 * @param {string | undefined} startupError
 */
function respondWithStartupError(ctx, startupError) {
  ctx.respond = true;
  ctx.status = 503;
  ctx.type = 'text/plain; charset=utf-8';
  ctx.body = [
    'Worker failed to start. This is a development-only response from rocket start.',
    '',
    startupError ?? 'Unknown error',
    '',
    'See the terminal running rocket start for details. The Worker starts again when you save a fix.',
    '',
  ].join('\n');
}

/**
 * Wrangler rethrows an exception the Worker did not catch, so it is shown the way `wrangler dev`
 * shows it: in the terminal and in the response.
 *
 * @param {KoaContext} ctx
 * @param {unknown} error
 */
function respondWithWorkerError(ctx, error) {
  console.error('[rocket] The Worker threw while handling', ctx.method, ctx.originalUrl, error);
  ctx.respond = true;
  ctx.status = 500;
  ctx.type = 'text/plain; charset=utf-8';
  ctx.body = error instanceof Error ? (error.stack ?? error.message) : String(error);
}

/**
 * Returns the path prefixes the Worker answers in dev, from Wrangler's `assets.run_worker_first`.
 * Only plain `"/prefix/*"` patterns are supported, so dev routing matches production exactly.
 *
 * @param {string[] | boolean | undefined} runWorkerFirst
 * @param {string} configPath
 * @returns {string[]}
 */
function workerPathPrefixes(runWorkerFirst, configPath) {
  if (runWorkerFirst === undefined || runWorkerFirst === false) {
    return [];
  }
  const patterns = Array.isArray(runWorkerFirst) ? runWorkerFirst : [runWorkerFirst];
  return patterns.map(pattern => {
    if (typeof pattern !== 'string' || !/^\/(?:[^*!]+\/)?\*$/.test(pattern) || pattern === '/*') {
      throw new Error(
        `Unsupported assets.run_worker_first entry ${JSON.stringify(pattern)} in ${configPath}. ` +
          `The cloudflare() adapter's dev server only supports plain "/prefix/*" patterns, ` +
          `such as "/api/*".`,
      );
    }
    return pattern.slice(0, -1);
  });
}

/**
 * The Worker answers `run_worker_first` paths before static assets and `_redirects`, so a Page or
 * Redirect under one would never be reached in production.
 *
 * @param {{ pages: import('@rocket/js/types.js').PageRegistry; config: import('@rocket/js/types.js').ResolvedRocketConfig }} context
 * @param {string[]} workerPaths
 */
function assertNotShadowed({ pages, config }, workerPaths) {
  /** @param {string} urlPath */
  const shadowingPrefix = urlPath => workerPaths.find(workerPath => urlPath.startsWith(workerPath));
  for (const [pagePath, page] of pages) {
    const prefix = shadowingPrefix(pagePath);
    if (prefix) {
      throw new Error(
        `The Page ${pagePath} (${page.file}) is shadowed by "${prefix}*" in assets.run_worker_first: ` +
          `the Worker answers that path, so the Page would never be served. ` +
          `Move the Page or narrow run_worker_first.`,
      );
    }
  }
  for (const redirect of config.urlLifecycle?.redirects ?? []) {
    const prefix = shadowingPrefix(redirect.source);
    if (prefix) {
      throw new Error(
        `The Redirect source ${redirect.source} is shadowed by "${prefix}*" in ` +
          `assets.run_worker_first: the Worker answers that path, so the Redirect would never apply. ` +
          `Handle it in the Worker or narrow run_worker_first.`,
      );
    }
  }
}

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'expect',
  'keep-alive',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

/**
 * Hands one request to the Worker and writes its response back unchanged, so Worker paths share
 * the Rocket dev server's origin and port.
 *
 * @param {KoaContext} ctx
 * @param {Worker} worker
 */
async function forwardToWorker(ctx, worker) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(ctx.req.headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(name)) {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      headers.append(name, item);
    }
  }
  const body = ['GET', 'HEAD'].includes(ctx.method) ? undefined : await readBody(ctx.req);

  const response = await worker.fetch(new URL(ctx.originalUrl, ctx.request.origin).href, {
    method: ctx.method,
    headers,
    body,
    redirect: 'manual',
  });

  ctx.respond = false;
  const res = ctx.res;
  res.statusCode = response.status;
  res.statusMessage = response.statusText;
  for (const [name, value] of response.headers) {
    if (name !== 'set-cookie' && !HOP_BY_HOP_HEADERS.has(name)) {
      res.setHeader(name, value);
    }
  }
  const cookies = response.headers.getSetCookie();
  if (cookies.length) {
    res.setHeader('set-cookie', cookies);
  }
  if (!response.body) {
    res.end();
    return;
  }
  await pipeline(
    Readable.fromWeb(/** @type {import('node:stream/web').ReadableStream} */ (response.body)),
    res,
  );
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<Buffer | undefined>}
 */
async function readBody(req) {
  /** @type {Buffer[]} */
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}
