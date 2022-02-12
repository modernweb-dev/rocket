#!/usr/bin/env node

import { existsSync } from 'fs';
import path from 'path';
import { RocketCli } from './RocketCli.js';

const cli = new RocketCli();

const cwd = process.cwd();
const configFiles = [
  'config/rocket.config.js',
  'config/rocket.config.mjs',
  'rocket.config.js',
  'rocket.config.mjs',
];

for (const configFile of configFiles) {
  const configFilePath = path.join(cwd, configFile);
  if (existsSync(configFilePath)) {
    cli.options.configFile = configFilePath;
    // cli.setOptions({
    //   configFile: configFilePath,
    // });
    break;
  }
}

await cli.start();
