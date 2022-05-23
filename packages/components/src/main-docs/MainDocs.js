import { LitElement, html, css } from 'lit';

export class MainDocs extends LitElement {
  render() {
    return html`
      <div id="content-area">
        <div id="menu">
          <div id="menu-sticky">
            <slot name="menu"></slot>
          </div>
        </div>
        <div id="content">
          <slot id="content-slot"></slot>
        </div>
        <div id="toc">
          <div id="toc-sticky">
            <slot name="toc"></slot>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    css`
      #content-area {
        display: grid;
        gap: 5ch;
      }

      #menu,
      #toc {
        display: none;
        max-width: 25ch;
      }
      #content {
        max-width: 100vw;
        padding: 0 20px;
        box-sizing: border-box;
        /* makes sure that code blocks don't grow bigger then main => see https://css-tricks.com/preventing-a-grid-blowout/ */
        min-width: 0;
      }

      @media screen and (min-width: 1024px) {
        #content-area {
          max-width: 1200px;
          margin: 0 auto;
        }
        #menu,
        #toc {
          display: block;
        }
        #menu {
          grid-column: 1 / 2;
          min-width: 20ch;
        }
        #content {
          grid-column: 2 / 3;
        }
        #toc {
          grid-column: 3 / 4;
        }
      }

      #toc-sticky,
      #menu-sticky {
        position: sticky;
        top: 70px;
        overflow: auto;
        max-height: calc(100vh - 70px);
      }
    `,
  ];
}
