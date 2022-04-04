/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * @param {object} options
 * @param {string} options.strategyTemplate
 * @param {import("../../types/main").Strategy[]} options.strategies
 * @returns {boolean}
 */
export function evaluate({ strategyTemplate, strategies }) {
  // @ts-ignore
  const conditions = strategyTemplate.replace(/{{(\d+)}}/g, (match, number) => {
    if (strategies[number]) {
      return strategies[number].resolveAble ? 1 : 0;
    }
    return match;
  });
  const result = evaluateConditions(conditions);
  return result;
}

/**
 * @param {string} input
 * @returns {boolean}
 */
export function evaluateConditions(input) {
  let state;
  let mode = 'and';

  const str = input.replace('&&', '&').replace('||', '|');

  for (const char of str) {
    if (char === ' ') {
      continue;
    }
    if (char === '&') {
      mode = 'and';
    }
    if (char === '|') {
      mode = 'or';
    }
    // @ts-ignore
    if (!isNaN(char)) {
      // is number
      const i = parseInt(char);
      state = state === undefined ? i : mode === 'and' ? state & i : state | i;
      if (mode === 'or' && state === 1) {
        return true;
      }
    }
  }
  return !!state;
}
