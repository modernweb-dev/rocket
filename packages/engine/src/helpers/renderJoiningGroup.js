// TODO: is there a way to not need any for options? 🤔

/**
 * @param {string} groupName
 * @param {any} options
 * @param {Record<string, unknown>} data
 * @returns {Array<import('lit').TemplateResult>}
 */
export function renderJoiningGroup(groupName, options, data) {
  /**
   * @type { {order: number, stringValue: import('lit').TemplateResult}[] }
   */
  const group = [];
  for (const key of Object.keys(options)) {
    const value = options[key];
    if (key.startsWith(`${groupName}__`)) {
      const order = parseInt(key.substr(groupName.length + 2), 10);
      const stringValue = typeof value === 'function' ? value(data, options) : value;
      group.push({
        order,
        stringValue,
      });
    }
  }

  group.sort((a, b) => a.order - b.order);
  return group.map(obj => obj.stringValue);
}
