import { readdir } from 'fs/promises';
import path from 'path';
import { slugify } from './slugify.js';

function isRocketIndexFile(fileName, fileEndings) {
  for (const ending of fileEndings) {
    if (fileName === `index${ending}`) {
      return true;
    }
  }
  return false;
}

/**
 * @typedef {object} gatherFilesOptions
 * @property {string[]} fileEndings
 **/

/**
 * @param {string | URL} inRootDir
 * @param {Partial<gatherFilesOptions>} [options]
 * @returns
 */
export async function gatherFiles(inRootDir, options = {}) {
  /** @type {gatherFilesOptions} */
  const activeOptions = {
    fileEndings: ['.rocket.js', '.rocket.md', '.rocket.html'],
    ...options,
  };

  const rootDir = inRootDir instanceof URL ? inRootDir.pathname : path.resolve(inRootDir);
  let files = [];

  const entries = await readdir(rootDir, { withFileTypes: true });

  const { fileEndings } = activeOptions;

  // for (const ending of fileEndings) {
  //   const fileNames = entries.map(entry => entry.name);
  //   if (fileNames.includes(`index${ending}`)) {
  //     const filePath = path.join(rootDir, `index${ending}`);
  //     files.push(filePath);
  //   }
  // }
  for (const entry of entries) {
    if (!entry.isDirectory() && isRocketIndexFile(entry.name, fileEndings)) {
      const filePath = path.join(rootDir, entry.name);
      files.push(filePath);
    }
  }

  for (const entry of entries) {
    const { name } = entry;
    const currentPath = path.join(rootDir, name);

    if (entry.isDirectory()) {
      // if (slugify(name) !== name.replace(/\./g, '')) {
      //   throw new Error(
      //     `Folder at "${currentPath}"" is using invalid characters. Use only url safe characters like [a-z][A-Z]-_. Name Suggestion: ${slugify(name)}`,
      //   );
      // }
      files = [...files, ...(await gatherFiles(currentPath, options))];
    } else if (fileEndings.some(ending => name.endsWith(ending))) {
      // if (slugify(name) !== name.replace(/\./g, '')) {
      //   throw new Error(
      //     `File at "${currentPath}" is using invalid characters. Use only url safe characters like [a-z][A-Z]-_`,
      //   );
      // }
      if (!isRocketIndexFile(name, fileEndings)) {
        const filePath = path.join(rootDir, name);
        files.push(filePath);
      }
    }
  }
  return files;
}
