import path from 'path';
import { sourceRelativeFilePathToUrl } from '../file-header/urlPathConverter.js';
import { AdjustAssetUrls } from '../index.js';

/**
 * @param {object} options
 * @param {string} options.inputDir
 * @param {string} options.outputDir
 * @param {(sourceFilePath: string) => string} options.getSourceFilePathFromUrl
 * @param {(sourceFilePath: string) => string} options.getOutputFilePath
 * @returns {import('../../types/main.js').DevServerPlugin}
 */
export function devServerAdjustAssetUrls({
  outputDir,
  getSourceFilePathFromUrl,
  getOutputFilePath,
  inputDir,
}) {
  const adjustAssetUrl = new AdjustAssetUrls({
    adjustAssetUrl: async ({
      url,
      /* sourceFilePath, sourceRelativeFilePath, */ outputFilePath,
    }) => {
      if (url.startsWith('./') || url.startsWith('../')) {
        const assetFilePath = path.join(path.dirname(outputFilePath), url);
        let relPath = path.relative(outputDir, assetFilePath);
        let count = 0;
        while (relPath.startsWith('../')) {
          relPath = relPath.substring(3);
          count += 1;
        }
        return `/__wds-outside-root__/${count}/${relPath}`;
      }
      return url;
    },
  });

  return {
    name: 'dev-server-adjust-asset-urls',
    /**
     * @param {import('koa').Context} context
     */
    transform: async context => {
      const sourceFilePath = await getSourceFilePathFromUrl(context.path);
      if (sourceFilePath) {
        const outputFilePath = getOutputFilePath(sourceFilePath);
        const sourceRelativeFilePath = path.relative(inputDir, sourceFilePath);
        const outputRelativeFilePath = path.relative(outputDir, outputFilePath);
        const body = /** @type {string} */ (context.body);
        const newBody = await adjustAssetUrl.transform(body, {
          sourceFilePath,
          sourceRelativeFilePath,
          outputFilePath,
          outputRelativeFilePath,
          url: sourceRelativeFilePathToUrl(sourceRelativeFilePath),
        });
        return newBody;
      }
    },
  };
}
