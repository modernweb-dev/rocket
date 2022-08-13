// we need to load the global-dom-shim as otherwise import { html } from 'lit'; breaks
// https://github.com/lit/lit/issues/2524
import '@lit-labs/ssr/lib/install-global-dom-shim.js';

import { parentPort } from 'worker_threads';
// import { convertMdFile, convertHtmlFile } from '../converts.js';

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isStringNumberBoolean(value) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  return false;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSimpleValue(value) {
  if (isStringNumberBoolean(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isSimpleValue);
  }

  if (typeof value === 'object' && value !== null) {
    const objectType = {}.toString.call(value).slice(8, -1).toLowerCase();
    if (objectType === 'date') {
      return true;
    }
    if (Object.values(value).length > 0) {
      return Object.values(value).every(isSimpleValue);
    }
  }

  return false;
}

/**
 * this imports the actual source file and grabs all exported string and number values
 */
parentPort?.on('message', message => {
  const { sourceFilePath, throwOnError } = message;

  (async () => {
    let importFilePath = sourceFilePath;
    /** @type {Record<string, unknown>} */
    const importData = {};
    try {
      if (sourceFilePath.endsWith('.rocket.md')) {
        importFilePath = sourceFilePath.replace('.rocket.md', '-converted-md.js');
        // toImportFilePath = await convertMdFile(sourceFilePath);
      }
      if (sourceFilePath.endsWith('.rocket.html')) {
        importFilePath = sourceFilePath.replace('.rocket.html', '-converted-html.js');
        // toImportFilePath = await convertHtmlFile(sourceFilePath);
      }
      const data = await import(importFilePath);
      // console.log({ data, importFilePath, foo: new Date('2020-01-01') });
      for (const [key, value] of Object.entries(data)) {
        if (key === 'default') {
          continue;
        }
        if (isSimpleValue(value)) {
          importData[key] = value;
        }
      }
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      // if we can't import we don't add the data to the page
    }

    parentPort?.postMessage({
      status: 200,
      sourceFilePath,
      importData,
    });
  })();
});
