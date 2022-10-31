import normalizeUrlDep from 'normalize-url';

const normalizeOptions = {
  stripAuthentication: true,
  stripHash: true,
  stripTextFragment: true,
  removeQueryParameters: false,
  // removeTrailingSlash: false,
  // removeSingleSlash: false,
  removeDirectoryIndex: true,
  // removeExplicitPort: true,
};

/**
 * @param {string} url
 * @param {import('normalize-url').Options} options
 * @returns {string}
 */
export function normalizeUrl(url, options = {}) {
  if (url.startsWith('mailto:')) {
    return url.toLowerCase();
  }
  // = "mailto:" but html encoded)
  if (url.startsWith('&#109;&#97;&#105;&#108;&#116;&#111;&#58;')) {
    return url;
  }
  if (url.startsWith('tel:')) {
    return url.toLowerCase();
  }
  if (url.startsWith('about:')) {
    return url.toLowerCase();
  }
  return normalizeUrlDep(url, { ...normalizeOptions, ...options }).toLowerCase();
}

/**
 * @param {string} url 
 * @returns {string}
 */
export function normalizeToLocalUrl(url) {
  return normalizeUrl(url, { removeQueryParameters: true });
}

/**
 *
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrlWithHash(url) {
  return normalizeUrlDep(url, {
    ...normalizeOptions,
    stripHash: false,
  });
}
