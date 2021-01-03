import { extractTitle } from './extractTitle.js';
import { parseTitle } from './parseTitle.js';

/**
 * @param {string} content
 * @param {string} engine
 */
export function processContentWithTitle(content, engine = 'md') {
  const title = extractTitle(content, engine);
  if (title) {
    return parseTitle(title);
  }
  return undefined;
}
