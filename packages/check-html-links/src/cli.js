#!/usr/bin/env node

import path from 'path';
import chalk from 'chalk';
import { validateFiles } from './validateFolder.js';
import { formatErrors } from './formatErrors.js';
import { listFiles } from './listFiles.js';

async function main() {
  const userRootDir = process.argv[2];
  const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
  const performanceStart = process.hrtime();

  console.log('👀 Checking if all internal links work...');
  const files = await listFiles('**/*.html', rootDir);

  const filesOutput =
    files.length == 0
      ? '🧐 No files to check. Did you select the correct folder?'
      : `🔥 Found a total of ${chalk.green.bold(files.length)} files to check!`;
  console.log(filesOutput);

  const { errors, numberLinks } = await validateFiles(files, rootDir);

  console.log(`🔗 Found a total of ${chalk.green.bold(numberLinks)} links to validate!\n`);

  const performance = process.hrtime(performanceStart);
  if (errors.length > 0) {
    let referenceCount = 0;
    for (const error of errors) {
      referenceCount += error.usage.length;
    }
    const output = [
      `❌ Found ${chalk.red.bold(
        errors.length.toString(),
      )} missing reference targets (used by ${referenceCount} links) while checking ${
        files.length
      } files:`,
      ...formatErrors(errors)
        .split('\n')
        .map(line => `  ${line}`),
      `Checking links duration: ${performance[0]}s ${performance[1] / 1000000}ms`,
    ];
    console.error(output.join('\n'));
    process.exit(1);
  } else {
    console.log(
      `✅ All internal links are valid. (executed in %ds %dms)`,
      performance[0],
      performance[1] / 1000000,
    );
  }
}

main();
