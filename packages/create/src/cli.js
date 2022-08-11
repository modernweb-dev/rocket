#!/usr/bin/env node

import { CreateCli } from './CreateCli.js';

const cli = new CreateCli();
await cli.start();
