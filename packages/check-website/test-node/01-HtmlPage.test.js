import chai from 'chai';
import path from 'path';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';

import { HtmlPage, ASSET_STATUS, AssetManager } from 'check-website';
import { fileURLToPath } from 'url';

class FakeReadable extends Readable {
  _read() {
    // noop
  }
}

class MockedFetch {
  constructor({ content = '' } = {}) {
    this.stream = new FakeReadable();
    this._content = content;
  }

  get fetch() {
    setTimeout(async () => {
      this.stream.push(this._content);
      this.stream.emit('end');
    }, 1);
    return () => Promise.resolve({ ok: true, body: this.stream });
  }

  push(chunk) {
    return this.stream.push(chunk);
  }
}

const { expect } = chai;

const currentDir = path.dirname(new URL(import.meta.url).pathname);

function cleanup(page) {
  const keep = {};
  keep.localPath = page.localPath
    ? `abs::${path.relative(currentDir, page.localPath)}`
    : page.localPath;
  keep.localSourcePath = page.localSourcePath
    ? `abs::${path.relative(currentDir, page.localSourcePath)}`
    : page.localSourcePath;

  keep.hashes = page.hashes;
  keep.references = page.references.map(ref => ({
    url: ref.url,
    attribute: ref.attribute,
    tag: ref.tag,
    value: ref.value,
  }));
  keep.url = page.url;
  return keep;
}

function withTestOptions(options) {
  return {
    originUrl: 'https://example.com/',
    originPath: new URL('.', import.meta.url).pathname,
    assetManager: new AssetManager(),
    ...options,
  };
}

