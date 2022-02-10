/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @typedef {import('lit').TemplateResult} TemplateResult */

export class LayoutRaw {
  /**
   * @param {Record<string, unknown>} data
   * @returns {TemplateResult}
   */
  render(data) {
    // @ts-ignore
    return data.content(data);
  }
}
