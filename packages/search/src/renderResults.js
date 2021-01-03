import chalk from 'chalk';
import { highlightSearchTerms, joinTitleHeadline } from './utils-shared.js';

/** @typedef {import('./types').RocketSearchResult} RocketSearchResult */

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

const icons = {
  guides: '📜',
  docs: '📖',
  blog: '📝',
  others: '❓',
};

/**
 * @param {string} term
 */
function chalkHighlight(term) {
  return chalk.green(term);
}

/**
 * @param {string} section
 */
function getIcon(section) {
  const typedSection = /** @type {keyof icons} */ (section);
  return icons[typedSection] ? icons[typedSection] : icons['others'];
}

/**
 * @param {object} options
 * @param {RocketSearchResult} options.result
 * @param {string} options.search
 */
export function renderResult({ result, search }) {
  const output = [];
  const { terms, section, title, headline, id, body } = result;
  const icon = getIcon(section);

  const header = joinTitleHeadline(title, headline);
  const highlightedHeader = highlightSearchTerms({
    text: header,
    highlight: chalkHighlight,
    search,
    terms,
  });
  const highlightedText = highlightSearchTerms({
    text: body,
    highlight: chalkHighlight,
    search,
    terms,
    length: 180,
  })
    .replace(/\r?\n|\r/g, ' ') // remove line breaks
    .replace(/\s{2,}/g, ' '); // remove whitespace

  const highlightedTextLine1 =
    highlightedText.length > 100 ? highlightedText.slice(0, 90) : highlightedText;
  const highlightedTextLine2 = highlightedText.length > 100 ? highlightedText.substring(90) : '';

  output.push(`  ${icon} ${highlightedHeader}`);
  output.push(`     ${chalk.gray(highlightedTextLine1)}`);
  if (highlightedTextLine2) {
    output.push(`     ${chalk.gray(highlightedTextLine2)}`);
  }
  output.push(`     ${chalk.cyanBright(`http://localhost:8080${id}`)}`);
  output.push('');
  return output;
}

/**
 * @param {object} options
 * @param {string} options.term
 * @param {RocketSearchResult[]} options.results
 * @param {number} [options.maxCount]
 */
export function renderResults({ term, results, maxCount = 6 }) {
  let output = [];

  output.push(CLEAR_COMMAND);
  output.push(`Searching for: ${term}█`);

  output.push('');
  if (results.length > 0) {
    let count = 0;
    for (const result of results) {
      count += 1;
      if (count >= maxCount) {
        break;
      }
      output = [...output, ...renderResult({ result, search: term })];
    }
    const moreCount = results.length - maxCount;
    if (moreCount > 0) {
      output.push(`  there are ${moreCount} more result${moreCount > 2 ? 's' : ''}...`);
    }
  } else {
    output.push('  No results found. (type more or less)');
  }
  output.push('');

  output.push('Legend:');
  let legend = ' ';
  for (const iconKey of Object.keys(icons)) {
    legend += `  ${getIcon(iconKey)} ${iconKey[0].toUpperCase()}${iconKey.substr(1)}`;
  }
  output.push(chalk.gray(legend));
  output.push('');
  output.push(`${chalk.gray('Press')} Strg+C ${chalk.gray('to quit search.')}`);
  return output;
}
