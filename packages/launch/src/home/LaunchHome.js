import { LitElement, html, css } from 'lit';

export class LaunchHome extends LitElement {
  static properties = {
    reasons: { type: Array },
    backgroundImage: { type: Boolean, reflect: true, attribute: 'background-image' },
  };

  constructor() {
    super();
    /** @type {{ header: string, text: string }[]} */
    this.reasons = [];
    this.backgroundImage = false;
  }

  render() {
    return html`
      <div class="page-background">
        <slot name="background"></slot>
      </div>
      <div class="logo">
        <slot name="logo"></slot>
      </div>
      <div class="page-title">
        <slot name="title"></slot>
      </div>
      <div class="page-slogan">
        <slot name="slogan"></slot>
      </div>
      <div class="call-to-action-list" role="list">
        <slot name="cta"></slot>
      </div>

      <div class="reason-header">
        <slot name="reason-header"></slot>
      </div>
      <section class="reasons">
        ${this.reasons.map(
          reason => html`
            <article>
              <h3>${reason.header}</h3>
              ${reason.text}
            </article>
          `,
        )}
      </section>
    `;
  }

  static styles = [
    css`
      /** CALL TO ACTION ********************************************************************************/
      .call-to-action-list {
        text-align: center;
        padding: 25px 0;
      }

      slot[name='cta']::slotted(:nth-of-type(2)) {
        --primary-color: #222;
        --primary-color-lighter: #333;
        --primary-color-darker: #000;
      }

      slot[name='cta']::slotted(*) {
        color: #fff;
        display: inline-block;
        text-align: center;
        text-transform: uppercase;
        font-family: var(--secondary-font-family);
        font-size: 16px;
        font-weight: bold;
        vertical-align: middle;
        padding: 8px 24px;
        border: 1px solid var(--primary-color);
        border-radius: 24px;
        background: linear-gradient(to right, var(--primary-color-lighter), var(--primary-color));
        text-shadow: var(--primary-color-darker) 1px 1px 1px;
        color: var(--contrast-color-light, #fff);
        text-decoration: none;
      }

      slot[name='cta']::slotted(*:hover),
      slot[name='cta']::slotted(*:focus) {
        background: linear-gradient(to right, var(--primary-color), var(--primary-color-darker));
        text-decoration: none;
      }

      slot[name='cta']::slotted(*:active) {
        background: var(--primary-color-darker);
      }

      /** HOME ******************************************************************************************/
      .page-background {
        display: none;
      }

      :host {
        display: block;
      }

      .logo {
        text-align: center;
      }

      .page-title {
        color: var(--primary-color);
        font-size: 32px;
      }
      slot[name='title']::slotted(*),
      slot[name='slogan']::slotted(*) {
        margin: 0;
        padding: 0;
      }

      .page-title,
      .reason-header,
      .page-slogan {
        text-align: center;
        border-bottom: none;
        color: var(--text-color);
      }

      .page-slogan {
        font-size: 18px;
        padding-top: 25px;
      }

      .reason-header {
        margin-top: 60px;
        font-size: 30px;
        font-weight: bold;
      }

      .reasons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        column-gap: 100px;
        row-gap: 40px;
        color: var(--text-color);
      }

      slot[name='cta']::slotted(*) {
        margin: 10px;
      }

      slot[name='cta']::slotted(:nth-of-type(1)) {
        margin-left: 0;
      }

      @media screen and (min-width: 380px) {
        .page-slogan {
          font-size: 25px;
        }

        .page-title {
          font-size: 50px;
        }
      }

      /** HOME WITH BACKGROUND **************************************************************************/
      .page-background {
        display: none;
      }

      @media screen and (min-width: 1024px) {
        :host([background-image]) .page-title,
        :host([background-image]) .page-slogan {
          text-align: left;
        }

        :host([background-image]) .page-title {
          margin-top: 110px;
        }

        :host([background-image]) .page-slogan {
          max-width: 500px;
        }

        :host([background-image]) .call-to-action-list {
          text-align: left;
        }

        :host([background-image]) .page-background {
          display: block;
          position: absolute;
          top: -305px;
          right: -415px;
          z-index: -1;
          transform: rotate(45deg);
        }
      }
    `,
  ];
}
