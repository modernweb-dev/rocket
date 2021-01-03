import { expect } from '@open-wc/testing';
import { extractTitle } from '../src/title/extractTitle.js';

describe('extractTitle', () => {
  it('is undefined if no headline is found', async () => {
    expect(extractTitle('## sub heading')).to.be.undefined;
  });

  it('accepts only headlines that are at the start of the line', async () => {
    expect(extractTitle(' # heading')).to.be.undefined;
  });

  it('extracts an h1 as a title', async () => {
    expect(extractTitle('# heading')).to.to.equal('heading');
  });

  it('ignores content around the heading', async () => {
    expect(extractTitle('some \n# heading\n more content')).to.equal('heading');
  });

  it('ignores "headings" in code blocks', async () => {
    expect(extractTitle('```\n# comment heading\n```\n# heading')).to.equal('heading');
  });
});
