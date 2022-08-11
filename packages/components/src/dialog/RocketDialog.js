import { LitElement, html, css } from 'lit';

// wait for all dialog animations to complete their promises
const animationsComplete = element =>
  Promise.allSettled(element.getAnimations().map(animation => animation.finished));

export class RocketDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
  };

  open = false;

  render() {
    return html`
      <slot name="invoker" @click=${this.toggle}></slot>
      <dialog>
        <form method="dialog">
          <article>
            <section class="warning-message">
              <slot name="content"></slot>
            </section>
          </article>
          <footer>
            <menu>
              <slot name="buttons" @click=${this._submit}></slot>
            </menu>
          </footer>
        </form>
      </dialog>
    `;
  }

  async _submit(ev) {
    ev.preventDefault();
    if (ev.target?.value) {
      this.dispatchEvent(new Event(ev.target.value));
    }
    await this.close();
  }

  firstUpdated() {
    this._dialog = this.shadowRoot.querySelector('dialog');
    this._invoker = this.shadowRoot.querySelector('slot[name="invoker"]')?.assignedElements()[0];
  }

  async close() {
    if (this.open === true && this._dialog) {
      this._dialog.setAttribute('inert', '');
      this._dialog.dispatchEvent(new Event('closing'));
      await animationsComplete(this._dialog);
      this._dialog.dispatchEvent(new Event('closed'));
      this._dialog.close();
      this.open = false;
    }
  }

  async showModal() {
    if (this.open === false && this._dialog) {
      this.alignDialogToInvoker();
      this._dialog.showModal();
      this._dialog.dispatchEvent(new Event('opening'));
      await animationsComplete(this._dialog);
      this._dialog.dispatchEvent(new Event('opened'));
      this._dialog.removeAttribute('inert');
      this.open = true;

      const focusTarget = this.querySelector('[autofocus]');
      focusTarget ? focusTarget.focus() : this.querySelector('button').focus();
    }
  }

  alignDialogToInvoker() {
    const bounds = this._invoker.getBoundingClientRect();
    const miniModalHeight = this._dialog.clientHeight - 15;
    const miniModalWidth = this._dialog.clientWidth / 2;

    let left = bounds.left - miniModalWidth;
    if (left < 0) {
      left = 10;
    }

    this._dialog.style.marginTop = bounds.y - miniModalHeight + 'px';
    this._dialog.style.marginLeft = null;
    if (window.innerWidth >= 768) {
      this._dialog.style.marginLeft = left + 'px';
    }
  }

  async toggle() {
    if (this._dialog) {
      if (this.open) {
        await this.close();
      } else {
        await this.showModal();
      }
    }
  }

  static styles = [
    css`
      :host {
        display: block;
        --rd-surface-1: var(--surface-1, #f8f9fa);
        --rd-surface-2: var(--surface-2, #e9ecef);
        --rd-surface-3: var(--surface-3, #dee2e6);
        --rd-text-1: var(--text-1, #212529);
        /* shadow */
        --rd-shadow-color: 220 3% 15%;
        --rd-shadow-strength: 1%;
        --rd-shadow-2: 0 3px 5px -2px hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 3%)),
          0 7px 14px -5px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%));
        --rd-shadow-6: 0 -1px 2px 0 hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 2%)),
          0 3px 2px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 7px 5px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 12px 10px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 4%)),
          0 22px 18px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%)),
          0 41px 33px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 6%)),
          0 100px 80px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 7%));
        /* size */
        --rd-size-3: var(--size-3, 1rem);
        --rd-size-5: var(--size-5, 1.5rem);
        /* animations */
        --rd-ease-3: cubic-bezier(0.25, 0, 0.3, 1);
        --rd-animation-scale-down: var(--animation-scale-down, scale-down 0.5s var(--rd-ease-3));
        --rd-animation-slide-in-up: var(--animation-in-up, slide-in-up 0.5s var(--rd-ease-3));
      }

      @media (prefers-color-scheme: dark) {
        :host {
          --rd-surface-1: var(--surface-1, #212529);
          --rd-surface-2: var(--surface-2, #343a40);
          --rd-surface-3: var(--surface-3, #495057);
          --rd-text-1: var(--text-1, #f1f3f5);
          --rd-shadow-color: 220 40% 2%;
          --rd-shadow-strength: 25%;
        }
      }

      dialog {
        display: grid;
        background: var(--rd-surface-2);
        color: var(--rd-text-1);
        max-inline-size: min(90vw, 60ch);
        max-block-size: min(80vh, 100%);
        max-block-size: min(80dvb, 100%);
        margin: auto;
        padding: 0;
        position: fixed;
        inset: 0;
        border-radius: 1rem;
        border: none;
        box-shadow: var(--rd-shadow-6);
        z-index: 2147483647;
        overflow: hidden;
        transition: opacity 0.5s var(--rd-ease-3);
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog {
          animation: var(--rd-animation-scale-down) forwards;
          animation-timing-function: var(--ease-squish-3);
        }
      }

      @media (prefers-color-scheme: dark) {
        dialog {
          -webkit-border-before: 1px solid var(--_rg-surface-3);
          border-block-start: 1px solid var(--_rg-surface-3);
        }
      }

      dialog:not([open]) {
        pointer-events: none;
        opacity: 0;
      }

      dialog::-webkit-backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      dialog::backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      dialog::-webkit-backdrop {
        -webkit-transition: -webkit-backdrop-filter 0.5s ease;
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      dialog::backdrop {
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog[open] {
          animation: var(--rd-animation-slide-in-up) forwards;
        }
      }

      dialog > form {
        display: grid;
        grid-template-rows: auto 1fr auto;
        align-items: start;
        max-block-size: 80vh;
        max-block-size: 80dvb;
      }

      dialog > form > article {
        overflow-y: auto;
        max-block-size: 100%;
        overscroll-behavior-y: contain;
        display: grid;
        justify-items: flex-start;
        gap: var(--rd-size-3);
        box-shadow: var(--shadow-2);
        z-index: var(--layer-1);
        padding-inline: var(--rd-size-5);
        padding-block: var(--rd-size-3);
      }

      @media (prefers-color-scheme: light) {
        dialog > form > article {
          background: var(--rd-surface-1);
        }

        dialog > form > article::-webkit-scrollbar {
          background: var(--rd-surface-1);
        }
      }

      @media (prefers-color-scheme: dark) {
        dialog > form > article {
          -webkit-border-before: 1px solid var(--_rg-surface-3);
          border-block-start: 1px solid var(--_rg-surface-3);
        }
      }

      dialog > form > header {
        display: flex;
        gap: var(--rd-size-3);
        justify-content: space-between;
        align-items: flex-start;
        padding-block: var(--rd-size-3);
        padding-inline: var(--rd-size-5);
      }

      dialog > form > header > button {
        border-radius: var(--radius-round);
        padding: 0.75ch;
        aspect-ratio: 1;
        flex-shrink: 0;
        align-items: center;
        justify-items: center;
        place-items: center;
        stroke: currentColor;
        stroke-width: 3px;
      }

      dialog > form > footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--rd-size-3);
        justify-content: space-between;
        align-items: flex-start;
        padding-inline: var(--rd-size-5);
        padding-block: var(--rd-size-3);
      }

      dialog > form > footer > menu {
        display: flex;
        flex-wrap: wrap;
        gap: var(--rd-size-3);
        -webkit-padding-start: 0;
        padding-inline-start: 0;
      }

      dialog > form > footer > menu:only-child {
        -webkit-margin-start: auto;
        margin-inline-start: auto;
      }

      @media (max-width: 410px) {
        dialog > form > footer > menu button[type='reset'] {
          display: none;
        }
      }

      dialog > form > :is(header, footer) {
        background-color: var(--rd-surface-2);
      }

      @media (prefers-color-scheme: dark) {
        dialog > form > :is(header, footer) {
          background-color: var(--rd-surface-1);
        }
      }

      @keyframes scale-down {
        to {
          transform: scale(0.75);
        }
      }

      @keyframes slide-in-up {
        from {
          transform: translateY(100%);
        }
      }
    `,
  ];
}
