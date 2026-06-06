import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { rocketDemoComponents } from '../../components.js';
import { atlasDocComponents } from './atlasDocLayout.js';
import { atlasHeroComponents } from './atlasHeroLayout.js';

describe('Test Atlas JavaScript Demo component loading', () => {
  it('01: client-loads JavaScript Demo in Atlas Doc pages', () => {
    assert.deepEqual(atlasDocComponents['rocket-js-demo'], {
      file: './RocketJsDemo.js',
      className: 'RocketJsDemo',
      loading: 'client',
    });
  });

  it('02: client-loads JavaScript Demo in Atlas Hero pages', () => {
    assert.deepEqual(atlasHeroComponents['rocket-js-demo'], {
      file: './RocketJsDemo.js',
      className: 'RocketJsDemo',
      loading: 'client',
    });
  });

  it('03: client-loads Request Demo in Atlas Doc pages', () => {
    assert.deepEqual(atlasDocComponents['rocket-request-demo'], {
      file: './RocketRequestDemo.js',
      className: 'RocketRequestDemo',
      loading: 'client',
    });
  });

  it('04: client-loads Request Demo in Atlas Hero pages', () => {
    assert.deepEqual(atlasHeroComponents['rocket-request-demo'], {
      file: './RocketRequestDemo.js',
      className: 'RocketRequestDemo',
      loading: 'client',
    });
  });

  it('05: exposes a focused Rocket demo component map', () => {
    assert.deepEqual(Object.keys(rocketDemoComponents).sort(), [
      'rocket-code-block',
      'rocket-js-demo',
      'rocket-request-demo',
    ]);
    assert.deepEqual(
      atlasDocComponents['rocket-code-block'],
      rocketDemoComponents['rocket-code-block'],
    );
    assert.equal(atlasHeroComponents['rocket-code-block'].loading, 'hydrate:onClientLoad');
  });
});
