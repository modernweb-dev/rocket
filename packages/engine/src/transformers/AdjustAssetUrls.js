import path from 'path';
import { createRequire } from 'module';
import { getAttributeMeta, replaceBetween } from '../web-menu/sax-helpers.js';
import { isRocketPageFile } from '../helpers/isRocketPageFile.js';
import { sourceRelativeFilePathToUrl } from '../file-header/urlPathConverter.js';

/** @typedef {import('sax-wasm').Text} Text */
/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('sax-wasm').Position} Position */

import { parser, SaxEventType } from '../web-menu/sax-parser.js';

/**
 * @param {object} options
 * @param {string} options.url
 * @param {string} options.sourceFilePath
 * @param {string} options.sourceRelativeFilePath
 * @param {string} options.outputFilePath
 * @returns
 */
async function defaultAdjustAssetUrl({
  url: fullUrl,
  sourceFilePath,
  sourceRelativeFilePath,
  outputFilePath,
}) {
  let url = fullUrl;
  let fragment = '';
  if (!url.startsWith('resolve:#') && url.includes('#')) {
    const urlParts = url.split('#');
    url = urlParts[0];
    fragment = `#${urlParts[1]}`;
  }
  if (url.startsWith('resolve:')) {
    const bareImport = url.substring(8);
    const requireOfSource = createRequire(sourceFilePath);
    const resolvedPath = requireOfSource.resolve(bareImport);
    const rel = path.relative(path.dirname(outputFilePath), resolvedPath);
    return rel + fragment;
  }
  if (url.match(/^[a-z]+:/) || url.startsWith('//')) {
    return url + fragment;
  }
  if (isRocketPageFile(url)) {
    const dir = path.dirname(sourceRelativeFilePath);
    return sourceRelativeFilePathToUrl(path.join(dir, url)) + fragment;
  }
  if (url.startsWith('./') || url.startsWith('../')) {
    return (
      path.relative(path.dirname(outputFilePath), path.join(path.dirname(sourceFilePath), url)) +
      fragment
    );
  }
  return url + fragment;
}

export class AdjustAssetUrls {
  constructor({
    assetElements = [
      { tagName: 'img', attribute: 'src' },
      { tagName: 'img', attribute: 'srcset' },
      { tagName: 'source', attribute: 'src' },
      { tagName: 'source', attribute: 'srcset' },
      { tagName: 'a', attribute: 'href' },
      { tagName: 'link', attribute: 'href' },
      { tagName: 'script', attribute: 'src' },
    ],
    adjustAssetUrl = defaultAdjustAssetUrl,
  } = {}) {
    this.assetElements = assetElements;
    this.adjustAssetUrl = adjustAssetUrl;
  }

  /**
   * @param {string} source
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.sourceFilePath
   * @param {string} options.sourceRelativeFilePath
   * @param {string} options.outputFilePath
   * @param {string} options.outputRelativeFilePath
   * @returns {Promise<string>}
   */
  async transform(
    source,
    { sourceFilePath, sourceRelativeFilePath, outputFilePath, outputRelativeFilePath },
  ) {
    let output = source;
    if (outputFilePath.endsWith('.html')) {
      /**
       * @type {{
       *   start: Position;
       *   end: Position;
       *   url: string;
       *   attribute: string;
       *   tag: string;
       *   sourceFilePath: string;
       *   sourceRelativeFilePath: string;
       *   outputFilePath: string;
       *   outputRelativeFilePath: string
       * }[]}
       **/
      const assetUrls = [];

      parser.eventHandler = (ev, _data) => {
        if (ev === SaxEventType.CloseTag) {
          const data = /** @type {Tag} */ (/** @type {any} */ (_data));
          const searchTags = this.assetElements.map(({ tagName }) => tagName);
          if (searchTags.includes(data.name)) {
            const possibleAttributes = this.assetElements
              .map(({ attribute, tagName }) => (tagName === data.name ? attribute : undefined))
              .filter(Boolean);
            for (const possibleAttributeName of possibleAttributes) {
              if (possibleAttributeName) {
                const attribute = getAttributeMeta(data, possibleAttributeName);
                if (attribute) {
                  const { value, start, end } = attribute;
                  assetUrls.push({
                    start,
                    end,
                    url: value,
                    attribute: possibleAttributeName,
                    tag: data.name,
                    sourceFilePath,
                    outputFilePath,
                    sourceRelativeFilePath,
                    outputRelativeFilePath,
                  });
                }
              }
            }
          }
        }
      };
      parser.write(Buffer.from(source));
      parser.end();

      for (const adjustment of assetUrls.reverse()) {
        const { sourceFilePath, outputFilePath, start, end, url } = adjustment;
        const adjustedUrl = await this.adjustAssetUrl({
          url,
          sourceFilePath,
          outputFilePath,
          sourceRelativeFilePath,
        });
        if (adjustedUrl !== url) {
          output = replaceBetween({
            content: output,
            start: start,
            end: end,
            replacement: adjustedUrl,
          });
        }
      }
    }
    return output;
  }
}
