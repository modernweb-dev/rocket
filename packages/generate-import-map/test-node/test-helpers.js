import path from 'path';
import { fileURLToPath } from 'url';

import { inspectFolder } from 'generate-import-map';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function execute(inPath) {
  const testDir = path.join(__dirname, inPath.split('/').join(path.sep));
  return await inspectFolder(testDir);
}
