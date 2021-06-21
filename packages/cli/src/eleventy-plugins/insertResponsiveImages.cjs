/* eslint-disable @typescript-eslint/ban-ts-comment */
const fs = require('fs');
const path = require('path');
const EleventyImage = require('@11ty/eleventy-img');
const urlFilter = require('@11ty/eleventy/src/Filters/Url.js');
const { SaxEventType, SAXParser } = require('sax-wasm');
const { getComputedConfig } = require('../public/computedConfig.cjs');

const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = fs.readFileSync(saxPath);

/** @typedef {import('../types').Heading} Heading */

/** @typedef {import('sax-wasm').Text} Text */
/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('sax-wasm').Position} Position */

// Instantiate
const parser = new SAXParser(
  SaxEventType.CloseTag,
  { highWaterMark: 256 * 1024 }, // 256k chunks
);

/**
 * @param {object} options
 * @param {string} options.html
 * @param {Position} options.start
 * @param {Position} options.end
 * @param {string} options.insert
 */
function replaceBetween({ html, start, end, insert = '' }) {
  const lines = html.split('\n');
  const i = start.line;
  const line = lines[i];
  const upToChange = line.slice(0, start.character);
  const afterChange = line.slice(end.character - 4);

  lines[i] = `${upToChange}${insert}${afterChange}`;
  return lines.join('\n');
}

/**
 * @param {Tag} data
 * @param {string} name
 */
function getAttribute(data, name) {
  if (data.attributes) {
    const { attributes } = data;
    const foundIndex = attributes.findIndex(entry => entry.name.value === name);
    if (foundIndex !== -1) {
      return attributes[foundIndex].value.value;
    }
  }
  return null;
}

/**
 * @param {Tag} data
 */
function getAttributes(data) {
  if (data.attributes) {
    const { attributes } = data;
    return attributes.map(entry => ({ name: entry.name.value, value: entry.value.value }));
  }
  return [];
}

// /**
//  * @param {Tag} data
//  */
// function getText(data) {
//   if (data.textNodes) {
//     return data.textNodes.map(textNode => textNode.value).join('');
//   }
//   return null;
// }

// /**
//  * @param {Tag} data
//  */
// function getClassList(data) {
//   const classString = getAttribute(data, 'class');
//   return classString ? classString.split(' ') : [];
// }

/**
 * @param {string} html
 */
function getImages(html) {
  /** @type {Heading[]} */
  const images = [];
  parser.eventHandler = (ev, _data) => {
    if (ev === SaxEventType.CloseTag) {
      const data = /** @type {Tag} */ (/** @type {any} */ (_data));
      if (data.name === 'img') {
        const { openStart, closeEnd } = data;

        const attributes = getAttributes(data);
        const presetName = getAttribute(data, 'rocket-image');
        const src = getAttribute(data, 'src');
        const title = getAttribute(data, 'title');
        const alt = getAttribute(data, 'alt');
        if (presetName) {
          images.push({
            presetName,
            attributes,
            src,
            title,
            alt,
            openStart,
            closeEnd,
          });
        }
      }
    }
  };
  parser.write(Buffer.from(html, 'utf8'));
  parser.end();

  // @ts-ignore
  return images;
}

function getSrcsetAttribute(imageFormat) {
  return `srcset="${imageFormat.map(entry => entry.srcset).join(', ')}"`;
}

async function responsiveImages(images, { inputPath, outputDir, imagePresets = {} }) {
  for (let i = 0; i < images.length; i += 1) {
    const { alt, filePath, title, src, presetName, attributes } = images[i];

    if (alt === undefined) {
      throw new Error(`Missing \`alt\` on responsive image from: ${src} in ${inputPath}`);
    }

    const presetSettings = imagePresets[presetName];
    if (!presetSettings) {
      throw new Error(`Could not find imagePresets: { ${presetName}: {} }`);
    }
    const sizes = presetSettings.sizes || '100vw';

    const metadata = await EleventyImage(filePath, {
      outputDir: path.join(outputDir, 'images'),
      urlPath: urlFilter('/images/'),
      ...presetSettings,
    });
    const lowsrc = metadata.jpeg[0];

    let pictureStartWithSources = '';
    let srcsetAttribute = '';
    let sizesAttribute = '';
    let pictureEnd = '';

    if (Object.keys(metadata).length > 1) {
      const sources = Object.values(metadata)
        .map(imageFormat => {
          return `<source type="${imageFormat[0].sourceType}" ${getSrcsetAttribute(
            imageFormat,
          )} sizes="${sizes}">`;
        })
        .join('\n');
      pictureStartWithSources = `<picture>\n${sources}`;
      pictureEnd = '</picture>';
    } else {
      srcsetAttribute = getSrcsetAttribute(Object.values(metadata)[0]);
      sizesAttribute = `sizes="${sizes}"`;
    }
    const attributesString = attributes
      .filter(attribute => !['src', 'title'].includes(attribute.name))
      .map(attribute => `${attribute.name}="${attribute.value}"`)
      .join(' ');

    const figureStart = title ? '<figure>' : '';
    const figureEndWithCaption = title ? `<figcaption>${title}</figcaption>\n</figure>` : '';

    images[i].newHtml = `
      ${figureStart}
        ${pictureStartWithSources}
          <img
            ${attributesString}
            src="${lowsrc.url}"
            ${srcsetAttribute}
            ${sizesAttribute}
            width="${lowsrc.width}"
            height="${lowsrc.height}"
            loading="lazy"
            decoding="async"
          />
        ${pictureEnd}
      ${figureEndWithCaption}
    `;
  }
  return images;
}

function updateHtml(html, changes) {
  let newHtml = html;
  for (const change of changes.reverse()) {
    newHtml = replaceBetween({
      html: newHtml,
      start: change.openStart,
      end: change.closeEnd,
      insert: change.newHtml,
    });
  }
  return newHtml;
}

function resolveFilePath(images, { inputPath }) {
  for (let i = 0; i < images.length; i += 1) {
    images[i].filePath = path.join(path.dirname(inputPath), images[i].src);
  }
  return images;
}

let isSetup = false;

/**
 * @param {string} html
 */
async function insertResponsiveImages(html) {
  const config = getComputedConfig();

  if (!isSetup) {
    await parser.prepareWasm(saxWasmBuffer);
    isSetup = true;
  }

  const options = {
    inputPath: this.inputPath,
    outputDir: this.outputDir,
    imagePresets: config.imagePresets,
  };

  let images = getImages(html);
  images = resolveFilePath(images, options);
  images = await responsiveImages(images, options);
  const newHtml = updateHtml(html, images);

  return newHtml;
}

module.exports = {
  insertResponsiveImages,
};
