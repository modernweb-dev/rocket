import chai from 'chai';
// import '@lit-labs/ssr/lib/install-global-dom-shim.js';
import { html } from 'lit-html';
import { renderJoiningGroup } from '../src/helpers/renderJoiningGroup.js';
import { testLitServerRender } from './test-helpers.js';

const { expect } = chai;

describe('renderJoiningGroup', () => {
  it('orders positive numbers', async () => {
    expect(
      await testLitServerRender(
        renderJoiningGroup('header', {
          header__50: html`<p>header__50</p>`,
          header__10: html`<p>header__10</p>`,
        }),
      ),
      { format: 'html' },
    ).to.equal('<p>header__10</p><p>header__50</p>');
  });

  it('does support optional following descriptions', async () => {
    expect(
      await testLitServerRender(
        renderJoiningGroup('header', {
          header__50_bottom: html`<p>header__50</p>`,
          header__10_top: html`<p>header__10</p>`,
        }),
      ),
      { format: 'html' },
    ).to.equal('<p>header__10</p><p>header__50</p>');
  });

  it('orders negative numbers', async () => {
    expect(
      await testLitServerRender(
        renderJoiningGroup('header', {
          header__50: html`<p>header__50</p>`,
          ignoreMe__10: html`<p>ignoreMe__10</p>`,
          'header__-50': html`<p>header__-50</p>`,
        }),
      ),
      { format: 'html' },
    ).to.equal('<p>header__-50</p><p>header__50</p>');
  });

  it('has access to data', async () => {
    expect(
      await testLitServerRender(
        renderJoiningGroup(
          'header',
          {
            header__50: data =>
              html`
                <p>header__50</p>
                <p>Name: ${data.name}</p>
              `,
          },
          { name: 'Peter' },
        ),
        { format: 'html' },
      ),
    ).to.equal(['<p>header__50</p>', '<p>Name: Peter</p>'].join('\n'));
  });

  // it('does support async functions', async () => {
  //   expect(
  //     renderJoiningGroup('header', {
  //       header__50_bottom: () => new Promise(resolve => setTimeout(resolve('header__50'), 20)),
  //       header__10_top: 'header__10',
  //     }),
  //   ).to.equal('<p>header__10</p><p>header__50</p>');
  // });
});
