import path from 'path';
import { parentPort } from 'worker_threads';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  sourceRelativeFilePathToOutputRelativeFilePath,
  sourceRelativeFilePathToUrl,
} from '../urlPathConverter.js';
import { convertMdFile, convertHtmlFile } from '../converts.js';
import { transformFile } from '../helpers/transformFile.js';

import { litServerRender } from '../helpers/litServerRender.js';
import { generateErrorPage } from './generateErrorPage.js';

/**
 *
 * @param {object} options
 * @param {string} options.filePath
 * @param {string} options.outputDir
 * @param {string} options.inputDir
 * @param {'development'|'production'} options.renderMode
 */
async function renderFile({ filePath, outputDir, inputDir, renderMode = 'development' }) {
  let fileContent = '';
  /** @type {Error | undefined} */
  let passOnError;

  const sourceRelativeFilePath = path.relative(inputDir, filePath);
  const outputRelativeFilePath = sourceRelativeFilePathToOutputRelativeFilePath(
    sourceRelativeFilePath,
  );
  const outputFilePath = path.join(outputDir, outputRelativeFilePath);

  try {
    let toImportFilePath = filePath;
    if (filePath.endsWith('.rocket.md')) {
      toImportFilePath = await convertMdFile(filePath);
    }
    if (filePath.endsWith('.rocket.html')) {
      toImportFilePath = await convertHtmlFile(filePath);
    }

    const { default: content, ...data } = await import(toImportFilePath);
    const { layout, openGraphLayout } = data;

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
      sourceFilePath: filePath,
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
        fileContent = await litServerRender(templateResult);
      }

      fileContent = await transformFile(fileContent, {
        setupPlugins: data.setupEnginePlugins,
        sourceFilePath: filePath,
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

  parentPort?.postMessage({
    status: 200,
    outputFilePath,
    fileContent,
    filePath,
    sourceRelativeFilePath,
    passOnError,
  });
}

parentPort?.on('message', message => {
  if (message.action === 'renderFile') {
    const { filePath, outputDir, renderMode, inputDir } = message;
    renderFile({ filePath, outputDir, renderMode, inputDir });
  }
});
