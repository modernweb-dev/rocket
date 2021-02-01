/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import saxWasm from 'sax-wasm';
import minimatch from 'minimatch';
import { createRequire } from 'module';

import { listFiles } from './listFiles.js';
import path from 'path';

/** @typedef {import('../types/main').Link} Link */
/** @typedef {import('../types/main').LocalFile} LocalFile */
/** @typedef {import('../types/main').Usage} Usage */
/** @typedef {import('../types/main').Error} Error */
/** @typedef {import('../types/main').Options} Options */
/** @typedef {import('sax-wasm').Attribute} Attribute */

const require = createRequire(import.meta.url);
const { SaxEventType, SAXParser } = saxWasm;

const streamOptions = { highWaterMark: 256 * 1024 };

const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = fs.readFileSync(saxPath);
const parserReferences = new SAXParser(SaxEventType.Attribute, streamOptions);
const parserIds = new SAXParser(SaxEventType.Attribute, streamOptions);

/** @type {Error[]} */
let checkLocalFiles = [];

/** @type {Error[]} */
let errors = [];

/** @type {Map<string, string[]>} */
let idCache = new Map();

/**
 * @param {string} htmlFilePath
 */
function extractReferences(htmlFilePath) {
  /** @type {Link[]} */
  const links = [];
  /** @type {string[]} */
  const ids = [];
  parserReferences.eventHandler = (ev, _data) => {
    if (ev === SaxEventType.Attribute) {
      const data = /** @type {Attribute} */ (/** @type {any} */ (_data));
      const attributeName = data.name.toString();
      const value = data.value.toString();
      const entry = {
        attribute: attributeName,
        value,
        htmlFilePath,
        ...data.value.start,
      };
      if (attributeName === 'href' || attributeName === 'src') {
        links.push(entry);
      }
      if (attributeName === 'srcset') {
        if (value.includes(',')) {
          const srcsets = value.split(',').map(el => el.trim());
          for (const srcset of srcsets) {
            if (srcset.includes(' ')) {
              const srcsetParts = srcset.split(' ');
              links.push({ ...entry, value: srcsetParts[0] });
            } else {
              links.push({ ...entry, value: srcset });
            }
          }
        } else if (value.includes(' ')) {
          const srcsetParts = value.split(' ');
          links.push({ ...entry, value: srcsetParts[0] });
        } else {
          links.push(entry);
        }
      }
      if (attributeName === 'id') {
        ids.push(value);
      }
    }
  };

  return new Promise(resolve => {
    const readable = fs.createReadStream(htmlFilePath, streamOptions);
    readable.on('data', chunk => {
      // @ts-expect-error
      parserReferences.write(chunk);
    });
    readable.on('end', () => {
      parserReferences.end();
      idCache.set(htmlFilePath, ids);
      resolve({ links });
    });
  });
}

/**
 * @param {string} filePath
 * @param {string} id
 */
function idExists(filePath, id) {
  if (idCache.has(filePath)) {
    const cachedIds = idCache.get(filePath);
    // return cachedIds.includes(id);
    return new Promise(resolve => resolve(cachedIds?.includes(id)));
  }

  /** @type {string[]} */
  const ids = [];
  parserIds.eventHandler = (ev, _data) => {
    const data = /** @type {Attribute} */ (/** @type {any} */ (_data));
    if (ev === SaxEventType.Attribute) {
      if (data.name.toString() === 'id') {
        ids.push(data.value.toString());
      }
    }
  };

  return new Promise(resolve => {
    const readable = fs.createReadStream(filePath, streamOptions);
    readable.on('data', chunk => {
      // @ts-expect-error
      parserIds.write(chunk);
    });
    readable.on('end', () => {
      parserIds.end();
      idCache.set(filePath, ids);
      resolve(ids.includes(id));
    });
  });
}

/**
 * @param {string} filePath
 * @param {string} anchor
 * @param {Usage} usageObj
 */
function addLocalFile(filePath, anchor, usageObj) {
  const foundIndex = checkLocalFiles.findIndex(item => {
    return item.filePath === filePath;
  });

  if (foundIndex === -1) {
    checkLocalFiles.push({
      filePath,
      onlyAnchorMissing: false,
      usage: [usageObj],
    });
  } else {
    checkLocalFiles[foundIndex].usage.push(usageObj);
  }
}

/**
 * @param {string} inValue
 */
