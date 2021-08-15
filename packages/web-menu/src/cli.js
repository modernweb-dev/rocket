#!/usr/bin/env node

import { existsSync } from 'fs';
import path from 'path';
import { WebMenuCli } from './WebMenuCli.js';

const cli = new WebMenuCli();

const cwd = process.cwd();
const configFiles = [
  'config/web-menu.js',
  'config/web-menu.mjs',
  'web-menu.config.js',
  'web-menu.config.mjs',
];

for (const configFile of configFiles) {
  const configFilePath = path.join(cwd, configFile);
  if (existsSync(configFilePath)) {
    cli.setOptions({
      configFile: configFilePath,
    });
    break;
  }
}

await cli.run();
