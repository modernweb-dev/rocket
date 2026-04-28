/** Runs on: import-hook */

/**
 * @typedef {{
 *   url: string;
 *   label?: string;
 *   height?: number;
 * }} RequestDemoMetadata
 */

/**
 * @param {string | null | undefined} meta
 * @returns {RequestDemoMetadata}
 */
export function parseRequestDemoMetadata(meta) {
  const attributes = parseFenceAttributes(stripRequestDemoMarker(meta || ''));
  const url = attributes.get('url');

  if (url === undefined) {
    throw new Error('Invalid Request Demo metadata: `url` is required.');
  }
  validateRequestDemoUrl(url);

  const height = attributes.has('height')
    ? parseRequestDemoHeight(attributes.get('height'))
    : undefined;
  const label = attributes.get('label') || undefined;

  return {
    url,
    ...(label ? { label } : {}),
    ...(height !== undefined ? { height } : {}),
  };
}

/**
 * @param {string} meta
 */
function stripRequestDemoMarker(meta) {
  return meta
    .trim()
    .replace(/^request-demo\b/, '')
    .trim();
}

/**
 * @param {string} source
 */
function parseFenceAttributes(source) {
  /** @type {Map<string, string | undefined>} */
  const attributes = new Map();
  const matcher = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]*)))?/g;

  for (const match of source.matchAll(matcher)) {
    attributes.set(match[1], match[2] ?? match[3] ?? match[4]);
  }

  return attributes;
}

/**
 * @param {string} url
 */
function validateRequestDemoUrl(url) {
  if (isExternalUrl(url)) {
    throw new Error(
      'Invalid Request Demo metadata: `url` must be a same-site path starting with `/`.',
    );
  }
  if (!url.startsWith('/')) {
    throw new Error(
      'Invalid Request Demo metadata: `url` must be a site-root path starting with `/`.',
    );
  }
  if (url.includes('#')) {
    throw new Error('Invalid Request Demo metadata: `url` must not include a hash.');
  }
}

/**
 * @param {string} url
 */
function isExternalUrl(url) {
  return url.startsWith('//') || /^[a-zA-Z][a-zA-Z\d.+-]*:/.test(url);
}

/**
 * @param {string | undefined} height
 */
function parseRequestDemoHeight(height) {
  if (!height || !/^[1-9]\d*$/.test(height)) {
    throw new Error(
      'Invalid Request Demo metadata: `height` must be a positive integer pixel value.',
    );
  }
  return Number(height);
}
