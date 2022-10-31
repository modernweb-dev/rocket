/** @typedef {import('sax-wasm').Tag} Tag */

import { normalizeUrl, normalizeUrlWithHash } from './normalizeUrl.js';

/**
 * @param {Tag} data
 * @param {string} name
 */
export function getAttributeInfo(data, name) {
  if (data.attributes) {
    const { attributes } = data;
    const foundIndex = attributes.findIndex(entry => entry.name.value === name);
    if (foundIndex !== -1) {
      const entry = attributes[foundIndex].value;
      return {
        value: entry.value,
        start: `${entry.start.line + 1}:${entry.start.character}`,
        end: `${entry.end.line + 1}:${entry.end.character}`,
        name,
      };
    }
  }
  return undefined;
}

export function resolveToFullPageUrl(pageUrl, referenceUrl) {
  // = "mailto:" but html encoded)
  if (referenceUrl.startsWith('&#109;&#97;&#105;&#108;&#116;&#111;&#58;')) {
    return referenceUrl;
  }
  if (referenceUrl.startsWith('about:')) {
    return referenceUrl;
  }
  const url = new URL(referenceUrl, pageUrl);
  return url.href;
}

export function getLinksFromSrcSet(value, pageUrl, entry) {
  const links = [];
  if (value.includes(',')) {
    const srcsets = value.split(',').map(el => el.trim());
    for (const srcset of srcsets) {
      if (srcset.includes(' ')) {
        const srcsetParts = srcset.split(' ');
        links.push({ ...entry, url: resolveToFullPageUrl(pageUrl, srcsetParts[0]) });
      } else {
        links.push({ ...entry, url: resolveToFullPageUrl(pageUrl, srcset) });
      }
    }
  } else if (value.includes(' ')) {
    const srcsetParts = value.split(' ');
    links.push({ ...entry, url: resolveToFullPageUrl(pageUrl, srcsetParts[0]) });
  } else {
    links.push(entry);
  }
  return links;
}