describe('HtmlPage', () => {
  it('01: hashes', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/01-hashes.html'),
      withTestOptions({
        localPath: fileURLToPath(new URL('fixtures/01-HtmlPage/01-hashes.html', import.meta.url)),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/01-hashes.html'),
      localPath: 'abs::fixtures/01-HtmlPage/01-hashes.html',
      localSourcePath: '',
      hashes: ['first', 'second', 'third'],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          value: '#',
          url: 'https://example.com/fixtures/01-HtmlPage/01-hashes.html#',
        },
      ],
    });
  });

  it.skip('01a: fetch it as an external url', async () => {
    const mocked = new MockedFetch({
      content: await readFile(new URL('fixtures/01-HtmlPage/01-hashes.html', import.meta.url)),
    });
    const page = new HtmlPage(
      new URL('https://is.mocked.com/'),
      withTestOptions({
        fetch: mocked.fetch,
      }),
    );
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://is.mocked.com/'),
      localPath: '',
      localSourcePath: '',
      hashes: ['first', 'second', 'third'],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          value: '#',
          url: 'https://is.mocked.com/#',
        },
      ],
    });
  });

  it('02: internal link', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/02-internal-link.html'),
      withTestOptions({
        localPath: fileURLToPath(
          new URL('fixtures/01-HtmlPage/02-internal-link.html', import.meta.url),
        ),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/02-internal-link.html'),
      localPath: 'abs::fixtures/01-HtmlPage/02-internal-link.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          url: 'https://example.com/index.html',
          value: '/index.html',
        },
        {
          attribute: 'href',
          tag: 'a',
          url: 'https://example.com/fixtures/01-HtmlPage/index.html',
          value: './index.html',
        },
        {
          attribute: 'href',
          tag: 'a',
          url: 'https://example.com/fixtures/01-HtmlPage/index.html#first-headline',
          value: './index.html#first-headline',
        },
        {
          attribute: 'href',
          tag: 'a',
          url: 'https://example.com/fixtures/01-HtmlPage/index.html?data=in&query=params',
          value: './index.html?data=in&query=params',
        },
      ],
    });
  });

  it('03: images', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/03-images.html'),
      withTestOptions({
        localPath: fileURLToPath(new URL('fixtures/01-HtmlPage/03-images.html', import.meta.url)),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/03-images.html'),
      localPath: 'abs::fixtures/01-HtmlPage/03-images.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'src',
          tag: 'img',
          url: 'https://example.com/empty.png',
          value: '/empty.png',
        },
        {
          attribute: 'src',
          tag: 'img',
          url: 'https://example.com/fixtures/01-HtmlPage/empty.png',
          value: './empty.png',
        },
        {
          attribute: 'src',
          tag: 'img',
          url: 'https://example.com/fixtures/01-HtmlPage/empty.png?data=in&query=params',
          value: './empty.png?data=in&query=params',
        },
      ],
    });
  });

  it('04: picture with srcset', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/04-picture-srcset.html'),
      withTestOptions({
        localPath: fileURLToPath(
          new URL('fixtures/01-HtmlPage/04-picture-srcset.html', import.meta.url),
        ),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/04-picture-srcset.html'),
      localPath: 'abs::fixtures/01-HtmlPage/04-picture-srcset.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'src',
          tag: 'img',
          url: 'https://example.com/images/empty.png',
          value: '/images/empty.png',
        },
        {
          attribute: 'srcset',
          tag: 'source',
          url: 'https://example.com/images/empty-300.png',
          value: '/images/empty-300.png 300w, /images/empty-600.png?data=in&query=params 600w',
        },
        {
          attribute: 'srcset',
          tag: 'source',
          url: 'https://example.com/images/empty-600.png?data=in&query=params',
          value: '/images/empty-300.png 300w, /images/empty-600.png?data=in&query=params 600w',
        },
        {
          attribute: 'src',
          tag: 'img',
          url: 'https://example.com/images/missing.png',
          value: '/images/missing.png',
        },
        {
          attribute: 'srcset',
          tag: 'source',
          url: 'https://example.com/images/missing-300.png',
          value: '/images/missing-300.png 300w, /images/missing-600.png 600w',
        },
        {
          attribute: 'srcset',
          tag: 'source',
          url: 'https://example.com/images/missing-600.png',
          value: '/images/missing-300.png 300w, /images/missing-600.png 600w',
        },
      ],
    });
  });

  it('05: mailto', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/05-mailto.html'),
      withTestOptions({
        localPath: fileURLToPath(new URL('fixtures/01-HtmlPage/05-mailto.html', import.meta.url)),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/05-mailto.html'),
      localPath: 'abs::fixtures/01-HtmlPage/05-mailto.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          url: 'mailto:foo@bar.com',
          value: 'mailto:foo@bar.com',
        },
        {
          attribute: 'href',
          tag: 'a',
          url: '&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;',
          value:
            '&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;',
        },
      ],
    });
  });

  it('06: not http schema', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/06-not-http-schema.html'),
      withTestOptions({
        localPath: fileURLToPath(
          new URL('fixtures/01-HtmlPage/06-not-http-schema.html', import.meta.url),
        ),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/06-not-http-schema.html'),
      localPath: 'abs::fixtures/01-HtmlPage/06-not-http-schema.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          url: 'sketch://add-library?url=https%3A%2F%2Fmyexample.com%2Fdesign%2Fui-kit.xml',
          value: 'sketch://add-library?url=https%3A%2F%2Fmyexample.com%2Fdesign%2Fui-kit.xml',
        },
        {
          attribute: 'href',
          tag: 'a',
          url: 'vscode://file/c:/myProject/package.json:5:10',
          value: 'vscode://file/c:/myProject/package.json:5:10',
        },
      ],
    });
  });

  it('07: tel', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/07-tel.html'),
      withTestOptions({
        localPath: fileURLToPath(new URL('fixtures/01-HtmlPage/07-tel.html', import.meta.url)),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/07-tel.html'),
      localPath: 'abs::fixtures/01-HtmlPage/07-tel.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          url: 'tel:99999',
          value: 'tel:99999',
        },
      ],
    });
  });

  it('08: ignore about schema', async () => {
    const page = new HtmlPage(
      new URL('https://example.com/fixtures/01-HtmlPage/08-ignore-about-schema.html'),
      withTestOptions({
        localPath: fileURLToPath(
          new URL('fixtures/01-HtmlPage/08-ignore-about-schema.html', import.meta.url),
        ),
      }),
    );
    page.status = ASSET_STATUS.existsLocal;
    await page.parse();

    expect(cleanup(page)).to.deep.equal({
      url: new URL('https://example.com/fixtures/01-HtmlPage/08-ignore-about-schema.html'),
      localPath: 'abs::fixtures/01-HtmlPage/08-ignore-about-schema.html',
      localSourcePath: '',
      hashes: [],
      references: [
        {
          attribute: 'href',
          tag: 'a',
          url: 'about:dino',
          value: 'about:dino',
        },
      ],
    });
  });
});
