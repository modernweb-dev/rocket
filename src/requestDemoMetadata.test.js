import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseRequestDemoMetadata } from './requestDemoMetadata.js';

describe('Test requestDemoMetadata', () => {
  it('01: accepts site-root GET request paths with optional label and height', () => {
    assert.deepEqual(parseRequestDemoMetadata('request-demo url="/api/time?format=json"'), {
      url: '/api/time?format=json',
    });
    assert.deepEqual(
      parseRequestDemoMetadata(
        'request-demo url="/api/time" label="docs/time.rocket.js" height=320',
      ),
      {
        url: '/api/time',
        label: 'docs/time.rocket.js',
        height: 320,
      },
    );
  });

  it('02: rejects missing, relative, external, and hash request paths', () => {
    /** @type {[string, RegExp][]} */
    const cases = [
      ['request-demo', /`url` is required/],
      ['request-demo url="time"', /site-root path starting with `\/`/],
      ['request-demo url="./time"', /site-root path starting with `\/`/],
      ['request-demo url="https://example.com/time"', /same-site path starting with `\/`/],
      ['request-demo url="//example.com/time"', /same-site path starting with `\/`/],
      ['request-demo url="/time#details"', /must not include a hash/],
    ];

    for (const [meta, message] of cases) {
      assert.throws(() => parseRequestDemoMetadata(meta), message);
    }
  });

  it('03: rejects empty, zero, negative, decimal, and non-numeric heights', () => {
    const cases = [
      'request-demo url="/time" height',
      'request-demo url="/time" height=',
      'request-demo url="/time" height=""',
      'request-demo url="/time" height=0',
      'request-demo url="/time" height=-1',
      'request-demo url="/time" height=12.5',
      'request-demo url="/time" height=tall',
    ];

    for (const meta of cases) {
      assert.throws(
        () => parseRequestDemoMetadata(meta),
        /`height` must be a positive integer pixel value/,
      );
    }
  });
});
