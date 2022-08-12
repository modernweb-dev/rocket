import { aTimeout, expect, fixture as _fixture } from '@open-wc/testing';
import { html } from 'lit/static-html.js';
import { setViewport } from '@web/test-runner-commands';

import '@rocket/search/define.js';

/**
 * @param {function} method
 * @param {string} errorMessage
 */
async function expectThrowsAsync(method, errorMessage) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}

/**
 * @typedef {import('../src/RocketSearch').RocketSearch} RocketSearch
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */
const fixture = /** @type {(arg: TemplateResult) => Promise<RocketSearch>} */ (_fixture);

const fixtureOneResultUrl = new URL('./fixtures/one-result.json', import.meta.url).href;

describe('rocket-search', () => {
  before(async () => {
    await setViewport({ width: 1200, height: 640 });
  });

  it('throws if no jsonUrl is provided', async () => {
    const el = await fixture(html`<rocket-search></rocket-search>`);
    await expectThrowsAsync(
      () => el.setupSearch(),
      'You need to provide a URL to your JSON index. For example: <rocket-search json-url="https://.../search-index.json"></rocket-search>',
    );
  });

  it('throws if invalid jsonUrl is provided', async () => {
    const el = await fixture(html`<rocket-search json-url="404-url"></rocket-search>`);
    await expectThrowsAsync(
      () => el.setupSearch(),
      'The given json-url "404-url" could not be fetched.',
    );
  });

  it('initializes the search only on demand', async () => {
    const el = await fixture(html`<rocket-search json-url=${fixtureOneResultUrl}></rocket-search>`);
    expect(el.miniSearch).to.be.null;
    await el.setupSearch();
    expect(el.miniSearch).to.not.be.null;
  });

  // flaky on firefox 🤔
  it.skip('initialize the search on focus', async () => {
    const el = await fixture(html`<rocket-search json-url=${fixtureOneResultUrl}></rocket-search>`);
    expect(el.miniSearch).to.be.null;

    el.focus();
    await aTimeout(50);
    expect(el.miniSearch).to.not.be.null;
  });

  it('has search results', async () => {
    const el = await fixture(html`<rocket-search json-url=${fixtureOneResultUrl}></rocket-search>`);
    await el.setupSearch();

    expect(el.results).to.deep.equal([]);
    el.search = 'first';
    await el.updateComplete;
    expect(el.results).to.have.a.lengthOf(1);
  });
});
