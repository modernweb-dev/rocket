import { LitElement, html, css } from 'lit';

export class MainContent extends LitElement {
  render() {
    return html`
      <div id="content">
        <slot id="content-slot"></slot>
      </div>
      <div id="toc">
        <div id="toc-sticky">
          <slot name="toc"></slot>
        </div>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: grid;
        gap: 5ch;
      }

      #toc {
        display: none;
        max-width: 25ch;
      }
      #content {
        max-width: 100vw;
        box-sizing: border-box;
        /* makes sure that code blocks don't grow bigger then main => see https://css-tricks.com/preventing-a-grid-blowout/ */
        min-width: 0;
      }

      @media screen and (min-width: 1024px) {
        #toc {
          display: block;
        }
        #content {
          grid-column: 2 / 3;
        }
        #toc {
          grid-column: 3 / 4;
        }
      }

      #toc-sticky {
        position: sticky;
        top: 70px;
        overflow: auto;
        max-height: calc(100vh - 70px);
      }
    `,
  ];
}
