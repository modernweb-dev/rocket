import chai from 'chai';
import path from 'path';
import { gatherFiles } from '../src/gatherFiles.js';

const { expect } = chai;

function cleanup(items, rootDir) {
  return items.map(item => path.relative(rootDir, item));
}

describe('gatherFiles', () => {
  it('puts index.js files always first', async () => {
    const folderPath = new URL('./fixtures/00-gather-files/01-single-dir/docs/', import.meta.url)
      .pathname;
    const files = await gatherFiles(folderPath);

    expect(cleanup(files, folderPath)).to.deep.equal([
      'index.rocket.js',
      '01--first.rocket.js',
      '02--second.rocket.js',
    ]);
  });

  it('puts index.js first when using sub directories', async () => {
    const folderPath = new URL('./fixtures/00-gather-files/02-sub-dir/docs/', import.meta.url)
      .pathname;
    const files = await gatherFiles(folderPath);

    expect(cleanup(files, folderPath)).to.deep.equal([
      'index.rocket.js',
      '01--first.rocket.js',
      '02--second.rocket.js',
      'about/index.rocket.js',
      'about/01--first.rocket.js',
      'about/02--second.rocket.js',
    ]);
  });

  it('puts index.js first when using a not ordered sub directories', async () => {
    const folderPath = new URL(
      './fixtures/00-gather-files/03-not-ordered-sub-dir/docs/',
      import.meta.url,
    ).pathname;
    const files = await gatherFiles(folderPath);

    expect(cleanup(files, folderPath)).to.deep.equal([
      'index.rocket.js',
      'about.rocket.js',
      'components/index.rocket.js',
      'components/tabs.rocket.js',
    ]);
  });
});
