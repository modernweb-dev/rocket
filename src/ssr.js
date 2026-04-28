/** Runs on: imported-js */
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';

/**
 * @param {string | import('lit').TemplateResult} template
 * @returns {Promise<string>}
 */
export async function ssrRender(template) {
  if (typeof template === 'string') {
    return template;
  }
  return await collectResult(render(template));
}
