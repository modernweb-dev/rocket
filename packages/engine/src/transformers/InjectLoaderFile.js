import path from 'path';

export class InjectLoaderFile {
  /**
   * @param {string} source
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.sourceFilePath
   * @param {string} options.sourceRelativeFilePath
   * @param {string} options.outputFilePath
   * @param {string} options.outputRelativeFilePath
   * @param {boolean} options.needsLoader
   * @returns {Promise<string>}
   */
  async transform(source, { outputFilePath, needsLoader }) {
    let output = source;

    if (outputFilePath.endsWith('.html') && !outputFilePath.endsWith('.opengraph.html')) {
      const hydrationFilePath = outputFilePath.replace('.html', '-loader-generated.js');
      const fileName = path.basename(hydrationFilePath);
      if (needsLoader) {
        if (output.includes('</body>')) {
          output = output.replace(
            '</body>',
            `<script type="module" src="${fileName}"></script>\n</body>`,
          );
        } else {
          output += `\n<script type="module" src="${fileName}"></script>`;
        }
      }
    }
    return output;
  }
}
