/* eslint-disable @typescript-eslint/ban-ts-comment */
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getAttribute } from '../web-menu/sax-helpers.js';

import { parse } from '../helpers/es-module-lexer.js';
import { getServerCodeFromMd } from '../formats/getServerCodeFromMd.js';
import { getServerCodeFromHtml } from '../formats/html.js';
import { importsToImportNames } from './import-names.js';

/** @typedef {import('sax-wasm').Text} Text */
/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('sax-wasm').Position} Position */
/** @typedef {import('../../types/menu.js').Page} Page */
/** @typedef {import('../../types/main.js').ComponentStrings} ComponentStrings */

/** @typedef {{ [tagName: string]: { strategy: string; importString: string }}} ComponentsWithStrategy  */

import { parser, SaxEventType } from '../web-menu/sax-parser.js';

/**
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {object} options
 * @param {string} options.outputFileContent
 * @param {ComponentStrings} options.componentStrings
 * @returns {ComponentsWithStrategy}
 */
export function getComponentsWithStrategy({ outputFileContent, componentStrings }) {
  if (!componentStrings) {
    return {};
  }

  /** @type {ComponentsWithStrategy} */
  const componentsWithStrategy = {};

  parser.eventHandler = (ev, _data) => {
    if (ev === SaxEventType.CloseTag) {
      const data = /** @type {Tag} */ (/** @type {any} */ (_data));
      const tagName = data.name;
      if (tagName.includes('-')) {
        const fullStrategy = getAttribute(data, 'loading');

        if (componentStrings[tagName]) {
          if (!componentsWithStrategy[tagName]) {
            componentsWithStrategy[tagName] = {
              strategy: 'server',
              importString: componentStrings[tagName],
            };
          }
          if (fullStrategy === 'client') {
            componentsWithStrategy[tagName].strategy = 'client';
          }
          if (
            fullStrategy?.startsWith('hydrate') &&
            componentsWithStrategy[tagName].strategy !== 'client'
          ) {
            componentsWithStrategy[tagName].strategy = 'hydrate';
          }
        }
      }
    }
  };

  parser.write(Buffer.from(outputFileContent));
  parser.end();

  return componentsWithStrategy;
}

export class RocketHeader {
  /** @type {String[]} */
  dataCascade = [];
  /** @type {String[]} */
  componentDefinitions = [];
  sourceFileContent = '';
  needsLoader = false;

  /**
   *
   * @param {Object} options
   * @param {String} options.sourceFilePath
   * @param {String} options.inputDir
   * @param {number} options.longFileHeaderWidth
   * @param {String} options.longFileHeaderComment
   */
  constructor({ sourceFilePath, inputDir, longFileHeaderWidth, longFileHeaderComment }) {
    this.sourceFilePath = sourceFilePath;
    this.inputDir = inputDir;
    this.longFileHeaderWidth = longFileHeaderWidth;
    this.longFileHeaderComment = longFileHeaderComment;
  }

  /**
   * @param {string} sourceFileContent
   */
  setSourceFileContent(sourceFileContent) {
    this.sourceFileContent = sourceFileContent;

    const dataCascade = [];
    const componentDefinitions = [];

    let captureDataCascade = false;
    let captureComponents = false;
    const lines = this.sourceFileContent.split('\n');
    for (const line of lines) {
      if (line.trim() === '/* END - Rocket auto generated - do not touch */') {
        break;
      }
      if (line.trim() === 'export async function registerCustomElements() {') {
        captureDataCascade = false;
        captureComponents = true;
      }

      if (captureDataCascade === true) {
        dataCascade.push(line);
      }
      if (captureComponents === true) {
        if (
          line.trim() === '// hydrate-able components' ||
          line.trim() === '// client-only components'
        ) {
          this.needsLoader = true;
        }
        componentDefinitions.push(line);
      }

      if (line.trim() === '/* START - Rocket auto generated - do not touch */') {
        captureDataCascade = true;
      }
    }

    this.dataCascade = dataCascade;
    this.componentDefinitions = componentDefinitions;
  }

  async getSourceFileContent() {
    if (!this.sourceFileContent) {
      this.setSourceFileContent((await readFile(this.sourceFilePath)).toString());
    }
    return this.sourceFileContent;
  }

  async syncDataCascade() {
    try {
      await this._syncDataCascade();
    } catch (error) {
      // we tried to update the rocket header but something failed => user has to fix his code
      // error will be shown by the render worker
    }
  }

