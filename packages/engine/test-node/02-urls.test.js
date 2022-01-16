import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine Urls', () => {
  it('creates urls based on filename heuristics', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/02-urls/docs');
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
});
