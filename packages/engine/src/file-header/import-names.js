/**
 * Extracts all import names for an already parsed files
 *
 * @param {import('es-module-lexer').ImportSpecifier} imports
 * @param {string} source
 * @returns {string[]}
 */
export function importsToImportNames(imports, source) {
  const allImportNames = [];
  for (const singleImport of imports) {
    const importStatement = source.substring(singleImport.ss, singleImport.ee);
    const importNames = getImportNames(importStatement);
    allImportNames.push(...importNames);
  }
  return allImportNames;
}

/**
 * Extracts all import names from a full import statement
 *
 * import { html, css as litCss } from 'lit';
 * => ['html', 'litCss']
 *
 * @param {string} importStatement
 * @returns {string[]}
 */
export function getImportNames(importStatement) {
  /** @type string[] */
  const importNames = [];

  const singleLine = importStatement.trim().replace(/\n/g, '');
  const fromIndex = singleLine.indexOf('from');
  if (fromIndex >= 0) {
    const importPart = singleLine.substring(6, fromIndex);
    const cleanedImportPart = importPart.replace(/[{}]/g, '');
    const importStatementParts = cleanedImportPart
      .split(',')
      .map(el => el.trim())
      .filter(Boolean);

    for (const importName of importStatementParts) {
      if (importName.includes(' as ')) {
        importNames.push(importName.split(' as ')[1].trim());
      } else {
        importNames.push(importName);
      }
    }
    return importNames;
  }

  return importNames;
}
