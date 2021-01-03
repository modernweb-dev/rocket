import { expect } from '@open-wc/testing';
import { joinTitleHeadline, highlightSearchTerms } from '../src/utils-shared.js';

describe('utils-shared: joinTitleHeadline', () => {
  it('joins title and headline with a ">"', async () => {
    const joined = joinTitleHeadline('Launch Preset: Inline Notification', 'Danger');
    expect(joined).to.equal('Launch Preset: Inline Notification > Danger');
  });

  it('shows only title if headline is the same', async () => {
    const joined = joinTitleHeadline(
      'Launch Preset: Inline Notification',
      'Launch Preset: Inline Notification',
    );
    expect(joined).to.equal('Launch Preset: Inline Notification');
  });
});

describe('utils-shared: highlightSearchTerms', () => {
  it('highlights a term found', async () => {
    const highlighted = highlightSearchTerms({
      search: 'more',
      terms: ['more'],
      text: 'Read more ...',
    });
    expect(highlighted).to.equal('Read <strong>more</strong> ...');
  });

  it('highlights a search term found regardless of casing', async () => {
    const highlighted = highlightSearchTerms({
      search: 'more',
      terms: ['more'],
      text: 'Read More ...',
    });
    expect(highlighted).to.equal('Read <strong>More</strong> ...');
  });

  it('highlights a term found regardless of casing', async () => {
    const highlighted = highlightSearchTerms({
      search: 'fore',
      terms: ['more'],
      text: 'Read More ...',
    });
    expect(highlighted).to.equal('Read <strong>More</strong> ...');
  });

  it('highlights all terms found', async () => {
    const highlighted = highlightSearchTerms({
      search: 'fore',
      terms: ['more'],
      text: 'Read more ... more you want to read',
    });
    expect(highlighted).to.equal(
      'Read <strong>more</strong> ... <strong>more</strong> you want to read',
    );
  });

  it('highlights only the matching part if term and search do have the same beginning', async () => {
    const highlighted = highlightSearchTerms({
      search: 'lau',
      terms: ['launch'],
      text: 'You should launch that product.',
    });
    expect(highlighted).to.equal('You should <strong>lau</strong>nch that product.');
  });

  it('truncates the text to 100 characters + highlight code', async () => {
    const highlighted = highlightSearchTerms({
      search: 'launch',
      terms: ['launch'],
      text: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut dapibus arcu, a sodales orci. Mauris ante lectus, dictum vel nulla non.',
        'You should launch that product.',
        'Fusce vehicula ligula at scelerisque luctus. Etiam in porta augue. Integer ac nunc dapibus, feugiat metus sit.',
      ].join(' '),
    });
    expect(highlighted.length).to.equal(117); // 100 + 17 (the length of "<strong></strong>" to highlight the term)
  });

  it('truncates the text to 100 characters + highlight code only for the turncated text', async () => {
    const highlighted = highlightSearchTerms({
      search: 'l',
      terms: ['l'],
      text: [
        'What lovely lego launch product you have laying around this lake of lonely lovers. Would be a shame if it would be lost.',
      ].join(' '),
    });
    expect(highlighted.length).to.equal(270); // 100 + 10*17 (the length of "<strong></strong>" to highlight the term)
    expect(highlighted).to.equal(
      'What <strong>l</strong>ove<strong>l</strong>y <strong>l</strong>ego <strong>l</strong>aunch product you have <strong>l</strong>aying around this <strong>l</strong>ake of <strong>l</strong>one<strong>l</strong>y <strong>l</strong>overs. Wou<strong>l</strong>d be a shame ',
    );
  });

  it('truncates the text around to the first found term', async () => {
    const highlighted = highlightSearchTerms({
      search: 'launch',
      terms: ['launch'],
      text: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut dapibus arcu, a sodales orci. Mauris ante lectus, dictum vel nulla non.',
        'You should launch that product.',
        'Fusce vehicula ligula at scelerisque luctus. Etiam in porta augue. Integer ac nunc dapibus, feugiat metus sit.',
      ].join(' '),
    });
    expect(highlighted).to.equal(
      'on. You should <strong>launch</strong> that product. Fusce vehicula ligula at scelerisque luctus. Etiam in porta augu',
    );
  });

  it('handles found terms right at the start of the text', async () => {
    const highlighted = highlightSearchTerms({
      search: 'launch',
      terms: ['launch'],
      text: 'launch that product.',
    });
    expect(highlighted.length).to.equal(37); // 20 + 17 (textlength + length of "<strong></strong>")
    expect(highlighted).to.equal('<strong>launch</strong> that product.');
  });
});
