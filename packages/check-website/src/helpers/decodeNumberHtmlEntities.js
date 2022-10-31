/**
 * Converts number HTML entities to their corresponding characters.
 *
 * Example:
 * &#109;&#97;&#105;&#108;&#116;&#111;&#58; => mailto:
 *
 * @param {string} str
 * @returns {string}
 */
export function decodeNumberHtmlEntities(str) {
  return str.replace(/&#([0-9]{1,3});/gi, (match, numStr) => {
    const num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}
