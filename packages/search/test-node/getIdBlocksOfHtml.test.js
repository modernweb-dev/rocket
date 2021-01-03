import chai from 'chai';
import { getIdBlocksOfHtml } from '../src/getIdBlocksOfHtml.js';

const { expect } = chai;

describe('getIdBlocksOfHtml', () => {
  it('extracts only content from main', async () => {
    const result = await getIdBlocksOfHtml({ html: '<p>ignore</p><main>foo</main>', url: 'test' });
    expect(result).to.deep.equal([
      {
        url: 'test',
        headline: '',
        text: 'foo',
      },
    ]);
  });

  it('separates multiple content tags with a space', async () => {
    const result = await getIdBlocksOfHtml({
      html: '<main><p>one</p><p>two</p></main>',
      url: 'test',
    });
    expect(result).to.deep.equal([
      {
        url: 'test',
        headline: '',
        text: 'one two',
      },
    ]);
  });

  it('adds a block with url, headline, text', async () => {
    const result = await getIdBlocksOfHtml({
      html: '<main><h1 id="first">First</h1><p>text in First</p></main>',
      url: 'test',
    });
    expect(result).to.deep.equal([
      {
        url: 'test#first',
        headline: 'First',
        text: 'text in First',
      },
    ]);
  });

  it('adds a block for each headline with an id', async () => {
    const result = await getIdBlocksOfHtml({
      html: `
        <main>
          <h1 id="first">First</h1><p>text in</p><div id="ignore-id">First</div>
          <h1 id="second">Second</h1><p>text in second</p>
        </main>
      `,
      url: 'test',
    });
    expect(result).to.deep.equal([
      {
        url: 'test#first',
        headline: 'First',
        text: 'text in First',
      },
      {
        url: 'test#second',
        headline: 'Second',
        text: 'text in second',
      },
    ]);
  });
});
