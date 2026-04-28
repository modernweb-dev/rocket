import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { standaloneDemoPathFromUrl, standaloneDemoUrl } from './RocketJsDemo.js';

describe('Test RocketJsDemo', () => {
  it('01: uses generated child paths for Standalone control URLs', () => {
    assert.equal(
      standaloneDemoUrl('https://rocket.test/basics/demos?tab=source#simpleButton', 'simpleButton'),
      'https://rocket.test/basics/demos/_demo/simpleButton/',
    );
    assert.equal(
      standaloneDemoUrl('https://rocket.test/basics/demos/', 'simpleButton'),
      'https://rocket.test/basics/demos/_demo/simpleButton/',
    );
  });

  it('02: exposes generated child paths as site-root paths for copying', () => {
    assert.equal(
      standaloneDemoPathFromUrl(
        'https://rocket.test/basics/demos?tab=source#simpleButton',
        'simpleButton',
      ),
      '/basics/demos/_demo/simpleButton/',
    );
    assert.equal(
      standaloneDemoPathFromUrl('https://rocket.test/basics/demos/', 'simpleButton'),
      '/basics/demos/_demo/simpleButton/',
    );
  });
});
