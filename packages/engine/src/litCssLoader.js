import { readFile } from 'fs/promises';

/**
 * @param {string} url
 * @param {{ format: string, importAssertions: { type?: 'module' | 'json' | 'css' } }} context
 * @param {Function} defaultLoad
 * @returns {Promise<{ format: string, source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array }>}
 */
export async function load(url, context, defaultLoad) {
  const { importAssertions } = context;
  if (importAssertions.type === 'css') {
    const content = await readFile(new URL(url)).then(res => res.toString());
    return {
      format: 'module',
      source: [
        //
        "import { css } from 'lit';",
        'export default css`',
        content,
        '`;',
      ].join('\n'),
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
