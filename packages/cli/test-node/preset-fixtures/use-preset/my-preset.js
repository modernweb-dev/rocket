import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function myPreset() {
  return {
    path: path.resolve(__dirname),
    adjustImagePresets: imagePresets => ({
      ...imagePresets,
      responsive: {
        ...imagePresets.responsive,
        widths: [30, 60],
        formats: ['jpeg'],
        sizes: '30px',
      },
    }),
  };
}
