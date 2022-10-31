import { expect }  from 'chai';
import { HtmlPage, AssetManager } from '../src/index.js';

const testOptions = {
  originUrl: 'https://example.com/',
  originPath: new URL('.', import.meta.url).pathname,
};

describe('Asset', () => {
  it('01: add local file via file url exists', async () => {
    const assets = new AssetManager(testOptions);
    const asset = assets.addExistingFile(new URL('fixtures/01-AssetManager/file.txt', import.meta.url));
    expect(await asset.exists()).to.be.true;
  });

  it('01b: local file via http url exists if added before', async () => {
    const assets = new AssetManager(testOptions);
    assets.addExistingFile(new URL('fixtures/01-AssetManager/file.txt', import.meta.url));
    const asset = assets.addUrl(new URL('https://example.com/fixtures/01-AssetManager/file.txt'));
    expect(await asset.exists()).to.be.true;
  });

  it('01c: local file missing', async () => {
    const assets = new AssetManager(testOptions);
    const asset = assets.addUrl(new URL('https://example.com/fixtures/01-AssetManager/missing.txt'));
    expect(await asset.exists()).to.be.false;
  });

  it('01d: local html page exists', async () => {
    const assets = new AssetManager(testOptions);
    const page = assets.addExistingFile(new URL('fixtures/01-AssetManager/page.html', import.meta.url));
    expect(page).to.be.an.instanceOf(HtmlPage);
    expect(await page.exists()).to.be.true;
  });

  it('02: external file exists', async () => {
    const assets = new AssetManager(testOptions);
    const asset = assets.addUrl(new URL('https://rocket.modern-web.dev/favicon.ico'));
    expect(await asset.exists()).to.be.true;
  });

  it('03: adds assets while parsing local pages', async () => {
    const assets = new AssetManager(testOptions);
    const page = assets.addExistingFile(new URL('fixtures/01-AssetManager/page.html', import.meta.url));
    await page.parse();
    expect(assets.size).to.equal(2);
  });
});