function getValueAndAnchor(inValue) {
  let value = inValue.replace(/&#/g, '--__check-html-links__--');
  let anchor = '';

  if (value.includes('#')) {
    [value, anchor] = value.split('#');
  }
  if (value.includes('?')) {
    value = value.split('?')[0];
  }
  if (anchor.includes(':~:')) {
    anchor = anchor.split(':~:')[0];
  }
  if (value.includes(':~:')) {
    value = value.split(':~:')[0];
  }

  value = value.replace(/--__check-html-links__--/g, '&#');
  anchor = anchor.replace(/--__check-html-links__--/g, '&#');
  value = value.trim();
  anchor = anchor.trim();

  return {
    value,
    anchor,
  };
}

/**
 *
 * @param {Link[]} links
 * @param {object} options
 * @param {string} options.htmlFilePath
 * @param {string} options.rootDir
 * @param {function(Usage): boolean} options.ignoreUsage
 */
async function resolveLinks(links, { htmlFilePath, rootDir, ignoreUsage }) {
  for (const hrefObj of links) {
    const { value, anchor } = getValueAndAnchor(hrefObj.value);

    const usageObj = {
      attribute: hrefObj.attribute,
      value: hrefObj.value,
      file: htmlFilePath,
      line: hrefObj.line,
      character: hrefObj.character,
      anchor,
    };

    let valueFile = value.endsWith('/') ? path.join(value, 'index.html') : value;

    if (ignoreUsage(usageObj)) {
      // ignore
    } else if (value.includes('mailto:')) {
      // ignore for now - could add a check to validate if the email address is valid
    } else if (valueFile === '' && anchor !== '') {
      addLocalFile(htmlFilePath, anchor, usageObj);
    } else if (value.startsWith('//') || value.startsWith('http')) {
      // TODO: handle external urls
      // external url - we do not handle that (yet)
    } else if (value.startsWith('/')) {
      const filePath = path.join(rootDir, valueFile);
      addLocalFile(filePath, anchor, usageObj);
    } else if (value === '' && anchor === '') {
      // no need to check it
    } else {
      const filePath = path.join(path.dirname(htmlFilePath), valueFile);
      addLocalFile(filePath, anchor, usageObj);
    }
  }

  return { checkLocalFiles: [...checkLocalFiles] };
}

/**
 *
 * @param {Error[]} checkLocalFiles
 */
async function validateLocalFiles(checkLocalFiles) {
  for (const localFileObj of checkLocalFiles) {
    if (
      !fs.existsSync(localFileObj.filePath) ||
      fs.lstatSync(localFileObj.filePath).isDirectory()
    ) {
      errors.push(localFileObj);
    } else {
      for (let i = 0; i < localFileObj.usage.length; i += 1) {
        const usage = localFileObj.usage[i];
        if (usage.anchor === '') {
          localFileObj.usage.splice(i, 1);
          i -= 1;
        } else {
          const isValidAnchor = await idExists(localFileObj.filePath, usage.anchor);
          if (isValidAnchor) {
            localFileObj.usage.splice(i, 1);
            i -= 1;
          }
        }
      }
      if (localFileObj.usage.length > 0) {
        if (localFileObj.usage.length === 1 && localFileObj.usage[0].anchor) {
          localFileObj.onlyAnchorMissing = true;
        }
        errors.push(localFileObj);
      }
    }
  }
  return errors;
}

/**
 * @param {string[]} files
 * @param {string} rootDir
 * @param {Options} opts?
 */
export async function validateFiles(files, rootDir, opts) {
  await parserReferences.prepareWasm(saxWasmBuffer);
  await parserIds.prepareWasm(saxWasmBuffer);

  errors = [];
  checkLocalFiles = [];
  idCache = new Map();
  let numberLinks = 0;

  const ignoreLinkPatternRegExps = opts
    ? opts.ignoreLinkPatterns?.map(pattern => minimatch.makeRe(pattern))
    : null;

  /** @type {function(Usage): boolean} */
  const ignoreUsage = ignoreLinkPatternRegExps
    ? usage => !!ignoreLinkPatternRegExps.find(regExp => usage.value.match(regExp))
    : () => false;

  for (const htmlFilePath of files) {
    const { links } = await extractReferences(htmlFilePath);
    numberLinks += links.length;
    await resolveLinks(links, { htmlFilePath, rootDir, ignoreUsage });
  }
  await validateLocalFiles(checkLocalFiles);

  return { errors: errors, numberLinks: numberLinks };
}

/**
 * @param {string} inRootDir
 * @param {Options} opts?
 */
export async function validateFolder(inRootDir, opts) {
  const rootDir = path.resolve(inRootDir);
  const files = await listFiles('**/*.html', rootDir);
  const { errors } = await validateFiles(files, rootDir, opts);
  return errors;
}
