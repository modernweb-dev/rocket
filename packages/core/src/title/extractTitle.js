/**
 * Reads a text and extracts a title from it
 *
 * @param {string} content The text where to extract the title from
 * @param {string} engine
 */
export function extractTitle(content, engine = 'md') {
  if (engine === 'md') {
    let captureHeading = true;
    for (const line of content.split('\n')) {
      if (line.startsWith('```')) {
        captureHeading = !captureHeading;
      }
      if (captureHeading && line.startsWith('# ')) {
        return line.substring(2);
      }
    }
  }
  return undefined;
}
