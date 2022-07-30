import { html, css, LitElement, nothing } from 'lit';

export class LaunchBlogDetails extends LitElement {
  static properties = {
    data: { type: Object },
  };

  constructor() {
    super();
    /** @type {{ firstName: string; lastName: string; twitter: string; image: string; publishDate: Date; authors: [{ firstName: string; lastName: string; twitter: string; }], tags: string[] } | undefined} */
    this.data = undefined;
    this.dateFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  render() {
    if (!this.data) {
      return nothing;
    }
    return html`
      <p class="bold">Publish Date</p>
      <p>${this.dateFormatter.format(this.data.publishDate)}</p>
      <p class="bold">Authors</p>
      ${this.data.authors.map(
        author => html`
          <a href="https://twitter.com/${author.twitter}">
            ${author.firstName} ${author.lastName}
          </a>
        `,
      )}
      <p class="bold">Tags</p>
      <ul>
        ${this.data.tags.map(tag => html` <li>${tag}</li> `)}
      </ul>
    `;
  }

  static styles = [
    css`
      .bold {
        font-weight: 700;
      }
    `,
  ];
}
