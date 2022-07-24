import { html, css, LitElement, nothing } from 'lit';

export class LaunchBlogPreview extends LitElement {
  static properties = {
    post: { type: Object },
  };

  constructor() {
    super();
    /** @type {{ publishDate: string; title: string; description: string; url: string; } | undefined} */
    this.post = undefined;
    this.dateFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  render() {
    if (!this.post) {
      return nothing;
    }
    return html`
      <article class="post-preview">
        <header>
          <a href="${this.post.url}"><h1 class="title">${this.post.name}</h1></a>
          <p class="publish-date">${this.dateFormatter.format(this.post.publishDate)}</p>
        </header>
        <p>${this.post.description}</p>
      </article>
    `;
  }

  static styles = [
    css`
      .post-preview {
        padding-bottom: 2rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--primary-lines-color, #ccc);
      }

      header {
        align-items: flex-start;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: left;
      }

      .title,
      .author,
      .publish-date {
        margin: 0;
      }

      .publish-date,
      .author {
        font-size: 1rem;
        color: var(--text-color-lighter, #ccc);
      }

      .title {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--theme-text);
      }

      a {
        color: inherit;
        text-decoration: none;
      }
      a:hover {
        color: var(--primary-color);
      }
    `,
  ];
}
