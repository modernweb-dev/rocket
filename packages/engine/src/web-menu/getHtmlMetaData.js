import fs from 'fs';
import { getAttribute, getText } from './sax-helpers.js';

/** @typedef {import('sax-wasm').Text} Text */
/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('sax-wasm').Position} Position */
/** @typedef {import('../../types/menu.js').Page} Page */

import { parser, SaxEventType, streamOptions } from './sax-parser.js';

/**
 * @param {Tag} data
 * @returns {boolean}
 */
function isHeadline(data) {
  return data.name
    ? data.name[0] === 'h' && ['1', '2', '3', '4', '5', '6'].includes(data.name[1])
    : false;
}

/**
 *
 * @param {string} htmlFilePath
 * @returns
 */
export function getHtmlMetaData(htmlFilePath) {
  /** @type {Partial<Page>} */
  const metaData = {
    // headlinesWithId: [],
  };

  /** @type {string | undefined} */
  let capturedHeadlineText = undefined;
  parser.eventHandler = (ev, _data) => {
    if (ev === SaxEventType.OpenTag) {
      const data = /** @type {Tag} */ (/** @type {any} */ (_data));
      if (isHeadline(data)) {
        capturedHeadlineText = '';
      }
    }
    if (capturedHeadlineText !== undefined && ev === SaxEventType.Text) {
      const data = /** @type {Text} */ (/** @type {any} */ (_data));
      capturedHeadlineText += data.value;
    }

    if (ev === SaxEventType.CloseTag) {
      const data = /** @type {Tag} */ (/** @type {any} */ (_data));
      // ********** <meta name="*" content="*">
      if (data.name === 'meta') {
        const metaName = getAttribute(data, 'name');
        if (metaName === 'menu:link.text') {
          metaData.menuLinkText = getAttribute(data, 'content');
        }
        if (metaName === 'menu:page.releaseDateTime') {
          const dtString = getAttribute(data, 'content');
          if (dtString) {
            const date = new Date(dtString);
            const year = date.getFullYear();
            const month = date.getMonth().toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0'); // getDay === week of the day
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            metaData.menuOrder = parseInt(`-${year}${month}${day}${hours}${minutes}`);
            metaData.releaseDateTime = dtString;
          }
        }
        if (metaName === 'menu:page.subHeading') {
          metaData.subHeading = getAttribute(data, 'content');
        }
        if (metaName === 'menu:order') {
          metaData.menuOrder = parseInt(getAttribute(data, 'content') || '0');
        }
        if (metaName === 'menu:exclude') {
          metaData.menuNoLink = getAttribute(data, 'content') !== 'false';
        }
      }
      if (!metaData.title && data.name === 'title') {
        metaData.title = getText(data);
      }

      // ********** <h1> - <h6>
      if (isHeadline(data)) {
        const id = getAttribute(data, 'id');
        const linkText = getAttribute(data, 'link-text');
        const text = linkText || capturedHeadlineText || '';
        if (data.name === 'h1') {
          metaData.h1 = text;
        }
        if (id && text) {
          if (!metaData.headlinesWithId) {
            metaData.headlinesWithId = [];
          }
          const rawTextObj = linkText ? { rawText: capturedHeadlineText } : {};
          metaData.headlinesWithId.push({
            text,
            id,
            level: parseInt(data.name[1], 10),
            ...rawTextObj,
          });
        }
        capturedHeadlineText = undefined;
      }
    }
  };

  return new Promise(resolve => {
    /** @type {Array<Buffer>} */
    const chunks = [];
    const readable = fs.createReadStream(htmlFilePath, streamOptions);
    readable.on('data', chunk => {
      parser.write(/** @type {Buffer} */ (chunk));
      chunks.push(Buffer.from(chunk));
    });
    readable.on('end', () => {
      parser.end();
      capturedHeadlineText = undefined;

      resolve(metaData);
    });
  });
}
