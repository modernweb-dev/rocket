import { expect, fixture, html } from '@open-wc/testing';
import { html as storyHtml } from '@mdjs/mdjs-story';

import '@mdjs/mdjs-story/define';

/** @typedef {import('@mdjs/mdjs-preview').MdJsPreview} MdJsPreview */

describe('mdjs-story', () => {
  it('will render the element into the light dom by default', async () => {
    const el = await fixture(html`
      <mdjs-story .story=${() => storyHtml`<p id="testing"></p>`}></mdjs-story>
    `);
    expect(el.querySelectorAll('#testing').length).to.equal(1);
  });
});
