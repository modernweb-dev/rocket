import { expect, fixture, html } from '@open-wc/testing';
import { html as storyHtml } from '@mdjs/mdjs-preview';
import { MdJsPreview } from '@mdjs/mdjs-preview';
import { render as render2 } from 'lit';
import { isTemplateResult as isTemplateResult2 } from 'lit/directive-helpers.js';

/** @typedef {import('@mdjs/mdjs-preview').MdJsPreview} MdJsPreview */

describe('mdjs-preview Subclasser', () => {
  it('will expose a render function getter to override in extensions', async () => {
    let isCalled = false;
    class HybridLitMdjsPreview extends MdJsPreview {
      renderStory(html, container, options) {
        isCalled = true;
        if (isTemplateResult2(html)) {
          render2(html, container, options);
        } else {
          throw new Error('[mdjs-preview]: Only lit2 allowed');
        }
      }
    }
    customElements.define('mdjs-preview', HybridLitMdjsPreview);

    const el = await fixture(html`
      <mdjs-preview .story=${() => storyHtml`<p id="testing"></p>`}></mdjs-preview>
    `);
    expect(isCalled).to.be.true;
    expect(el.querySelectorAll('#testing').length).to.equal(1);
  });
});
