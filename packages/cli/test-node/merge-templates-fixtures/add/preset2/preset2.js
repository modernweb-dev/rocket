import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function preset2() {
  return {
    path: path.resolve(__dirname),
  };
}
