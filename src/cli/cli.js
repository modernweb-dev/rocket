#!/usr/bin/env node

import { RocketCli } from './RocketCli.js';

const cli = new RocketCli();

await cli.start();
