import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine Urls', () => {
  it('creates urls based on filename heuristics', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/02-urls/01-filename-to-url/docs');
    await build();

    expect(readOutput('index.html')).to.equal('index');
    expect(readOutput('about/index.html')).to.equal('about');
    expect(readOutput('sitemap.xml')).to.equal('<xml>sitemap</xml>');
    expect(readOutput('components/index.html')).to.equal('components/index');
    expect(readOutput('components/tabs/index.html')).to.equal('components/tabs');
    expect(readOutput('components/accordion/index.html')).to.equal('components/accordion');
    expect(readOutput('discover/index.html')).to.equal('discover/index');
    expect(readOutput('assets/data.json')).to.equal('{ "components": ["tabs", "accordion"] }');
    expect(readOutput('assets/script.js')).to.equal("const value = 'test';");
  });

  it('links within markdown files are correct', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/02-urls/02-markdown-links/docs');
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<h1 id="index">',
        '  <a aria-hidden="true" tabindex="-1" href="#index"><span class="icon icon-link"></span></a>Index',
        '</h1>',
        '<ul>',
        '  <li><a href="/components/">Components</a></li>',
        '  <li><a href="/components/accordion/">Accordion</a></li>',
        '</ul>',
      ].join('\n'),
    );

    expect(readOutput('components/index.html')).to.equal(
      [
        '<h1 id="components">',
        '  <a aria-hidden="true" tabindex="-1" href="#components"><span class="icon icon-link"></span></a',
        '  >Components',
        '</h1>',
        '<ul>',
        '  <li><a href="/components/accordion/">Accordion</a></li>',
        '</ul>',
      ].join('\n'),
    );

    expect(readOutput('components/content/index.html')).to.equal(
      [
        '<h1 id="content">',
        '  <a aria-hidden="true" tabindex="-1" href="#content"><span class="icon icon-link"></span></a',
        '  >Content',
        '</h1>',
        '<ul>',
        '  <li><a href="/components/accordion/">Accordion</a></li>',
        '</ul>',
      ].join('\n'),
    );

    expect(readOutput('components/accordion/index.html')).to.equal(
      [
        '<h1 id="accordion">',
        '  <a aria-hidden="true" tabindex="-1" href="#accordion"><span class="icon icon-link"></span></a',
        '  >Accordion',
        '</h1>',
        '<ul>',
        '  <li><a href="/components/content/">Content</a></li>',
        '  <li><a href="/components/">Components</a></li>',
        '  <li><a href="/">Index</a></li>',
        '</ul>',
      ].join('\n'),
    );
  });
});
