#!/usr/bin/env node

import path from 'path';
import chalk from 'chalk';
import { extractBareImports } from './inspectFolder.js';
import { checkRemoteSpecifiers, createImportMap } from './createImportMap.js';
import { listFiles } from './listFiles.js';

async function main() {
  const userRootDir = process.argv[2];
  const userImportMapDist = process.argv[3];
  const remoteUrl = process.argv[4];
  const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
  const importMapDist = userImportMapDist
    ? path.resolve(userImportMapDist)
    : `${process.cwd()}/import-map.json`;

  const performanceInspectStart = process.hrtime();

  console.log('👀 Looking for all imports...');
  const files = await listFiles('**/*.html', rootDir);

  const filesOutput =
    files.length == 0
      ? '🧐 No files to check. Did you select the correct folder?'
      : `🔥 Found a total of ${chalk.green.bold(files.length)} files to check!`;
  console.log(filesOutput);

  const { localSpecifiers, bareSpecifiers } = await extractBareImports(files, rootDir);
  const performanceInspectEnd = process.hrtime(performanceInspectStart);

  console.log(
    `🔗 Found a total of ${chalk.green.bold(
      localSpecifiers.length,
    )} local imports and ${chalk.green.bold(bareSpecifiers.length)} bare imports!`,
  );
  console.log(
    `✅ Files inspected. (executed in %ds %dms)`,
    performanceInspectEnd[0],
    performanceInspectEnd[1] / 1000000,
  );

  const performanceRemoteStart = process.hrtime();
  const foundBareSpecifiers = await checkRemoteSpecifiers(bareSpecifiers, remoteUrl);
  createImportMap(foundBareSpecifiers, remoteUrl, importMapDist);
  const performanceRemoteEnd = process.hrtime(performanceRemoteStart);
  console.log(
    `✅ Remote CDN check and import map created. (executed in %ds %dms)`,
    performanceRemoteEnd[0],
    performanceRemoteEnd[1] / 1000000,
  );
}

main();
