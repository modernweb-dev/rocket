import { html, css, LitElement } from 'lit';

export class BlogAuthor extends LitElement {
  static get properties() {
    return {
      name: { type: String },
      href: { type: String },
    };
  }

  static get styles() {
    return css`
      .author {
        margin-bottom: 0.75rem;
      }
    `;
  }

  render() {
    return html`
      <div class="author">
        <p><a href=${this.href}>${this.name}</a></p>
      </div>
    `;
  }
}

customElements.define('blog-author', BlogAuthor);