  async _syncDataCascade() {
    const dataFiles = [];

    // Use all `recursive.data.js` files up the tree
    let possibleParent = path.dirname(this.sourceFilePath);
    while (possibleParent.startsWith(this.inputDir)) {
      const thisAndSubDirsFilePath = path.join(possibleParent, 'recursive.data.js');
      const fileDir = path.dirname(this.sourceFilePath);
      if (existsSync(thisAndSubDirsFilePath)) {
        const rel = path.relative(fileDir, thisAndSubDirsFilePath);
        dataFiles.push({
          filePath: thisAndSubDirsFilePath,
          exportModuleName: rel.startsWith('.') ? rel : `./${rel}`,
        });
      }
      possibleParent = path.dirname(possibleParent);
    }

    // Add `local.data.js` if available
    const thisDirFilePath = path.join(path.dirname(this.sourceFilePath), 'local.data.js');
    if (existsSync(thisDirFilePath)) {
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

    let contentWithoutRocketHeader = await this.getContentWithoutHeader();
    if (this.sourceFilePath.endsWith('.md')) {
      contentWithoutRocketHeader = getServerCodeFromMd(contentWithoutRocketHeader);
    }
    if (this.sourceFilePath.endsWith('.html')) {
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

    this.dataCascade = [
      ...[...usedImports.entries()].map(
        ([importModuleName, imports]) =>
          `import { ${imports.join(', ')} } from '${importModuleName}';`,
      ),
      ...exportsString,
    ];

    await this.save();
  }

  async getContentWithoutHeader() {
    const lines = (await this.getSourceFileContent()).split('\n');
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
      throw new Error(
        `No "/* END - Rocket auto generated - do not touch */" found in ${this.sourceFilePath}`,
      );
    }

    if (startIndex >= 0 && endIndex >= 0) {
      return [...lines.slice(0, startIndex), ...lines.slice(endIndex + 1)].join('\n');
    }
    return lines.join('\n');
  }

  async set() {
    const sourceRelativeFilePath = path.relative(this.inputDir, this.sourceFilePath);

    this.header = this.addLongFileHeaderComments(
      [
        '/* START - Rocket auto generated - do not touch */',
        `export const sourceRelativeFilePath = '${sourceRelativeFilePath}';`,
        ...this.dataCascade,
        ...this.componentDefinitions,
        '/* END - Rocket auto generated - do not touch */',
      ].join('\n'),
    );

    /** @type {string[]} */
    const lines = (await this.getSourceFileContent()).split('\n');
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
      throw new Error(
        `No "/* END - Rocket auto generated - do not touch */" found in ${this.sourceFilePath}`,
      );
    }

    if (startIndex >= 0 && endIndex >= 0) {
      lines.splice(startIndex, endIndex - startIndex + 1, this.header);
    } else {
      const extension = this.sourceFilePath.split('.').pop();

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

      lines.unshift([...wrapBefore, this.header, ...warpAfter, ''].join('\n'));
    }

    this.updatedSourceFileContent = lines.join('\n');

    return this.updatedSourceFileContent;
  }

  /**
   * @returns {Promise<{ needsAnotherRenderingPass: boolean }>}
   */
  async save() {
    if (!this.updatedSourceFileContent) {
      await this.set();
    }
    if (!this.updatedSourceFileContent) {
      return { needsAnotherRenderingPass: false }; // for TS 🤷‍♂️
    }

    const existing = await this.getSourceFileContent();
    const updated = this.updatedSourceFileContent;

    // console.log({ CHANGED: existing !== updated })
    if (existing !== updated) {
      // console.log({ existing, updated, CHANGED: existing !== updated, });
      await writeFile(this.sourceFilePath, updated);
      this.sourceFileContent = updated;
      return { needsAnotherRenderingPass: true };
    }
    return { needsAnotherRenderingPass: false };
  }

  /**
   * @param {string} fileHeader
   * @returns {string}
   */
  addLongFileHeaderComments(fileHeader) {
    const linesWithComments = [];
    if (this.longFileHeaderComment) {
      for (const line of fileHeader.split('\n')) {
        if (line.length > this.longFileHeaderWidth) {
          const prefix = line.startsWith('  ') ? '  ' : '';
          const comment = `${prefix}${this.longFileHeaderComment}`;
          // @ts-ignore
          if (linesWithComments.at(-1) !== comment) {
            // if line does not already have the comment then add it
            linesWithComments.push(`${prefix}${this.longFileHeaderComment}`);
          }
        }
        linesWithComments.push(line);
      }
      return linesWithComments.join('\n');
    }
    return fileHeader;
  }

  /**
   * @param {Object} options
   * @param {String} options.outputFileContent
   * @param {String} options.outputFilePath
   * @param {String} options.openGraphHtml
   * @param {ComponentStrings} options.componentStrings
   * @returns {Promise<{ needsAnotherRenderingPass: boolean }>}
   */
  async syncComponents(options) {
    try {
      return this._syncComponents(options);
    } catch (error) {
      // we tried to update the rocket header but something failed => user has to fix his code
      // error will be shown by the render worker
      return { needsAnotherRenderingPass: false };
    }
  }

