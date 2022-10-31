import { expect } from 'chai';
import path from 'path';
import { gatherFiles } from '../src/helpers/gatherFiles.js';

const currentDir = path.dirname(new URL(import.meta.url).pathname);
function cleanupFiles(files) {
  return files.map(file => (file ? `abs::${path.relative(currentDir, file)}` : file));
}

describe('gatherFiles', () => {
  it('01: current dir', async () => {
    const files = await gatherFiles(
      new URL('fixtures/02-gatherFiles/01-current-dir/', import.meta.url),
    );

    expect(cleanupFiles(files)).to.deep.equal([
      'abs::fixtures/02-gatherFiles/01-current-dir/a.html',
      'abs::fixtures/02-gatherFiles/01-current-dir/b.js',
      'abs::fixtures/02-gatherFiles/01-current-dir/c.html',
    ]);
  });

  it('02: sub dir goes files first', async () => {
    const files = await gatherFiles(
      new URL('fixtures/02-gatherFiles/02-sub-dir/', import.meta.url),
    );

    expect(cleanupFiles(files)).to.deep.equal([
      'abs::fixtures/02-gatherFiles/02-sub-dir/a.html',
      'abs::fixtures/02-gatherFiles/02-sub-dir/z.html',
      'abs::fixtures/02-gatherFiles/02-sub-dir/sub/b.html',
      'abs::fixtures/02-gatherFiles/02-sub-dir/sub/c.html',
      'abs::fixtures/02-gatherFiles/02-sub-dir/sub/some.js',
      'abs::fixtures/02-gatherFiles/02-sub-dir/sub2/d.html',
    ]);
  });

  it('03: index.html file always goes first', async () => {
    const files = await gatherFiles(
      new URL('fixtures/02-gatherFiles/03-index-first/', import.meta.url),
    );

    expect(cleanupFiles(files)).to.deep.equal([
      'abs::fixtures/02-gatherFiles/03-index-first/index.html',
      'abs::fixtures/02-gatherFiles/03-index-first/about.html',
    ]);
  });

  it('03b: index.html file always goes first with sub dirs', async () => {
    const files = await gatherFiles(
      new URL('fixtures/02-gatherFiles/03b-index-first-sub-dir/', import.meta.url),
    );

    expect(cleanupFiles(files)).to.deep.equal([
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/index.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/about.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/sub/index.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/sub/a.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/sub2/index.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/sub2/b.html',
      'abs::fixtures/02-gatherFiles/03b-index-first-sub-dir/sub2/z.html',
    ]);
  });
});
