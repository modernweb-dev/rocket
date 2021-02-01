import path from 'path';
import { fileURLToPath } from 'url';

import { validateFolder } from 'check-html-links';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function execute(inPath, opts) {
  const testDir = path.join(__dirname, inPath.split('/').join(path.sep));
  const errors = await validateFolder(testDir, opts);
  return {
    cleanup: items => {
      const newItems = [];
      for (const item of items) {
        newItems.push({
          ...item,
          filePath: path.relative(__dirname, item.filePath),
          usage: item.usage.map(usageObj => ({
            ...usageObj,
            file: path.relative(__dirname, usageObj.file),
          })),
        });
      }
      return newItems;
    },
    errors,
  };
}
