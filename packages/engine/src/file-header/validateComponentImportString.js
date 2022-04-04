const regexOnlyBareImport = /^[a-z|@|/|#].*/;

/**
 * @param {string} importString
 * @returns {Boolean}
 */
export function validateComponentImportString(importString) {
  if (typeof importString === 'string' && importString.match(regexOnlyBareImport)) {
    return true;
  }
  return false;
}
