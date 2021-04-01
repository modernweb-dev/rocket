import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../rocket-navigation.js';

describe('rocket-navigation', () => {
  it('fires a "close-overlay" event if you click on an anchor', async () => {
    const spy = sinon.spy();
    const el = await fixture(html`
      <rocket-navigation @close-overlay=${spy}>
        <ul>
          <li class="menu-item">
            <a href="">Getting Started</a>
            <ul>
              <li class="menu-item anchor">
                <a href="#setup-sections" class="anchor">Setup sections</a>
              </li>
            </ul>
          </li>
        </ul>
      </rocket-navigation>
    `);
    const anchor = el.querySelector('.anchor');
    anchor.click();
    expect(spy).to.have.been.calledOnce;
  });

  it('will navigate to the first sub page if there is one that is not an anchor', async () => {
    const pageSpy = sinon.spy();
    const anchorSpy = sinon.spy();

    const el = await fixture(html`
      <rocket-navigation>
        <ul>
          <li class="menu-item">
            <a>With SubPages</a>
            <ul>
              <li class="menu-item anchor">
                <a @click=${pageSpy}>SubPage</a>
              </li>
            </ul>
          </li>
          <li class="menu-item">
            <a>Without SubPages</a>
            <ul>
              <li class="menu-item anchor">
                <a class="anchor" @click=${anchorSpy}>Anchor of Without SubPages</a>
              </li>
            </ul>
          </li>
        </ul>
      </rocket-navigation>
    `);
    const links = el.querySelectorAll('rocket-navigation > ul > li > a');
    links[0].click();
    expect(pageSpy).to.be.calledOnce;

    links[1].click();
    expect(anchorSpy).to.not.be.called;
  });

  it('will mark the currently "active" headline in the menu', async function () {
    this.timeout(5000);
    function addBlock(headline, length = 5) {
      return html`
        <h2 id="${headline}">${headline}</h2>
        ${new Array(length).fill(html` <p>text content</p> `)}
      `;
    }

    const wrapper = await fixture(html`
      <div id="anchor-test-wrapper">
        <rocket-navigation>
          <ul>
            <li class="menu-item current">
              <a>Page with anchors</a>
              <ul>
                <li class="menu-item anchor">
                  <a class="anchor" href="#top">Anchor</a>
                </li>
                <li class="menu-item anchor">
                  <a class="anchor" href="#middle">Anchor</a>
                </li>
                <li class="menu-item anchor">
                  <a class="anchor" href="#bottom">Anchor</a>
                </li>
              </ul>
            </li>
          </ul>
        </rocket-navigation>
        <div id="anchor-test-content">
          ${addBlock('top', 10)} ${addBlock('middle', 30)} ${addBlock('bottom', 10)}
        </div>
      </div>
      <style>
        #anchor-test-wrapper {
          display: flex;
        }
      </style>
    `);
    await aTimeout(50);
    const anchorLis = wrapper.querySelectorAll('.menu-item.anchor');
    expect(anchorLis[0]).to.have.class('current');
    expect(anchorLis[1]).to.not.have.class('current');
    expect(anchorLis[2]).to.not.have.class('current');

    document.querySelector('#middle').scrollIntoView();
    await aTimeout(100);
    expect(anchorLis[0]).to.not.have.class('current');
    expect(anchorLis[1]).to.have.class('current');
    expect(anchorLis[2]).to.not.have.class('current');

    document.querySelector('#bottom').scrollIntoView();
    await aTimeout(100);
    expect(anchorLis[0]).to.not.have.class('current');
    expect(anchorLis[1]).to.not.have.class('current');
    expect(anchorLis[2]).to.have.class('current');
  });
});
