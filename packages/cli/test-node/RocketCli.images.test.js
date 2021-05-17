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
      const indexHtml = await readStartOutput(cli, 'index.html', { formatHtml: true });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <figure>',
          '    <picture>',
          '      <source',
          '        type="image/avif"',
          '        srcset="/images/d67643ad-600.avif 600w, /images/d67643ad-900.avif 900w"',
          '        sizes="100vw"',
          '      />',
          '      <source',
          '        type="image/jpeg"',
          '        srcset="/images/d67643ad-600.jpeg 600w, /images/d67643ad-900.jpeg 900w"',
          '        sizes="100vw"',
          '      />',
          '      <img',
          '        alt="My Image Alternative Text"',
          '        rocket-image="responsive"',
          '        src="/images/d67643ad-600.jpeg"',
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
    });

    it('renders multiple images in the correct order', async () => {
      cli = await executeStart('e2e-fixtures/images/rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'two-images/index.html', { formatHtml: true });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/d67643ad-600.avif 600w, /images/d67643ad-900.avif 900w"',
          '      sizes="100vw"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/d67643ad-600.jpeg 600w, /images/d67643ad-900.jpeg 900w"',
          '      sizes="100vw"',
          '    />',
          '    <img',
          '      alt="one"',
          '      rocket-image="responsive"',
          '      src="/images/d67643ad-600.jpeg"',
          '      width="600"',
          '      height="316"',
          '      loading="lazy"',
          '      decoding="async"',
          '    />',
          '  </picture>',
          '',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/d67643ad-600.avif 600w, /images/d67643ad-900.avif 900w"',
          '      sizes="100vw"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/d67643ad-600.jpeg 600w, /images/d67643ad-900.jpeg 900w"',
          '      sizes="100vw"',
          '    />',
          '    <img',
          '      alt="two"',
          '      rocket-image="responsive"',
          '      src="/images/d67643ad-600.jpeg"',
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
      const indexHtml = await readStartOutput(cli, 'index.html', { formatHtml: true });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <figure>',
          '    <picture>',
          '      <source',
          '        type="image/avif"',
          '        srcset="/images/d67643ad-30.avif 30w, /images/d67643ad-60.avif 60w"',
          '        sizes="(min-width: 1024px) 30px, 60px"',
          '      />',
          '      <source',
          '        type="image/jpeg"',
          '        srcset="/images/d67643ad-30.jpeg 30w, /images/d67643ad-60.jpeg 60w"',
          '        sizes="(min-width: 1024px) 30px, 60px"',
          '      />',
          '      <img',
          '        alt="My Image Alternative Text"',
          '        rocket-image="responsive"',
          '        src="/images/d67643ad-30.jpeg"',
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
      const indexHtml = await readStartOutput(cli, 'no-title/index.html', { formatHtml: true });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <picture>',
          '    <source',
          '      type="image/avif"',
          '      srcset="/images/d67643ad-30.avif 30w, /images/d67643ad-60.avif 60w"',
          '      sizes="(min-width: 1024px) 30px, 60px"',
          '    />',
          '    <source',
          '      type="image/jpeg"',
          '      srcset="/images/d67643ad-30.jpeg 30w, /images/d67643ad-60.jpeg 60w"',
          '      sizes="(min-width: 1024px) 30px, 60px"',
          '    />',
          '    <img',
          '      alt="My Image Alternative Text"',
          '      rocket-image="responsive"',
          '      src="/images/d67643ad-30.jpeg"',
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
      const indexHtml = await readStartOutput(cli, 'no-title/index.html', { formatHtml: true });
      expect(indexHtml).to.equal(
        [
          '<p>',
          '  <img',
          '    alt="My Image Alternative Text"',
          '    rocket-image="responsive"',
          '    src="/images/d67643ad-30.jpeg"',
          '    srcset="/images/d67643ad-30.jpeg 30w, /images/d67643ad-60.jpeg 60w"',
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
