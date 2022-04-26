import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const folders = await readdir('../../examples');

const examplesDir = new URL('../../../examples', import.meta.url).pathname;

const choices = [];
for (const folderName of folders) {
  const info = await readFile(path.join(examplesDir, folderName, 'package.json')).then(res =>
    JSON.parse(res),
  );
  if (info['@rocket/template-name']) {
    choices.push({
      title: info['@rocket/template-name'],
      description: info.description,
      value: folderName,
    });
  }
}

choices.push({
  title: 'Custom (community built)',
  description: 'Use a community built template by providing a git url',
  value: '--custom--',
});

await writeFile(new URL('../src/choices.json', import.meta.url), JSON.stringify(choices, null, 2));
