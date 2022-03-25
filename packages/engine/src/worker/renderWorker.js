// we load this before the global-dom-shim as otherwise prism thinks it's running in a browser 🙈
// we need to load the global-dom-shim as otherwise import { html } from 'lit'; breaks
import 'rehype-prism';
import '@lit-labs/ssr/lib/install-global-dom-shim.js';

import path from 'path';
import { parentPort } from 'worker_threads';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  sourceRelativeFilePathToOutputRelativeFilePath,
  sourceRelativeFilePathToUrl,
} from '../file-header/urlPathConverter.js';
import { convertMdFile, convertHtmlFile } from '../converts.js';
import { transformFile } from '../helpers/transformFile.js';

import { litServerRender } from '../helpers/litServerRender.js';
import { generateErrorPage } from './generateErrorPage.js';

/**
 *
 * @param {object} options
 * @param {string} options.sourceFilePath
 * @param {string} options.outputDir
 * @param {string} options.inputDir
 * @param {'development'|'production'} options.renderMode
 */
async function renderFile({ sourceFilePath, outputDir, inputDir, renderMode = 'development' }) {
  let fileContent = '';
  /** @type {Error | undefined} */
  let passOnError;

  const sourceRelativeFilePath = path.relative(inputDir, sourceFilePath);
  const outputRelativeFilePath =
    sourceRelativeFilePathToOutputRelativeFilePath(sourceRelativeFilePath);
  const outputFilePath = path.join(outputDir, outputRelativeFilePath);

  let keepConvertedFiles = false;
  try {
    let toImportFilePath = sourceFilePath;
    if (sourceFilePath.endsWith('.rocket.md')) {
      toImportFilePath = await convertMdFile(sourceFilePath);
    }
    if (sourceFilePath.endsWith('.rocket.html')) {
      toImportFilePath = await convertHtmlFile(sourceFilePath);
    }

    const { default: content, ...data } = await import(toImportFilePath);
    const { layout, openGraphLayout } = data;
    keepConvertedFiles = data.keepConvertedFiles;

    const url = sourceRelativeFilePathToUrl(sourceRelativeFilePath);
    let openGraphData = {};
    if (openGraphLayout && outputFilePath.endsWith('.html')) {
      openGraphData = {
        openGraphOutputFilePath: outputFilePath.replace(/\.html$/, '.opengraph.html'),
        openGraphOutputRelativeFilePath: outputRelativeFilePath.replace(
          /\.html$/,
          '.opengraph.html',
        ),
        openGraphUrl: url.replace(/\.html$/, '.opengraph.html'),
      };
    }
    const layoutData = {
      sourceFilePath,
      outputFilePath,
      sourceRelativeFilePath,
      outputRelativeFilePath,
      url,
      renderMode,
      content,
      ...openGraphData,
      ...data,
    };
    fileContent = content;

    if (typeof content === 'function') {
      let templateResult;
      if (layout) {
        templateResult =
          typeof layout.render === 'function' ? layout.render(layoutData) : layout(layoutData);
      } else {
        templateResult = content();
      }

      if (typeof templateResult === 'string') {
        fileContent = templateResult;
      } else {
        // Load components server side
        if (data.components) {
          for (const tagName of Object.keys(data.components)) {
            const componentFn = data.components[tagName];
            if (typeof componentFn === 'function') {
              const componentClass = await componentFn();
              customElements.define(tagName, componentClass);
            }
          }
        }

        fileContent = await litServerRender(templateResult);
      }

      fileContent = await transformFile(fileContent, {
        setupPlugins: data.setupEnginePlugins,
        sourceFilePath,
        outputFilePath,
        sourceRelativeFilePath,
        outputRelativeFilePath,
        url,
      });

      fileContent = fileContent.trim();
      // remove leading/ending lit markers as with them web dev server falsy thinks this page is a HTML fragment and will not inject websockets
      fileContent = fileContent.replace(/^<!--lit-part.*?-->/gm, '');
      fileContent = fileContent.replace(/<!--\/lit-part-->$/gm, '');
    } else {
      const error = new Error(
        `The file ${sourceRelativeFilePath} should return a function but returned a ${typeof content}`,
      );
      fileContent = generateErrorPage(error);
      passOnError = error;
    }

    if (!existsSync(path.dirname(outputFilePath))) {
      await mkdir(path.dirname(outputFilePath), { recursive: true });
    }
    // console.log(`Writing: ${outputRelativeFilePath}`);
    await writeFile(outputFilePath, fileContent);

    if (openGraphLayout && outputFilePath.endsWith('.html')) {
      const openGraphTemplateResult =
        typeof openGraphLayout.render === 'function'
          ? openGraphLayout.render(layoutData)
          : openGraphLayout(layoutData);
      const openGraphHtml = await litServerRender(openGraphTemplateResult);

      let processedOpenGraphHtml = await transformFile(openGraphHtml, {
        setupPlugins: data.setupEnginePlugins,
        sourceFilePath,
        outputFilePath: layoutData.openGraphOutputFilePath,
        sourceRelativeFilePath,
        outputRelativeFilePath: layoutData.openGraphOutputRelativeFilePath,
        url: layoutData.openGraphUrl,
      });

      processedOpenGraphHtml = processedOpenGraphHtml.trim();
      // remove leading/ending lit markers as with them web dev server falsy thinks this page is a HTML fragment and will not inject websockets
      processedOpenGraphHtml = processedOpenGraphHtml.replace(/^<!--lit-part.*?-->/gm, '');
      processedOpenGraphHtml = processedOpenGraphHtml.replace(/<!--\/lit-part-->$/gm, '');

      await writeFile(layoutData.openGraphOutputFilePath, processedOpenGraphHtml);
    }
  } catch (error) {
    const typed = /** @type {Error} */ (error);
    fileContent = generateErrorPage(typed);
    passOnError = typed;

    if (!existsSync(path.dirname(outputFilePath))) {
      await mkdir(path.dirname(outputFilePath), { recursive: true });
    }
    // console.log(`Writing: ${outputRelativeFilePath}`);
    await writeFile(outputFilePath, fileContent);
  }

  /** @type {import('../../types/main.js').renderWorkerResult} */
  const result = {
    status: 200,
    outputFilePath,
    fileContent,
    sourceFilePath,
    sourceRelativeFilePath,
    passOnError,
    keepConvertedFiles,
  };

  parentPort?.postMessage(result);
}

parentPort?.on('message', message => {
  if (message.action === 'renderFile') {
    const { sourceFilePath, outputDir, renderMode, inputDir } = message;
    renderFile({ sourceFilePath, outputDir, renderMode, inputDir });
  }
});
