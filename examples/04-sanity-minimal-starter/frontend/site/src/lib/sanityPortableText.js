import { toHTML } from '@portabletext/to-html';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * @param {any} portabletext
 */
export function sanityPortableText(portabletext) {
  const convertedPortableText = toHTML(portabletext);
  return unsafeHTML(convertedPortableText);
}
