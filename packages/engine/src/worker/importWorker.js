// we load this before the global-dom-shim as otherwise prism thinks it's running in a browser 🙈
// we need to load the global-dom-shim as otherwise import { html } from 'lit'; breaks
import 'rehype-prism';
import '@lit-labs/ssr/lib/install-global-dom-shim.js';

import { parentPort } from 'worker_threads';
// import { convertMdFile, convertHtmlFile } from '../converts.js';

/**
 * this imports the actual source file and grabs all exported string and number values
 */
parentPort?.on('message', message => {
  const { sourceFilePath } = message;

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
        importFilePath = sourceFilePath.replace('.rocket.html', '-from-html.js');
        // toImportFilePath = await convertHtmlFile(sourceFilePath);
      }
      const data = await import(importFilePath);
      for (const [key, value] of Object.entries(data)) {
        if (key === 'default') {
          continue;
        }
        if (typeof value === 'string' || typeof value === 'number') {
          importData[key] = value;
        }
      }
    } catch (error) {
      // if we can't import we don't add the data to the page
    }

    parentPort?.postMessage({
      status: 200,
      sourceFilePath,
      importData,
    });
  })();
});
