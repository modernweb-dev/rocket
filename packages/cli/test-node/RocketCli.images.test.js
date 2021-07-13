import chai from 'chai';
import chalk from 'chalk';
import { executeStart, readStartOutput, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli images', () => {
  let cli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
  });

  describe('Images', () => {
    it('does render content images responsive', async () => {
      cli = await executeStart('e2e-fixtures/images/rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <figure>',
          '    <picture>',
          '      <source',
          '        type="image/avif"',
          '        srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w"',
          '        sizes="100vw"',
          '      />',
          '      <source',
          '        type="image/jpeg"',
          '        srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w"',
          '        sizes="100vw"',
          '      />',
          '      <img',
          '        alt="My Image Alternative Text"',
          '        rocket-image="responsive"',
          '        src="/images/__HASH__-600.jpeg"',
          '        width="600"',
          '        height="316"',
          '        loading="lazy"',
          '        decoding="async"',
          '      />',
          '    </picture>',
          '    <figcaption>My Image Description</figcaption>',
          '  </figure>',
          '</p>',
        ].join('\n'),
      );

      const keepSvgHtml = await readStartOutput(cli, 'ignores/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });

      // ignores src="[...].svg" and src="[...]rocket-unresponsive.[...]"
      expect(keepSvgHtml).to.equal(
        [
          '<p>Ignore SVG</p>',
          '<p><img src="../_assets/logo.svg" alt="Logo stays svg" rocket-image="responsive" /></p>',
          '<p>Ignore if contains <code>rocket-unresponsive.</code></p>',
          '<p>',
          '  <img',
          '    src="../_assets/my-image.rocket-unresponsive.jpg"',
          '    alt="Logo stays svg"',
          '    rocket-image="responsive"',
          '  />',
          '</p>',
          '<p>Responsive</p>',
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w"',
          '      sizes="100vw"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w"',
          '      sizes="100vw"',
          '    />',
          '    <img',
          '      alt="My Image Alternative Text"',
          '      rocket-image="responsive"',
          '      src="/images/__HASH__-600.jpeg"',
          '      width="600"',
          '      height="316"',
          '      loading="lazy"',
          '      decoding="async"',
          '    />',
          '  </picture>',
          '</p>',
        ].join('\n'),
      );

      const tableHtml = await readStartOutput(cli, 'table/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(tableHtml).to.equal(
        [
          '<table>',
          '  <thead>',
          '    <tr>',
          '      <th>Image</th>',
          '    </tr>',
          '  </thead>',
          '  <tbody>',
          '    <tr>',
          '      <td>',
          '        <figure>',
          '          <picture>',
          '            <source',
          '              type="image/avif"',
          '              srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w"',
          '              sizes="100vw"',
          '            />',
          '            <source',
          '              type="image/jpeg"',
          '              srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w"',
          '              sizes="100vw"',
          '            />',
          '            <img',
          '              alt="My Image Alternative Text"',
          '              rocket-image="responsive"',
          '              src="/images/__HASH__-600.jpeg"',
          '              width="600"',
          '              height="316"',
          '              loading="lazy"',
          '              decoding="async"',
          '            />',
          '          </picture>',
          '          <figcaption>My Image Description</figcaption>',
          '        </figure>',
          '      </td>',
          '    </tr>',
          '  </tbody>',
          '</table>',
        ].join('\n'),
      );
    });

    it('can configure more patterns to ignore', async () => {
      cli = await executeStart('e2e-fixtures/images/ignore-more.rocket.config.js');
      const keepSvgHtml = await readStartOutput(cli, 'ignores/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });

      // ignores src="[...].svg" and src="[...]rocket-unresponsive.[...]"
      expect(keepSvgHtml).to.equal(
        [
          '<p>Ignore SVG</p>',
          '<p><img src="../_assets/logo.svg" alt="Logo stays svg" rocket-image="responsive" /></p>',
          '<p>Ignore if contains <code>rocket-unresponsive.</code></p>',
          '<p>',
          '  <img',
          '    src="../_assets/my-image.rocket-unresponsive.jpg"',
          '    alt="Logo stays svg"',
          '    rocket-image="responsive"',
          '  />',
          '</p>',
          '<p>Responsive</p>',
          '<p>',
          '  <img src="../_assets/my-image.jpeg" alt="My Image Alternative Text" rocket-image="responsive" />',
          '</p>',
        ].join('\n'),
      );
    });

    it('renders multiple images in the correct order', async () => {
      cli = await executeStart('e2e-fixtures/images/rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'two-images/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(indexHtml).to.equal(
        [
          '<h2 id="one">',
          '  <a aria-hidden="true" tabindex="-1" href="#one"><span class="icon icon-link"></span></a>one',
          '</h2>',
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w"',
          '      sizes="100vw"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w"',
          '      sizes="100vw"',
          '    />',
          '    <img',
          '      alt="one"',
          '      rocket-image="responsive"',
          '      src="/images/__HASH__-600.jpeg"',
          '      width="600"',
          '      height="316"',
          '      loading="lazy"',
          '      decoding="async"',
          '    />',
          '  </picture>',
          '</p>',
          '<h2 id="two">',
          '  <a aria-hidden="true" tabindex="-1" href="#two"><span class="icon icon-link"></span></a>two',
          '</h2>',
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w"',
          '      sizes="100vw"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w"',
          '      sizes="100vw"',
          '    />',
          '    <img',
          '      alt="two"',
          '      rocket-image="responsive"',
          '      src="/images/__HASH__-600.jpeg"',
          '      width="600"',
          '      height="316"',
          '      loading="lazy"',
          '      decoding="async"',
          '    />',
          '  </picture>',
          '</p>',
        ].join('\n'),
      );
    });

    it('can configure those responsive images', async () => {
      cli = await executeStart('e2e-fixtures/images/small.rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <figure>',
          '    <picture>',
          '      <source',
          '        type="image/avif"',
          '        srcset="/images/__HASH__-30.avif 30w, /images/__HASH__-60.avif 60w"',
          '        sizes="(min-width: 1024px) 30px, 60px"',
          '      />',
          '      <source',
          '        type="image/jpeg"',
          '        srcset="/images/__HASH__-30.jpeg 30w, /images/__HASH__-60.jpeg 60w"',
          '        sizes="(min-width: 1024px) 30px, 60px"',
          '      />',
          '      <img',
          '        alt="My Image Alternative Text"',
          '        rocket-image="responsive"',
          '        src="/images/__HASH__-30.jpeg"',
          '        width="30"',
          '        height="15"',
          '        loading="lazy"',
          '        decoding="async"',
          '      />',
          '    </picture>',
          '    <figcaption>My Image Description</figcaption>',
          '  </figure>',
          '</p>',
        ].join('\n'),
      );
    });

    it('will only render a figure & figcaption if there is a caption/title', async () => {
      cli = await executeStart('e2e-fixtures/images/small.rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'no-title/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/__HASH__-30.avif 30w, /images/__HASH__-60.avif 60w"',
          '      sizes="(min-width: 1024px) 30px, 60px"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/__HASH__-30.jpeg 30w, /images/__HASH__-60.jpeg 60w"',
          '      sizes="(min-width: 1024px) 30px, 60px"',
          '    />',
          '    <img',
          '      alt="My Image Alternative Text"',
          '      rocket-image="responsive"',
          '      src="/images/__HASH__-30.jpeg"',
          '      width="30"',
          '      height="15"',
          '      loading="lazy"',
          '      decoding="async"',
          '    />',
          '  </picture>',
          '</p>',
        ].join('\n'),
      );
    });

    it('will render an img with srcset and sizes if there is only one image format', async () => {
      cli = await executeStart('e2e-fixtures/images/single-format.rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'no-title/index.html', {
        formatHtml: true,
        replaceImageHashes: true,
      });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <img',
          '    alt="My Image Alternative Text"',
          '    rocket-image="responsive"',
          '    src="/images/__HASH__-30.jpeg"',
          '    srcset="/images/__HASH__-30.jpeg 30w, /images/__HASH__-60.jpeg 60w"',
          '    sizes="(min-width: 1024px) 30px, 60px"',
          '    width="30"',
          '    height="15"',
          '    loading="lazy"',
          '    decoding="async"',
          '  />',
          '</p>',
        ].join('\n'),
      );
    });
  });
});
