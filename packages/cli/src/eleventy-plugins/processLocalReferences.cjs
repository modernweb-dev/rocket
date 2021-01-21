const fs = require('fs');
const path = require('path');
const utf8 = require('utf8');
const { SaxEventType, SAXParser } = require('sax-wasm');

const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = fs.readFileSync(saxPath);

/** @typedef {import('./types').NavigationNode} NavigationNode */
/** @typedef {import('./types').Heading} Heading */
/** @typedef {import('./types').SaxData} SaxData */

// Instantiate
const parser = new SAXParser(
  SaxEventType.Attribute,
  { highWaterMark: 256 * 1024 }, // 256k chunks
);
parser.prepareWasm(saxWasmBuffer);

/**
 * @param {string} link
 */
function isRelativeLink(link) {
  if (link.startsWith('http') || link.startsWith('/')) {
    return false;
  }
  return true;
}

const templateEndings = [
  '.html',
  '.md',
  '.11ty.js',
  '.liquid',
  '.njk',
  '.hbs',
  '.mustache',
  '.ejs',
  '.haml',
  '.pug',
];

function isTemplateFile(href) {
  for (const templateEnding of templateEndings) {
    if (href.endsWith(templateEnding)) {
      return true;
    }
  }
  return false;
}

function isIndexTemplateFile(href) {
  const hrefParsed = path.parse(href);
  const indexTemplateEndings = templateEndings.map(ending => `index${ending}`);

  for (const indexTemplateEnding of indexTemplateEndings) {
    if (hrefParsed.base === indexTemplateEnding) {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} html
 */
function extractReferences(html, inputPath) {
  const _html = html.replace(/\n/g, 'XXXRocketProcessLocalReferencesXXX');
  const hrefs = [];
  const assets = [];
  parser.eventHandler = (ev, _data) => {
    const data = /** @type {SaxData} */ (/** @type {any} */ (_data));
    if (ev === SaxEventType.Attribute) {
      const attributeName = data.name.toString();
      const value = data.value.toString();
      const entry = {
        value,
        startCharacter: data.value.start.character,
      };
      if (attributeName === 'href') {
        if (isRelativeLink(value)) {
          hrefs.push(entry);
        }
      }
      if (attributeName === 'src' || attributeName === 'srcset') {
        if (isRelativeLink(value) && !isIndexTemplateFile(inputPath)) {
          assets.push(entry);
        }
      }
    }
  };
  parser.write(Buffer.from(_html));
  parser.end();

  return { hrefs, assets };
}

/**
 * @param {string} inValue
 */
function getValueAndAnchor(inValue) {
  let value = inValue.replace(/&#/g, '--__check-html-links__--');
  let anchor = '';
  let suffix = '';

  if (value.includes('#')) {
    [value, anchor] = value.split('#');
    suffix = `#${anchor}`;
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
  suffix = suffix.replace(/--__check-html-links__--/g, '&#');
  value = value.trim();
  anchor = anchor.trim();

  return {
    value,
    anchor,
    suffix,
  };
}

function calculateNewHrefs(hrefs, inputPath) {
  const newHrefs = [];
  for (const hrefObj of hrefs) {
    const newHrefObj = { ...hrefObj };
    const { value: href, suffix } = getValueAndAnchor(hrefObj.value);

    if (isRelativeLink(href) && isTemplateFile(href)) {
      const hrefParsed = path.parse(href);
      const dirPart = hrefParsed.dir.length > 1 ? `${hrefParsed.dir}/` : '';
      newHrefObj.newValue = isIndexTemplateFile(href)
        ? `${dirPart}${suffix}`
        : `${dirPart}${hrefParsed.name}/${suffix}`;

      if (isTemplateFile(inputPath)) {
        if (isIndexTemplateFile(inputPath)) {
          // nothing
        } else {
          newHrefObj.newValue = path.join('../', newHrefObj.newValue);
        }
      }
    }

    if (newHrefObj.newValue) {
      newHrefs.push(newHrefObj);
    }
  }
  return newHrefs;
}

function calculateNewAssets(assets) {
  const newAssets = [...assets];
  return newAssets.map(assetObj => {
    assetObj.newValue = path.join('../', assetObj.value);
    return assetObj;
  });
}

function replaceContent(hrefObj, content) {
  const upToChange = content.slice(0, hrefObj.startCharacter);
  const afterChange = content.slice(hrefObj.startCharacter + hrefObj.value.length);

  return `${upToChange}${hrefObj.newValue}${afterChange}`;
}

function sortByStartCharacter(a, b) {
  if (a.startCharacter > b.startCharacter) {
    return 1;
  }
  if (a.startCharacter < b.startCharacter) {
    return -1;
  }
  return 0;
}

function applyChanges(_changes, _content) {
  // make sure changes are sorted as changes affect all other changes afterwards
  let changes = [..._changes].sort(sortByStartCharacter);

  let content = _content.replace(/\n/g, 'XXXRocketProcessLocalReferencesXXX');

  while (changes.length > 0) {
    const hrefObj = changes.shift();
    const diff = hrefObj.newValue.length - hrefObj.value.length;

    content = replaceContent(hrefObj, content);

    changes = changes.map(href => {
      href.startCharacter = href.startCharacter + diff;
      return href;
    });
  }

  return content.replace(/XXXRocketProcessLocalReferencesXXX/g, '\n');
}

async function processLocalReferences(_content) {
  const content = utf8.encode(_content);
  const inputPath = this.inputPath;
  const { hrefs, assets } = extractReferences(content, inputPath);
  const newHrefs = calculateNewHrefs(hrefs, inputPath);
  const newAssets = calculateNewAssets(assets, inputPath);

  const newContent = applyChanges([...newHrefs, ...newAssets], content);
  return utf8.decode(newContent);
}

module.exports = {
  processLocalReferences,
};
