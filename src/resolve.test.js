import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';
import { resolve } from './resolve.js';

describe('Test resolve', () => {
  it('01: returns project-root browser paths for files inside the Site Author project', () => {
    const file = path.join(process.cwd(), 'node_modules', 'example-package', 'styles.css');

    assert.equal(resolveWithFile(file), '/node_modules/example-package/styles.css');
  });

  it('02: returns Web Dev Server paths for files in linked packages outside the project root', () => {
    const file = path.resolve(process.cwd(), '..', 'linked-package', 'src', 'component.js');

    assert.equal(resolveWithFile(file), '/__wds-outside-root__/1/linked-package/src/component.js');
  });

  it('03: prefers browser packages installed in the Site Author project', () => {
    const fallback = path.resolve(process.cwd(), '..', 'linked-package', 'lit', 'index.js');

    assert.equal(resolveWithFile(fallback, 'lit'), '/node_modules/lit/index.js');
  });

  it('04: selects ESM import conditions for project packages', () => {
    const fallback = path.resolve(process.cwd(), '..', 'linked-package', 'floating-ui.js');

    assert.equal(
      resolveWithFile(fallback, '@floating-ui/dom'),
      '/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs',
    );
  });

  it('05: selects browser conditions before package defaults', () => {
    const fallback = path.resolve(process.cwd(), '..', 'linked-package', 'nanoid.js');

    assert.equal(resolveWithFile(fallback, 'nanoid'), '/node_modules/nanoid/index.browser.js');
  });
});

/**
 * @param {string} file
 * @param {string} [specifier]
 */
function resolveWithFile(file, specifier = 'unused-in-test') {
  return resolve(specifier, {
    ...import.meta,
    resolve() {
      return pathToFileURL(file).href;
    },
  });
}
