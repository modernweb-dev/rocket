import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { markStylesheets, restoreStylesheetOrder } from './stylesheetOrderPlugin.js';

/**
 * Simulates Vite: removes the bundled source links and injects the bundled CSS at the end.
 *
 * @param {string} head
 * @param {string[]} bundledHrefs
 * @param {string} injected
 */
function viteBuild(head, bundledHrefs, injected) {
  let result = head;
  for (const href of bundledHrefs) {
    result = result.replace(new RegExp(`<link data-rocket-css[^>]*href="${href}"[^>]*>`), '');
  }
  return result + injected;
}

describe('stylesheetOrderPlugin', () => {
  it('01: moves the bundled CSS into the position of the first bundled stylesheet', () => {
    const source =
      '<head><link rel="stylesheet" href="/../layout.css" /><link rel="stylesheet" href="/theme.css" />';
    const built = viteBuild(
      markStylesheets(source),
      ['/../layout.css'],
      '<link rel="stylesheet" crossorigin href="/assets/index.css">',
    );

    assert.equal(
      restoreStylesheetOrder(built),
      '<head><link rel="stylesheet" crossorigin href="/assets/index.css"><link rel="stylesheet" href="/theme.css" />',
    );
  });

  it('02: keeps stylesheets that came before the first bundled stylesheet in front', () => {
    const source =
      '<link rel="stylesheet" href="https://fonts.test/a.css"><link rel="stylesheet" href="/../a.css"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/../b.css">';
    const built = viteBuild(
      markStylesheets(source),
      ['/../a.css', '/../b.css'],
      '<link rel="stylesheet" href="/assets/a.css"><link rel="stylesheet" href="/assets/b.css">',
    );

    assert.equal(
      restoreStylesheetOrder(built),
      '<link rel="stylesheet" href="https://fonts.test/a.css"><link rel="stylesheet" href="/assets/a.css"><link rel="stylesheet" href="/assets/b.css"><link rel="stylesheet" href="/theme.css">',
    );
  });

  it('03: leaves the head untouched when Vite bundled nothing', () => {
    const source = '<meta charset="utf-8"><link rel="stylesheet" href="/theme.css">';

    assert.equal(restoreStylesheetOrder(markStylesheets(source)), source);
  });

  it('04: handles multi-line link tags', () => {
    const source =
      '<link\n  rel="stylesheet"\n  href="/../layout.css"\n/><link\n  rel="stylesheet"\n  href="/theme.css"\n/>';
    const built = viteBuild(
      markStylesheets(source),
      ['/../layout.css'],
      '<link rel="stylesheet" href="/assets/index.css">',
    );

    assert.equal(
      restoreStylesheetOrder(built),
      '<link rel="stylesheet" href="/assets/index.css"><link\n  rel="stylesheet"\n  href="/theme.css"\n/>',
    );
  });
});
