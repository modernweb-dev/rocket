import fetch from 'node-fetch';

/**
 * @type {Map<string,boolean>}
 */
const resultsMap = new Map();

/**
 *
 * @param {string} url
 * @param {boolean} result
 * @returns {boolean}
 */
const memorizeCheckup = (url, result) => {
  resultsMap.set(url, result);
  return result;
};

/**
 *
 * @param {string} url
 * @param {string} method
 * @returns
 */
const fetchWrap = async (url, method = 'GET') => {
  return Promise.race([
    fetch(url, { method })
      .then(response => response.ok)
      .catch(() => false),
    new Promise(resolve => setTimeout(resolve, 10000, false)),
  ]);
};

/**
 *
 * @param {string} url
 * @returns {Promise<boolean>}
 */
const fetchHead = async url => fetchWrap(url, 'HEAD');

/**
 *
 * @param {string} url - URL object to check
 * @returns {Promise<boolean>} true if url is alive or false if not
 */
const checkUrl = async url =>
  (fetchHead(url) || fetchWrap(url)).then(result => memorizeCheckup(url, result));

/**
 *
 * @param {string} link - link string to check
 * @returns {Promise<boolean>}
 */
export const checkLink = async link => {
  const url = link.startsWith('//') ? `https:${link}` : link;
  return resultsMap.get(url) ?? checkUrl(url);
};
/**
 * Check an array of links and return an object with
 *
 * @param {string[]} links Links to check
 */
export const checkLinks = async links => Promise.all(links.map(checkLink));
