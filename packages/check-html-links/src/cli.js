#!/usr/bin/env node

import path from 'path';
import { checkHtmlLinks } from 'check-html-links';

async function cli() {
  const userRootDir = process.argv[2];
  const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();

  try {
    await checkHtmlLinks({ rootDir });
  } catch (error) {
    console.log('Check Html Links CLI failed to execute', error);
  }
}

cli();
