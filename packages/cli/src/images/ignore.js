/**
 * The default responsive ignore function will ignore files
 * - ending in `.svg`
 * - containing `rocket-unresponsive.`
 *
 * @param {object} opts
 * @param {string} opts.src
 * @param {string} opts.title
 * @param {string} opts.alt
 * @returns {boolean}
 */
export function ignore({ src }) {
  return src.endsWith('svg') || src.includes('rocket-unresponsive.');
}
