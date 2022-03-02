import { readFile } from 'fs/promises';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * @param {import('fs').PathLike} filePath
 * @returns {Promise<import('lit/directive.js').DirectiveResult>}
 */
export async function inlineFile(filePath) {
  const fileContent = await readFile(filePath, 'utf8');
  return unsafeHTML(fileContent.toString());
}
