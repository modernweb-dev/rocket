/** @typedef {import('lit-html').TemplateResult} TemplateResult */

export class LayoutRaw {
  /**
   * @param {Record<string, unknown>} data
   * @returns {TemplateResult}
   */
  render(data) {
    return data.content(data);
  }
}
