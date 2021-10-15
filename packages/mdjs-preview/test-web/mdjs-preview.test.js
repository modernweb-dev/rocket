import { expect, fixture, html } from '@open-wc/testing';
import { html as storyHtml } from '@mdjs/mdjs-preview';
import '@mdjs/mdjs-preview/define';

/** @typedef {import('@mdjs/mdjs-preview').MdJsPreview} MdJsPreview */

describe('mdjs-preview', () => {
  it('will render the element into the shadow root by default', async () => {
    const el = await fixture(html`
      <mdjs-preview .story=${() => storyHtml`<p id="testing"></p>`}></mdjs-preview>
    `);
    expect(el.querySelectorAll('#testing').length).to.equal(1);
  });

  it('sync simulator states between instances', async () => {
    const el = await fixture(html`
      <div>
        <mdjs-preview .story=${() => storyHtml`<p></p>`}></mdjs-preview>
        <mdjs-preview .story=${() => storyHtml`<p></p>`}></mdjs-preview>
      </div>
    `);
    const [preview1, preview2] = /** @type {MdJsPreview[]} */ (el.children);
    preview1.platform = 'web';
    preview1.edgeDistance = true;
    await preview1.updateComplete;
    expect(preview1.platform).to.equal('web');
    expect(preview2.platform).to.equal('web');
    expect(preview1.edgeDistance).to.be.true;
    expect(preview2.edgeDistance).to.be.true;

    preview1.edgeDistance = false;
    await preview1.updateComplete;
    expect(preview1.edgeDistance).to.be.false;
    expect(preview2.edgeDistance).to.be.false;
  });
});
