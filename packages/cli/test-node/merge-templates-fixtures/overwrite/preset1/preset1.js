import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function preset1() {
  return {
    path: path.resolve(__dirname),
  };
}
