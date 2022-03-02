import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

// More info can be found here https://www.zachleat.com/web/screenshots/

describe('Open Graph', () => {
  it('generates an index.opengraph.html next to the output file', async () => {
    const { build, readOutput } = await setupTestEngine(
      'fixtures/11-open-graph/01-renders-open-graph-layouts/docs',
    );
    await build();

    expect(readOutput('index.opengraph.html')).to.equal('Open Graph Index');
  });

  it('02: creates the open graph file only for html output files', async () => {
    const { build, readOutput, outputExists } = await setupTestEngine(
      'fixtures/11-open-graph/02-formats/docs',
    );
    await build();

    expect(readOutput('index.opengraph.html')).to.equal(
      [
        'Open Graph:',
        '<h1 id="index">',
        '  <a aria-hidden="true" tabindex="-1" href="#index"><span class="icon icon-link"></span></a>Index',
        '</h1>',
      ].join('\n'),
    );
    expect(readOutput('404.opengraph.html')).to.equal('Open Graph: 404');
    expect(readOutput('about/index.opengraph.html')).to.equal('Open Graph: about');
    expect(readOutput('components/index.opengraph.html')).to.equal('Open Graph: components');
    expect(readOutput('components/accordion/index.opengraph.html')).to.equal(
      'Open Graph: accordion',
    );

    expect(outputExists('some.xml.opengraph.html')).to.be.false;
  });

  it('can access page tree meta data', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/11-open-graph/03-page-data/docs');
    await build();

    expect(readOutput('index.opengraph.html')).to.equal('Open Graph: Home Headline');

    expect(readOutput('index.html')).to.equal(
      [
        '<a',
        '  href="https://v1.screenshot.11ty.dev/http%3A%2F%2Flocalhost%3A8000%2Findex.opengraph.html/opengraph/"',
        '  >Open Graph</a',
        '>',
        '<main><h1>Home Headline</h1></main>',
      ].join('\n'),
    );
  });
});
