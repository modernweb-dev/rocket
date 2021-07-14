#!/usr/bin/env node

import { RocketCli } from './RocketCli.js';

const cli = new RocketCli();
cli.run();

process.on('unhandledRejection', up => {
  throw up;
});
