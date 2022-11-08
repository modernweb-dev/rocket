#!/usr/bin/env node

import { existsSync } from 'fs';
import path from 'path';
import { CheckWebsiteCli } from './CheckWebsiteCli.js';

const cli = new CheckWebsiteCli();

const cwd = process.cwd();
const configFiles = [
  path.join('config', 'check-website.config.js'),
  path.join('config', 'check-website.config.mjs'),
  'check-website.config.js',
  'check-website.config.mjs',
  path.join('..', 'config', 'check-website.config.js'),
  path.join('..', 'config', 'check-website.config.mjs'),
  path.join('..', 'check-website.config.js'),
  path.join('..', 'check-website.config.mjs'),
];

for (const configFile of configFiles) {
  const configFilePath = path.join(cwd, configFile);
  if (existsSync(configFilePath)) {
    cli.options.configFile = configFilePath;
    break;
  }
}

await cli.execute();
