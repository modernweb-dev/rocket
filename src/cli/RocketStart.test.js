import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { normalizeStartOptions, startServerArgs } from './RocketStart.js';

describe('Test RocketStart', () => {
  it('01: normalizes start flags for the dev server process', () => {
    assert.deepEqual(
      normalizeStartOptions({
        port: '3000',
        open: false,
        watch: false,
      }),
      {
        port: 3000,
        open: false,
        watch: false,
      },
    );
  });

  it('02: rejects invalid port flags clearly', () => {
    assert.throws(() => normalizeStartOptions({ port: 'abc' }), /Invalid --port "abc"/);
    assert.throws(() => normalizeStartOptions({ port: '0' }), /Invalid --port "0"/);
    assert.throws(() => normalizeStartOptions({ port: '65536' }), /Invalid --port "65536"/);
  });

  it('03: passes config and start options to the server child process', () => {
    const args = startServerArgs({
      configFilePath: 'config/rocket-config.js',
      options: { port: 3000, open: false, watch: false },
    });

    assert.equal(path.basename(args[0]), 'main.js');
    assert.equal(args[1], 'config/rocket-config.js');
    assert.deepEqual(JSON.parse(args[2]), {
      port: 3000,
      open: false,
      watch: false,
    });
  });
});
