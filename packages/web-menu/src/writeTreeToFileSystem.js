import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

/** @typedef {import('../types/main').Page} Page */
/** @typedef {import('tree-model/types').Node<Page>} NodeOfPage */

/**
 * @param {NodeOfPage} tree
 * @param {string} outputDir
 */
export async function writeTreeToFileSystem(tree, outputDir) {
  for (const node of tree.all()) {
    const filePath = join(outputDir, node.model.relPath);
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(filePath, node.model.fileString);
  }
}
