import path from 'path';
import fs from 'fs';
import { writeFile, readFile } from 'fs/promises';

import { parse } from '../helpers/es-module-lexer.js';
import { getServerCodeFromMd } from '../formats/getServerCodeFromMd.js';
import { getServerCodeFromHtml } from '../formats/html.js';
import { importsToImportNames } from './import-names.js';

/**
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {string} content
 * @param {string} header
 * @param {string} filePath
 * @returns {string}
 */
function setRocketHeader(content, header, filePath) {
  const lines = content.toString().split('\n');

  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '/* START - Rocket auto generated - do not touch */') {
      startIndex = i;
    }
    if (lines[i].trim() === '/* END - Rocket auto generated - do not touch */') {
      endIndex = i;
      break;
    }
  }

  if (startIndex && !endIndex) {
    throw new Error(`No "/* END - Rocket auto generated - do not touch */" found in ${filePath}`);
  }

  if (startIndex >= 0 && endIndex >= 0) {
    lines.splice(startIndex, endIndex - startIndex + 1, header);
  } else {
    const extension = filePath.split('.').pop();

    /** @type {string[]} */
    let wrapBefore = [];
    /** @type {string[]} */
    let warpAfter = [];
    switch (extension) {
      case 'md':
        wrapBefore = ['```js server'];
        warpAfter = ['```'];
        break;
      case 'html':
        wrapBefore = ['<script type="module" server>'];
        warpAfter = ['</script>'];
        break;
    }

    lines.unshift([...wrapBefore, header, ...warpAfter, ''].join('\n'));
  }

  return lines.join('\n');
}

/**
 *
 * @param {string} content
 * @param {object} options
 * @param {string} options.filePath
 * @param {string} options.docsDir
 * @returns {Promise<string>}
 */
async function generateRocketHeader(content, { filePath, docsDir }) {
  const dataFiles = [];

  // Use all `recursive.data.js` files up the tree
  let possibleParent = path.dirname(filePath);
  while (possibleParent.startsWith(docsDir)) {
    const thisAndSubDirsFilePath = path.join(possibleParent, 'recursive.data.js');
    const fileDir = path.dirname(filePath);
    if (fs.existsSync(thisAndSubDirsFilePath)) {
      const rel = path.relative(fileDir, thisAndSubDirsFilePath);
      dataFiles.push({
        filePath: thisAndSubDirsFilePath,
        exportModuleName: rel.startsWith('.') ? rel : `./${rel}`,
      });
    }
    possibleParent = path.dirname(possibleParent);
  }

  // Add `local.data.js` if available
  const thisDirFilePath = path.join(path.dirname(filePath), 'local.data.js');
  if (fs.existsSync(thisDirFilePath)) {
    dataFiles.push({
      filePath: thisDirFilePath,
      exportModuleName: './local.data.js',
    });
  }

  /**
   * @type {Array<{
   *  importName: string;
   *  importModuleName: string;
   *  as?: string;
   * }>}
   */
  const possibleImports = [];
  for (const dataFile of dataFiles) {
    const { filePath: dataFilePath, exportModuleName } = dataFile;
    const readDataFile = await readFile(dataFilePath);
    const [, exports] = parse(readDataFile.toString());

    for (const dataExportName of exports) {
      const foundIndex = possibleImports.findIndex(el => el.importName === dataExportName);
      if (foundIndex >= 0) {
        possibleImports[foundIndex].importModuleName = exportModuleName;
      } else {
        possibleImports.push({
          importName: dataExportName,
          importModuleName: exportModuleName,
        });
      }
    }
  }

  let contentWithoutRocketHeader = setRocketHeader(content, '', filePath);
  if (filePath.endsWith('.md')) {
    contentWithoutRocketHeader = getServerCodeFromMd(contentWithoutRocketHeader);
  }
  if (filePath.endsWith('.html')) {
    contentWithoutRocketHeader = getServerCodeFromHtml(contentWithoutRocketHeader);
  }

  const [thisImports, thisExports] = parse(contentWithoutRocketHeader);

  const thisImportNames = importsToImportNames(thisImports, contentWithoutRocketHeader);
  const thisImportsAndExports = [...thisImportNames, ...thisExports];

  for (const thisExport of thisImportsAndExports) {
    const foundIndex = possibleImports.findIndex(el => el.importName === thisExport);
    if (foundIndex >= 0) {
      const asOriginalVariableName = `original${capitalizeFirstLetter(
        possibleImports[foundIndex].importName,
      )}`;
      if (contentWithoutRocketHeader.includes(asOriginalVariableName)) {
        // import { variableName as originalVariableName } instead
        possibleImports[foundIndex].as = asOriginalVariableName;
      } else {
        // delete import as exported by user and asOriginalVariableName is not used in code
        possibleImports.splice(foundIndex, 1);
      }
    }
  }

  const exportNames = possibleImports.filter(el => !el.as).map(el => el.importName);
  const exportsString = exportNames.length > 0 ? [`export { ${exportNames.join(', ')} };`] : [];

  const usedImports = new Map();
  for (const importObj of possibleImports) {
    const importStatement = importObj.as
      ? `${importObj.importName} as ${importObj.as}`
      : `${importObj.importName}`;
    if (usedImports.has(importObj.importModuleName)) {
      usedImports.get(importObj.importModuleName).push(importStatement);
    } else {
      usedImports.set(importObj.importModuleName, [importStatement]);
    }
  }

  const sourceRelativeFilePath = path.relative(docsDir, filePath);
  // TODO: format with prettier or add <!-- prettier-ignore-start --> + end
  const header = [
    '/* START - Rocket auto generated - do not touch */',
    `export const sourceRelativeFilePath = '${sourceRelativeFilePath}';`,
    ...[...usedImports.entries()].map(
      ([importModuleName, imports]) =>
        `import { ${imports.join(', ')} } from '${importModuleName}';`,
    ),
    ...exportsString,
    '/* END - Rocket auto generated - do not touch */',
  ].join('\n');

  return header;
}

/**
 * @param {string} filePath
 * @param {string} docsDir
 */
export async function updateRocketHeader(filePath, docsDir) {
  const content = (await readFile(filePath)).toString();
  try {
    const header = await generateRocketHeader(content, { filePath, docsDir });
    const updatedContent = setRocketHeader(content, header, filePath);
    if (content !== updatedContent) {
      await writeFile(filePath, updatedContent);
    }
  } catch (error) {
    // we tried to update the rocket header but something failed => user has to fix his code
    // error will be shown by the render worker
  }
}
