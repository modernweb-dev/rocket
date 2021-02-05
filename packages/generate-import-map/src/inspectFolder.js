/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import saxWasm from 'sax-wasm';
import { createRequire } from 'module';
import { init, parse } from 'es-module-lexer';

import { listFiles } from './listFiles.js';
import path from 'path';

/** @typedef {import('../types/main').Script} Script */
/** @typedef {import('../types/main').Import} Import */
/** @typedef {import('sax-wasm').Attribute} Attribute */
/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('sax-wasm').Text} Text */
/** @typedef {import('es-module-lexer').ImportSpecifier} ImportSpecifier */

const require = createRequire(import.meta.url);
const { SaxEventType, SAXParser } = saxWasm;

const streamOptions = { highWaterMark: 256 * 1024 };

const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = fs.readFileSync(saxPath);
const parserSpecifiers = new SAXParser(
  SaxEventType.OpenTag | SaxEventType.CloseTag | SaxEventType.Attribute | SaxEventType.Text,
  streamOptions,
);

let localSpecifiers = new Set();
let bareSpecifiers = new Set();

/**
 * @param {string} filePath
 * @param {object} option
 * @param {string} option.rootDir
 */
function analyzeFile(filePath, { rootDir }) {
  if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
    const source = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const importDir = path.dirname(filePath);
    console.log('Resolving specifier %s', filePath);
    getSpecifiers(source).forEach(specifier => {
      addSpecifier(specifier, { importDir, rootDir });
    });
  }
}

/**
 * @param {string} source
 */
function getSpecifiers(source) {
  /** @type {[ImportSpecifier[], string[]]} */
  const [imports] = parse(source, 'optional-sourcename');
  return imports.map(specifier => source.substring(specifier.s, specifier.e).replace(/'/g, ''));
}

/**
 *
 * @param {string} specifier
 * @param {object} options
 * @param {string} options.importDir
 * @param {string} options.rootDir
 */
function addSpecifier(specifier, { importDir, rootDir }) {
  let newSpecifier = specifier.trim();
  if (newSpecifier.endsWith('/')) {
    newSpecifier += 'index.js';
  }

  if (newSpecifier.startsWith('/')) {
    // Absolute path specifier
    newSpecifier = path.join(rootDir, newSpecifier);
  } else if (newSpecifier.startsWith('../') || newSpecifier.startsWith('./')) {
    // Relative path specifier
    newSpecifier = path.join(importDir, newSpecifier);
  }

  if (newSpecifier.startsWith('/')) {
    if (!localSpecifiers.has(newSpecifier)) {
      localSpecifiers.add(newSpecifier);
      analyzeFile(newSpecifier, { rootDir });
    }
  } else {
    const [namespace, name] = newSpecifier.split('/');
    if (namespace.startsWith('@')) {
      newSpecifier = `${namespace}/${name}`;
    } else {
      newSpecifier = namespace;
    }
    bareSpecifiers.add(newSpecifier);
  }
}
/**
 *
 * @param {Script[]} scripts
 * @param {object} options
 * @param {string} options.importDir
 * @param {string} options.rootDir
 */
async function resolveSpecifiers(scripts, { importDir, rootDir }) {
  for (const scriptObj of scripts) {
    if (scriptObj.specifier) {
      addSpecifier(scriptObj.specifier, { importDir, rootDir });
    } else {
      getSpecifiers(scriptObj.content).forEach(specifier => {
        addSpecifier(specifier, { importDir, rootDir });
      });
    }
  }
}

/**
 * @param {string} filePath
 */
function extractScripts(filePath) {
  /** @type {Script[]} */
  const scripts = [];

  let captureContent = false;

  parserSpecifiers.eventHandler = (ev, /** @type {any} */ _data) => {
    const data = /** @type {Tag | Text} */ _data;
    if (captureContent && ev === SaxEventType.Text) {
      const scriptObj = scripts[scripts.length - 1];
      scriptObj.content += data.value;
    } else if (ev === SaxEventType.CloseTag && data.name.toString() === 'script') {
      captureContent = false;
    } else if (ev === SaxEventType.OpenTag) {
      const tagName = data.name.toString();
      const type = data.attributes.find(
        (/** @type Attribute */ attr) => attr.name.toString() === 'type',
      );
      if (tagName === 'script' && type?.value.toString() === 'module') {
        const scriptObj = /** @type {Script} */ {
          filePath,
          content: '',
          specifier: '',
        };
        const src = data.attributes.find(
          (/** @type Attribute */ attr) => attr.name.toString() === 'src',
        );
        if (src) {
          let srcPath = src.value.toString().trim();
          if (!srcPath.startsWith('.') || !srcPath.startsWith('/')) {
            srcPath = `./${srcPath}`;
          }
          scriptObj.specifier = srcPath;
        } else {
          captureContent = true;
        }
        scripts.push(scriptObj);
      }
    }
  };

  return new Promise(resolve => {
    const readable = fs.createReadStream(filePath, streamOptions);
    readable.on('data', chunk => {
      // @ts-expect-error
      parserSpecifiers.write(chunk);
    });
    readable.on('end', () => {
      parserSpecifiers.end();
      resolve(scripts);
    });
  });
}

/**
 * @param {string[]} files
 * @param {string} rootDir
 */
export async function extractBareImports(files, rootDir) {
  await parserSpecifiers.prepareWasm(saxWasmBuffer);
  await init;

  localSpecifiers = new Set();
  bareSpecifiers = new Set();
  for (const filePath of files) {
    const importDir = path.dirname(filePath);
    const scripts = await extractScripts(filePath);
    await resolveSpecifiers(scripts, { importDir, rootDir });
  }
  return {
    localSpecifiers: Array.from(localSpecifiers),
    bareSpecifiers: Array.from(bareSpecifiers),
  };
}

/**
 * @param {string} inRootDir
 */
export async function inspectFolder(inRootDir, extension = 'html') {
  const rootDir = path.resolve(inRootDir);
  const files = await listFiles(`**/*.${extension}`, rootDir);
  return await extractBareImports(files, rootDir);
}
