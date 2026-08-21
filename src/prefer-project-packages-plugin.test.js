import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { preferProjectPackagesPlugin } from './prefer-project-packages-plugin.js';

describe('Test preferProjectPackagesPlugin', () => {
  it('01: resolves available project package imports from the project root', () => {
    const plugin = preferProjectPackagesPlugin();

    assert.equal(
      plugin.resolveImport?.(/** @type {any} */ ({ source: 'lit/directives/ref.js' })),
      '/node_modules/lit/directives/ref.js',
    );
  });

  it('02: detects project packages that only expose subpath entrypoints', () => {
    const plugin = preferProjectPackagesPlugin();

    assert.equal(
      plugin.resolveImport?.(
        /** @type {any} */ ({
          source: '@awesome.me/webawesome/dist/components/icon/icon.js',
        }),
      ),
      '/node_modules/@awesome.me/webawesome/dist/components/icon/icon.js',
    );
  });

  it('03: leaves packages absent from the project to normal dependency resolution', () => {
    const plugin = preferProjectPackagesPlugin();

    assert.equal(
      plugin.resolveImport?.(/** @type {any} */ ({ source: 'rocket-package-not-installed' })),
      undefined,
    );
  });

  it('04: resolves package roots with ESM import conditions', () => {
    const plugin = preferProjectPackagesPlugin();

    assert.equal(
      plugin.resolveImport?.(/** @type {any} */ ({ source: '@floating-ui/dom' })),
      '/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs',
    );
  });

  it('05: leaves relative and URL imports to their owning resolvers', () => {
    const plugin = preferProjectPackagesPlugin();

    assert.equal(
      plugin.resolveImport?.(/** @type {any} */ ({ source: './local-module.js' })),
      undefined,
    );
    assert.equal(
      plugin.resolveImport?.(/** @type {any} */ ({ source: 'https://cdn.test/module.js' })),
      undefined,
    );
    assert.equal(plugin.resolveImport?.(/** @type {any} */ ({ source: 'crypto' })), undefined);
    assert.equal(plugin.resolveImport?.(/** @type {any} */ ({ source: 'node:crypto' })), undefined);
  });
});
