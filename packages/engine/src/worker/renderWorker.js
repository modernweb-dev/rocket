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
import { validateComponentImportString } from '../file-header/validateComponentImportString.js';

/**
 *
 * @param {object} options
 * @param {string} options.sourceFilePath
 * @param {string} options.outputDir
 * @param {string} options.inputDir
 * @param {Boolean} options.throwOnError
 * @param {'development'|'production'} options.renderMode
 */
async function renderFile({
  sourceFilePath,
  outputDir,
  inputDir,
  renderMode = 'development',
  throwOnError = false,
}) {
  let fileContent = '';
  let openGraphHtml = '';
  /** @type {{ [key: string]: string; }} */
  let componentStrings = {};
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
    if (data.components) {
      for (const [tagName, importString] of Object.entries(data.components)) {
        if (validateComponentImportString(importString)) {
          componentStrings[tagName] = importString;
        } else {
          throw new Error(
            [
              `Bad component import: "${importString}"`,
              `  for: "${tagName}"`,
              `  while rendering: ${sourceFilePath}`,
              '  here are some valid examples of component imports:',
              `  'my-el': '@my-scoped/my-lib/MyEl.js::MyEl'`,
              `  'my-el': 'my-lib/MyEl.js::MyEl`,
              `  'my-el': 'my-lib/components/MyEl::default`,
            ].join('\n'),
          );
        }
      }
    }
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
    /** @type {import('../../types/layout').renderData} */
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
        if (data.registerCustomElements) {
          try {
            await data.registerCustomElements();
          } catch (error) {
            // one of the server side components could not be imported
            // during start (throwError === false): render it without the server components (no error page)
            //   this will trigger an additional rendering pass (with throwError true) where hopefully the rocket header imports will be corrected
            //   if not it throws and the user needs to adjust its "components" { 'tag-name': 'bare-import::ClassName' } to be valid
            if (throwOnError) {
              throw error;
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
        needsLoader: !!data.needsLoader,
      });

      fileContent = fileContent.trim();
      // remove leading/ending lit markers as with them web dev server falsy thinks this page is a HTML fragment and will not inject websockets
      fileContent = fileContent.replace(/^<!--lit-part.*?-->/gm, '');
      if (fileContent.endsWith('<!--/lit-part-->')) {
        fileContent = fileContent.substring(0, fileContent.length - '<!--/lit-part-->'.length);
      }
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
      const rawOpenGraphHtml = await litServerRender(openGraphTemplateResult);

      openGraphHtml = await transformFile(rawOpenGraphHtml, {
        setupPlugins: data.setupEnginePlugins,
        sourceFilePath,
        outputFilePath: layoutData.openGraphOutputFilePath,
        sourceRelativeFilePath,
        outputRelativeFilePath: layoutData.openGraphOutputRelativeFilePath,
        url: layoutData.openGraphUrl,
        needsLoader: false, // open graph is always only server side rendered
      });

      openGraphHtml = openGraphHtml.trim();
      // remove leading/ending lit markers as with them web dev server falsy thinks this page is a HTML fragment and will not inject websockets
      openGraphHtml = openGraphHtml.replace(/^<!--lit-part.*?-->/gm, '');
      if (fileContent.endsWith('<!--/lit-part-->')) {
        fileContent = fileContent.substring(0, fileContent.length - '<!--/lit-part-->'.length);
      }

      await writeFile(layoutData.openGraphOutputFilePath, openGraphHtml);
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
    componentStrings,
    openGraphHtml,
  };

  parentPort?.postMessage(result);
}

parentPort?.on('message', message => {
  if (message.action === 'renderFile') {
    const { sourceFilePath, outputDir, renderMode, inputDir, throwOnError } = message;
    renderFile({ sourceFilePath, outputDir, renderMode, inputDir, throwOnError });
  }
});
