/**
 * @param {string} str
 * @returns {string[]}
 */
function getParts(str) {
  const parts = [];
  let captured = '';
  for (const char of str.split('')) {
    if ((char === '&' && captured.endsWith('&')) || (char === '|' && captured.endsWith('|'))) {
      parts.push(captured.slice(0, -1).trim());
      parts.push(char.repeat(2));
      captured = '';
    } else {
      captured += char;
    }
  }

  if (captured) {
    parts.push(captured.trim());
  }

  return parts;
}

/**
 *
 * @param {string} part
 * @param {string} type
 * @returns {{ type: string; resolveAble: boolean; options?: string; }}
 */
function getStrategy(part, type) {
  /** @type {{ type: string; resolveAble: boolean; options?: string; }} */
  const strategy = {
    type,
    resolveAble: false,
  };
  if (part.length > type.length) {
    const rawOptions = part.slice(type.length).trim();
    if (rawOptions.startsWith("('") && rawOptions.endsWith("')")) {
      const options = rawOptions.slice(2, -2);
      strategy.options = options;
    }
  }
  if (type === 'onIdle' || type === 'onDelay' || type === 'onClientLoad') {
    strategy.resolveAble = true;
  }
  return strategy;
}

/**
 * @param {string} input
 * @returns {import("../../types/main").LoadingStrategy}
 */
export function extractStrategies(input) {
  const parts = getParts(input);

  /** @type {import("../../types/main").LoadingStrategy} */
  const result = {
    strategyAttribute: input,
    strategies: [],
    strategyTemplate: '',
  };

  let templatePartsIndex = 0;
  for (const [i, part] of parts.entries()) {
    const type = part.includes('(') ? part.substring(0, part.indexOf('(')) : part;
    switch (type) {
      // global events
      case 'onClientLoad':
      case 'onClick':
      // element events               eslint fall through
      case 'onHover':
      case 'onMedia':
      case 'onVisible':
      // modifiers                    eslint fall through
      case 'onIdle':
      case 'onDelay':
        result.strategies.push(getStrategy(part, type));
        parts[i] = `{{${templatePartsIndex}}}`;
        templatePartsIndex += 1;
    }
  }
  result.strategyTemplate = parts.join(' ');

  return result;
}
