import { expect } from '@open-wc/testing';
import { parseTitle } from '../src/title/parseTitle.js';

describe('parseTitle', () => {
  it('works with a simple headline', async () => {
    expect(parseTitle('heading')).to.deep.equal({
      title: 'heading',
      eleventyNavigation: {
        title: 'heading',
        key: 'heading',
        order: 0,
      },
    });
  });

  it('ignores ending >> ', async () => {
    expect(parseTitle('Foo >>')).to.deep.equal({
      title: 'Foo',
      eleventyNavigation: {
        title: 'Foo',
        key: 'Foo >>',
        order: 0,
      },
    });
  });

  it('can define a parent', async () => {
    expect(parseTitle('Foo >> Bar')).to.deep.equal({
      title: 'Foo: Bar',
      eleventyNavigation: {
        title: 'Bar',
        key: 'Foo >> Bar',
        parent: 'Foo',
        order: 0,
      },
    });
  });

  it('keeps only the last 2 levels for the title and only the last for the navigation title', async () => {
    expect(parseTitle('Foo >> Bar >> Baz')).to.deep.equal({
      title: 'Bar: Baz',
      eleventyNavigation: {
        title: 'Baz',
        key: 'Foo >> Bar >> Baz',
        parent: 'Foo >> Bar',
        order: 0,
      },
    });
  });

  it('can define an order', async () => {
    expect(parseTitle('heading ||4')).to.deep.equal({
      title: 'heading',
      eleventyNavigation: {
        title: 'heading',
        key: 'heading',
        order: 4,
      },
    });

    expect(parseTitle('Foo >> Bar >> Baz ||4')).to.deep.equal({
      title: 'Bar: Baz',
      eleventyNavigation: {
        title: 'Baz',
        key: 'Foo >> Bar >> Baz',
        order: 4,
        parent: 'Foo >> Bar',
      },
    });
  });

  it('throws if no string is provided', async () => {
    expect(() => parseTitle()).to.throw('You need to provide a string to `parseTitle`');
  });

  it('throws if trying to define two orders', async () => {
    expect(() => parseTitle('Foo || Bar || 10')).to.throw(
      'You can use || only once in `parseTitle`',
    );
  });
});
