import chai from 'chai';
import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Open Graph', () => {
  it('generates the image and adds the meta tags', async () => {
    const { build, readOutput, outputExists } = await setupTestCli({
      cwd: 'fixtures/04-open-graph/01-generate-image-and-inject-meta',
      options: {
        buildOptimize: true,
      },
      testOptions: { captureLogs: true },
    });
    await build();

    expect(readOutput('index.html', { replaceImageHashes: true })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta property="og:image:width" content="2400" />',
        '    <meta property="og:image:height" content="1256" />',
        '    <meta property="og:image" content="http://my-site.com/__HASH__.png" />',
        '  </head>',
        '  <body>',
        '    <h1>Hello World!</h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(outputExists('./index.opengraph.html')).to.be.false;
  });

  it('handles multiple pages', async () => {
    const { build, readOutput } = await setupTestCli({
      cwd: 'fixtures/04-open-graph/02-multiple-pages',
      options: {
        buildOptimize: true,
      },
      testOptions: { captureLogs: true },
    });
    await build();

    expect(readOutput('index.html', { replaceImageHashes: true })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta property="og:image:width" content="2400" />',
        '    <meta property="og:image:height" content="1256" />',
        '    <meta property="og:image" content="http://my-site.com/__HASH__.png" />',
        '  </head>',
        '  <body>',
        '    <h1>Hello World!</h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('components/index.html', { replaceImageHashes: true })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta property="og:image:width" content="2400" />',
        '    <meta property="og:image:height" content="1256" />',
        '    <meta property="og:image" content="http://my-site.com/__HASH__.png" />',
        '  </head>',
        '  <body>',
        '    <h1>Components</h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('components/accordion/index.html', { replaceImageHashes: true })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta property="og:image:width" content="2400" />',
        '    <meta property="og:image:height" content="1256" />',
        '    <meta property="og:image" content="http://my-site.com/__HASH__.png" />',
        '  </head>',
        '  <body>',
        '    <h1>Accordion</h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    // This image is "wrong" as it does not output the page title as the page is not added to the page tree
    expect(readOutput('components/special.html', { replaceImageHashes: true })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta property="og:image:width" content="2400" />',
        '    <meta property="og:image:height" content="1256" />',
        '    <meta property="og:image" content="http://my-site.com/__HASH__.png" />',
        '  </head>',
        '  <body>',
        '    <h1>Special</h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });
});
