import assert from 'node:assert/strict';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { customElements } from '@lit-labs/ssr-dom-shim';
import { describe, it } from 'node:test';
import { html } from 'lit';

import { RocketToc } from './RocketToc.js';

describe('Test RocketToc', () => {
  it('01: server renders from serialized toc attributes', async () => {
    customElements.__definitions.clear();
    customElements.__reverseDefinitions.clear();
    customElements.define('rocket-toc', RocketToc);

    const body = await ssrRender(html`<rocket-toc toc=${JSON.stringify(makeToc())}></rocket-toc>`);

    assert.match(body, /<rocket-toc\s+toc="/);
    assert.match(body, /href="#intro"/);
    assert.match(body, /href="#install"/);
  });

  it('02: marks the first heading current before scrollspy runs', async () => {
    const toc = new RocketToc();
    toc.toc = makeToc();

    const body = await ssrRender(toc.render());

    assert.equal(countMatches(body, /aria-current="location"/g), 1);
    assert.match(body, /href="#intro"[\s\S]*aria-current="location"/);
    assert.doesNotMatch(body, /href="#install"[\s\S]*aria-current="location"/);
  });

  it('03: marks a nested active heading after scrollspy runs', async () => {
    const toc = new RocketToc();
    toc.toc = makeToc();
    toc.activeId = 'install';

    const body = await ssrRender(toc.render());

    assert.equal(countMatches(body, /aria-current="location"/g), 1);
    assert.match(body, /href="#install"[\s\S]*aria-current="location"/);
  });

  it('04: chooses the last heading above the activation offset', () => {
    const toc = new RocketToc();
    toc.headingElements = [heading('intro', -40), heading('install', 90), heading('api', 180)];
    toc.getActivationOffset = () => 100;

    assert.equal(toc.findActiveHeadingId(), 'install');
  });

  it('05: keeps the first heading active before any heading reaches the activation offset', () => {
    const toc = new RocketToc();
    toc.headingElements = [heading('intro', 120), heading('install', 240)];
    toc.getActivationOffset = () => 100;

    assert.equal(toc.findActiveHeadingId(), 'intro');
  });

  it('06: chooses the last heading at the scroll end', () => {
    const toc = new RocketToc();
    toc.headingElements = [heading('intro', -400), heading('install', -200), heading('api', 260)];
    toc.getActivationOffset = () => 100;
    toc.isAtScrollEnd = () => true;

    assert.equal(toc.findActiveHeadingId(), 'api');
  });
});

/**
 * @param {unknown} template
 */
async function ssrRender(template) {
  return collectResult(render(template));
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 */
function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
}

/**
 * @returns {import('@rocket/js/types.js').TableOfContents}
 */
function makeToc() {
  return {
    children: [
      {
        id: 'intro',
        text: 'Intro',
        level: 2,
        children: [
          {
            id: 'install',
            text: 'Install',
            level: 3,
            children: [],
          },
        ],
      },
      {
        id: 'api',
        text: 'API',
        level: 2,
        children: [],
      },
    ],
  };
}

/**
 * @param {string} id
 * @param {number} top
 * @returns {HTMLElement}
 */
function heading(id, top) {
  return /** @type {HTMLElement} */ (
    /** @type {unknown} */ ({
      id,
      getBoundingClientRect() {
        return { top };
      },
    })
  );
}
