import { html, css, LitElement, nothing } from 'lit';

export class BlogPostPreview extends LitElement {
  static properties = {
    post: { type: Object },
  };

  constructor() {
    super();
    /** @type {{ publishDate: string; title: string; description: string; url: string; } | undefined} */
    this.post = undefined;
  }

  render() {
    if (!this.post) {
      return nothing;
    }
    return html`
      <article class="post-preview">
        <header>
          <p class="publish-date">${this.post.publishDate}</p>
          <a href="${this.post.url}"><h1 class="title">${this.post.title}</h1></a>
        </header>
        <p>${this.post.description}</p>
        <a href=${this.post.url}>Read more</a>
      </article>
    `;
  }

  static styles = [
    css`
      .content :global(main > * + *) {
        margin-top: 1rem;
      }

      .post-preview {
        padding-bottom: 2rem;
        margin-bottom: 2rem;
        border-bottom: 4px solid var(--theme-divider);
      }

      header {
        align-items: flex-start;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-bottom: 2rem;
        text-align: left;
      }

      .title,
      .author,
      .publish-date {
        margin: 0;
      }

      .publish-date,
      .author {
        font-size: 1.25rem;
        color: var(--theme-text-lighter);
      }

      .title {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--theme-text);
      }
    `,
  ];
}
