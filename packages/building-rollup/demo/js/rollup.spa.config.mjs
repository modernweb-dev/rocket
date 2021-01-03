import path from 'path';
import { fileURLToPath } from 'url';
import { createSpaConfig } from '../../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = createSpaConfig({
  developmentMode: false,
  input: path.join(__dirname, 'index.html'),
  output: { 
    dir: path.join(__dirname, '..', '..', 'dist'),
  } 
});

export default config;
