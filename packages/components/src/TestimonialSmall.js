import { LitElement, html, css } from 'lit';

export class TestimonialSmall extends LitElement {
  static properties = {
    cite: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      text-align: center;
    }

    slot[name='image']::slotted(*) {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto;
    }

    figure,
    blockquote {
      margin: 0;
    }

    blockquote {
      font-style: italic;
      color: #565578;
    }

    figcaption {
      font-weight: 600;
      color: #181c3b;
    }
  `;

  render() {
    return html`
      <slot name="image"></slot>
      <figure>
        <blockquote ?cite=${this.cite}>
          <slot></slot>
        </blockquote>
        <figcaption>
          <slot name="caption"></slot>
        </figcaption>
      </figure>
    `;
  }
}
