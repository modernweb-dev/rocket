/**
 * @param {string} title
 * @param {string} headline
 */
export function joinTitleHeadline(title, headline) {
  if (title === headline) {
    return title;
  }
  return `${title} > ${headline}`;
}

/**
 * @param {string} term
 */
function defaultHighlight(term) {
  return `<strong>${term}</strong>`;
}

/**
 * Highlights a search term within a text and truncates the output.
 *
 * @param {object} options
 * @param {string} options.search
 * @param {string} options.text
 * @param {string[]} options.terms
 * @param {number} [options.before]
 * @param {number} [options.length]
 * @param {function} [options.highlight]
 */
export function highlightSearchTerms({
  search,
  text,
  terms,
  before = 15,
  length = 100,
  highlight = defaultHighlight,
}) {
  if (!search || !text) {
    return '';
  }

  let newText = text;
  let searchText = newText.toLowerCase();
  let extraLength = 0;
  let truncateStart = 0;

  let firstFoundIndex;
  for (const term of terms) {
    let offset = 0;
    let startIndex = 0;
    const startsWithMatch = term.substring(0, search.length) === search;
    const addForEnd = startsWithMatch ? search.length : term.length;
    do {
      startIndex = searchText.indexOf(term, offset);
      if (startIndex !== -1) {
        const endIndex = startIndex + addForEnd;
        const matchingText = newText.slice(startIndex, endIndex);
        const highlightedTerm = highlight(matchingText);
        newText = [newText.slice(0, startIndex), highlightedTerm, newText.slice(endIndex)].join('');
        searchText = newText.toLowerCase();
        offset = startIndex + highlightedTerm.length;
        if (firstFoundIndex === undefined || startIndex < firstFoundIndex) {
          firstFoundIndex = startIndex;
          truncateStart = firstFoundIndex - before > 0 ? firstFoundIndex - before : 0;
        }
        if (startIndex - truncateStart - extraLength < length) {
          extraLength += highlightedTerm.length - addForEnd;
        }
      }
    } while (startIndex !== -1);
  }

  return newText.substr(truncateStart, length + extraLength);
}
