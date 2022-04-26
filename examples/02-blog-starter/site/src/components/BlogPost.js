import { html, css, LitElement } from 'lit';

export class BlogPost extends LitElement {
  static properties = {
    title: { type: String },
    author: { type: String },
    authorHref: { type: String },
    publishDate: { type: String, attribute: 'publish-date' },
    heroImage: { type: String, attribute: 'hero-image' },
    alt: { type: String },
  };

  constructor() {
    super();
    this.title = '';
    this.author = '';
    this.authorHref = '';
    this.publishDate = '';
    this.heroImage = '';
    this.alt = '';
  }

  render() {
    return html`
      <div class="layout">
        <article class="content">
          <div>
            <header>
              ${this.heroImage
                ? html`<img
                    width="600"
                    height="400"
                    class="hero-image"
                    loading="lazy"
                    src="${this.heroImage}"
                    alt="${this.alt}"
                  />`
                : ''}
              <p class="publish-date">${this.publishDate}</p>
              <h1 class="title">${this.title}</h1>
              <blog-author name=${this.author} href=${this.authorHref}></blog-author>
            </header>
            <main>
              <slot></slot>
            </main>
          </div>
        </article>
      </div>
    `;
  }

  static styles = [
    css`
      .hero-image {
        width: 100vw;
        object-fit: cover;
        object-position: center;
        margin-top: 2rem;
        margin-bottom: 4rem;
        max-width: 1280px;
      }

      @media (max-width: 50em) {
        .hero-image {
          height: 260px;
          margin-top: 0;
          margin-bottom: 2rem;
        }
      }

      .content {
        margin-bottom: 8rem;
      }

      .content :global(main > * + *) {
        margin-top: 1rem;
      }

      .content :global(h2) {
        margin-top: 4rem;
      }

      header {
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        justify-content: center;

        padding-bottom: 2rem;
        margin-bottom: 2rem;
        border-bottom: 4px solid var(--theme-divider);
      }

      .title,
      .author,
      .publish-date {
        margin: 0;
      }

      .publish-date,
      .author {
        color: var(--theme-text-lighter);
      }

      .title {
        font-size: 2.25rem;
        font-weight: 700;
      }
    `,
  ];
}