  /**
   * @param {Object} options
   * @param {String} options.outputFileContent
   * @param {String} options.outputFilePath
   * @param {String} options.openGraphHtml
   * @param {ComponentStrings} options.componentStrings
   * @returns {Promise<{ needsAnotherRenderingPass: boolean }>}
   */
  async _syncComponents({ outputFileContent, outputFilePath, componentStrings, openGraphHtml }) {
    const componentsWithStrategy = getComponentsWithStrategy({
      outputFileContent,
      componentStrings,
    });
    if (openGraphHtml) {
      const openGraphComponentsWithStrategy = getComponentsWithStrategy({
        outputFileContent: openGraphHtml,
        componentStrings,
      });
      for (const [key, component] of Object.entries(openGraphComponentsWithStrategy)) {
        if (component.strategy === 'server' && !componentsWithStrategy[key]) {
          component.strategy = 'server-open-graph-only';
          componentsWithStrategy[key] = component;
        }
      }
    }

    const serverOnlyComponents = [];
    const serverOnlyOpenGraphOnlyComponents = [];
    const hydrateAbleComponents = [];
    const clientComponents = [];
    for (const [key, component] of Object.entries(componentsWithStrategy)) {
      const importParts = component.importString.trim().split('::');
      if (component.strategy === 'server') {
        serverOnlyComponents.push(
          `  customElements.define('${key}', await import('${importParts[0]}').then(m => m.${importParts[1]}));`,
        );
      }
      if (component.strategy === 'server-open-graph-only') {
        serverOnlyOpenGraphOnlyComponents.push(
          `  customElements.define('${key}', await import('${importParts[0]}').then(m => m.${importParts[1]}));`,
        );
      }
      if (component.strategy.startsWith('hydrate')) {
        hydrateAbleComponents.push(
          `  customElements.define('${key}', await import('${importParts[0]}').then(m => m.${importParts[1]}));`,
        );
      }
      if (component.strategy === 'client') {
        clientComponents.push(
          `  // '${key}': () => import('${importParts[0]}').then(m => m.${importParts[1]}),`,
        );
      }
    }
    if (serverOnlyComponents.length > 0) {
      serverOnlyComponents.unshift('  // server-only components');
    }
    if (serverOnlyOpenGraphOnlyComponents.length > 0) {
      serverOnlyOpenGraphOnlyComponents.unshift('  // server-only open-graph only components');
    }
    if (hydrateAbleComponents.length > 0) {
      hydrateAbleComponents.unshift('  // hydrate-able components');
    }
    if (clientComponents.length > 0) {
      clientComponents.unshift('  // client-only components');
    }

    if (
      serverOnlyComponents.length > 0 ||
      serverOnlyOpenGraphOnlyComponents.length > 0 ||
      hydrateAbleComponents.length > 0 ||
      clientComponents.length > 0
    ) {
      this.componentDefinitions = [
        'export async function registerCustomElements() {',
        ...serverOnlyComponents,
        ...serverOnlyOpenGraphOnlyComponents,
        ...hydrateAbleComponents,
        ...clientComponents,
        '}',
      ];
    } else {
      this.componentDefinitions = [];
    }

    await this.set();
    const result = await this.save();
    if (hydrateAbleComponents.length > 0 || clientComponents.length > 0) {
      this.needsLoader = true;
      await this.saveHydrationFile({ outputFilePath, componentsWithStrategy });
    } else {
      this.needsLoader = false;
    }
    return result;
  }

  /**
   * @param {Object} options
   * @param {String} options.outputFilePath
   * @param {ComponentsWithStrategy} options.componentsWithStrategy
   * @returns {Promise<void>}
   */
  async saveHydrationFile({ outputFilePath, componentsWithStrategy }) {
    if (Object.keys(componentsWithStrategy).length === 0) {
      return;
    }

    const hydrationFilePath = outputFilePath.replace('.html', '-loader-generated.js');
    const hydrateAbleComponents = [];
    const clientOnlyComponents = [];
    for (const [key, component] of Object.entries(componentsWithStrategy)) {
      const importParts = component.importString.split('::');
      if (component.strategy.startsWith('hydrate')) {
        hydrateAbleComponents.push(
          `  '${key}': () => import('${importParts[0]}').then(m => m.${importParts[1]}),`,
        );
      }
      if (component.strategy === 'client') {
        clientOnlyComponents.push(
          `customElements.define('${key}', await import('${importParts[0]}').then(m => m.${importParts[1]}));`,
        );
      }
    }

    if (clientOnlyComponents.length > 0) {
      clientOnlyComponents.unshift('await loader.setup();');
      clientOnlyComponents.unshift('// client-only components');
    }

    // TODO: optimize to not load full HydrationLoader if there are ONLY client-only components
    const hydrationFileContent = [
      "import { HydrationLoader } from '@rocket/engine/hydration';",
      '',
      'const hydrateAbleComponents = {',
      ...hydrateAbleComponents,
      '};',
      '',
      'const loader = new HydrationLoader(hydrateAbleComponents);',
      ...clientOnlyComponents,
      '',
      'window.__ROCKET_HYDRATION_LOADER__ = loader;',
      'await loader.init();',
    ].join('\n');

    await writeFile(hydrationFilePath, hydrationFileContent);
  }
}
