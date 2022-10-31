import { readdir } from 'fs/promises';
import path from 'path';

/**
 * @param {string} fileName
 * @returns {boolean}
 */
function isIndexFile(fileName) {
  return fileName === 'index.html';
}

/**
 * @param {string | URL} inRootDir
 * @returns {Promise<string[]>}
 */
export async function gatherFiles(inRootDir) {
  const rootDir = inRootDir instanceof URL ? inRootDir.pathname : path.resolve(inRootDir);
  let files = [];

  const entries = await readdir(rootDir, { withFileTypes: true });

  // 1. handle possible index.html file
  for (const entry of entries) {
    if (!entry.isDirectory() && isIndexFile(entry.name)) {
      files.push(path.join(rootDir, entry.name));
    }
  }
  // 2. handle other html files
  for (const entry of entries) {
    const { name } = entry;
    if (entry.isFile() && !isIndexFile(name)) {
      const filePath = path.join(rootDir, name);
      files.push(filePath);
    }
  }
  // 3. handle sub directories
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const currentPath = path.join(rootDir, entry.name);
      files.push(...(await gatherFiles(currentPath)));
    }
  }

  return files;
}
