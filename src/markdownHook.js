/** Runs on: import-hook */
import path, { relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeAsyncPort } from './asyncMessage.js';
import { compileMarkdownLoad, compileMarkdownSetup } from './markdownCompiler.js';
import { randomBytes } from 'node:crypto';

/** @type {import("./asyncMessage.js").AsyncPort} */
// @ts-ignore
let sendPort = null;

let lastReload = new Date().getTime();

/** @type {(data: {port: import('./asyncMessage.js').AsyncPort}) => Promise<void>} */
export async function initialize({ port }) {
  sendPort = makeAsyncPort(port);
  sendPort.on('message', message => {
    if (message === 'reload') {
      lastReload = new Date().getTime();
    }
  });
}

/** @type {import("module").LoadHook} */
export async function load(url, context, nextLoad) {
  const attrs = structuredClone(context.importAttributes);
  // Server-Side Rendering
  if (context.importAttributes?.type?.startsWith('rocketSetupMd')) {
    const module = await nextLoad(url, {
      ...context,
      format: 'module',
      importAttributes: {},
    });
    const finalSource = await compileMarkdownSetup(module.source?.toString() || '');
    if (finalSource === null) {
      throw new Error(
        'No server code found in markdown file: ' + relative(process.cwd(), fileURLToPath(url)),
      );
    }
    return {
      format: 'module',
      shortCircuit: true,
      source: finalSource,
    };
  } else if (context.importAttributes?.type?.startsWith('rocketLoadMd')) {
    // Client Side Rendering
    const module = await nextLoad(url, {
      ...context,
      format: 'module',
      importAttributes: {},
    });
    if (module.source === undefined) {
      return module;
    }
    const code = await compileMarkdownLoad(module.source.toString(), {
      singleDemo: attrs.singleDemo,
    });
    return { format: 'module', shortCircuit: true, source: code };
  } else if (url.endsWith('.md')) {
    throw new Error(
      "Markdown files must be imported with type: 'rocketSetupMd'not " +
        context.importAttributes.type +
        ', import to ' +
        url,
    );
    // Javascript or other files that ignore the cache
  } else if (context.importAttributes.type?.match(/^(rocket(Setup|Load)Js)|^cache/)) {
    return await nextLoad(url, {
      ...context,
      format: 'module',
      importAttributes: {},
    });
  }
  return nextLoad(url);
}

/** @type {import("module").ResolveHook} */
export async function resolve(specifier, context, nextResolve) {
  const regex = /^rocket(Setup|Load)(Md|Js)/;
  const match = context.importAttributes?.type?.match(regex) ?? null;
  if (match !== null) {
    const parentURL = /** @type {string} */ (context.parentURL);
    // if importing from page scan, import from root
    const filePath = context.importAttributes.type?.endsWith('Initial')
      ? specifier
      : path.join(path.dirname(fileURLToPath(parentURL)), specifier);
    const url = pathToFileURL(filePath).href;
    /** @type {import("module").ResolveFnOutput} */
    const resolve = {
      format: 'module',
      shortCircuit: true,
      url,
      importAttributes: {
        ...context.importAttributes,
        type:
          'rocket' +
          match[1] +
          match[2] +
          (context.importAttributes.type?.includes('Load')
            ? randomBytes(8).toString('base64')
            : lastReload.toString(36)),
      },
    };
    if (match[0] === 'Setup' && isLocalFile(url)) {
      await sendPort.sendAndWait({
        parent: getPath(/** @type {string} */ (context.parentURL)),
        url: getPath(resolve.url),
      });
    }
    return resolve;
  } else {
    // Non-Rocket files
    const resolve = await nextResolve(specifier, context);
    if (isLocalFile(resolve.url)) {
      resolve.importAttributes = {
        ...resolve.importAttributes,
        type: 'cache' + lastReload.toString(36),
      };
      await sendPort.sendAndWait({
        parent: getPath(/** @type {string} */ (context.parentURL)),
        url: getPath(resolve.url),
      });
    }
    return resolve;
  }
}

/**
 * not node_modules
 * @param {string} url
 * @returns {boolean}
 */
function isLocalFile(url) {
  if (!url.startsWith('file:///')) {
    return false;
  }
  const localPath = relative(process.cwd(), fileURLToPath(url));
  return !localPath.includes('node_modules');
}

/**
 * absolute url to relative path
 * @param {string} url
 * @returns {string}
 */
function getPath(url) {
  return relative(process.cwd(), fileURLToPath(url));
}
