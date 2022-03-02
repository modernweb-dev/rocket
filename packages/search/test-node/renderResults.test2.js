import chai from 'chai';
import { renderResults, renderResult } from '../src/renderResults.js';
import chalk from 'chalk';

const { expect } = chai;

const defaultResult = {
  id: '/_site-dev/docs/#content-top',
  terms: ['more'],
  title: 'Documentation',
  headline: 'Read more',
  body: 'Here you will read more about it.',
  section: 'docs',
};

describe('renderResults', () => {
  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
  });

  it('renders a single result', async () => {
    const result = renderResult({ result: defaultResult, search: 'more' });
    expect(result).to.deep.equal([
      '  📖 ntation > Read more',
      '      you will read more about it.',
      '     http://localhost:8080/_site-dev/docs/#content-top',
      '',
    ]);
  });

  it('renders results', async () => {
    const result = renderResults({ term: 'launch', results: [defaultResult] });
    expect(result).to.deep.equal([
      '\u001b[2J\u001b[3J\u001b[H', // clear command
      'Searching for: launch█',
      '',
      '  📖 ntation > Read more',
      '      you will read more about it.',
      '     http://localhost:8080/_site-dev/docs/#content-top',
      '',
      '',
      'Legend:',
      '   📜 Guides  📖 Docs  📝 Blog  ❓ Others',
      '',
      'Press Strg+C to quit search.',
    ]);
  });
});
