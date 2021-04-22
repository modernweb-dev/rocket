import { expect, fixture, html } from '@open-wc/testing';
import '../src/CodeCopyButton';

describe('code-copy-button', () => {
  it('is rendered', async () => {
    const el = await fixture(html`<code-copy-button></code-copy-button>`);

    expect(el.shadowRoot.querySelector('slot')).to.exist;
    expect(el.shadowRoot.querySelector('button')).to.exist;
  });
  it('copies the content on click', async () => {
    const el = await fixture(
      html`<code-copy-button .textToCopy="<test-element></test-element>"></code-copy-button>`,
    );
    el.textToCopy = '<test-element></test-element>';
    const button = el.shadowRoot.querySelector('#copy-button');

    button.click();

    expect(el.getCopiedText()).to.equal('<test-element></test-element>');
  });
});
