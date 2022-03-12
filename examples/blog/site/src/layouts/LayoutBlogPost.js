import { html } from 'lit';
import { baseHead } from '../parts/baseHead.js';
import '../components/blog-header.js';
import '../components/blog-post.js';

export class LayoutBlogPost {
  render(data) {
    const { title, description, publishDate, author, authorHref, heroImage, permalink, alt, lang } =
      data;
    return html`
      <html-server-only lang=${lang || 'en'}>
        <head>
          ${baseHead({ title, description, permalink })}
        </head>

        <body>
          <blog-header></blog-header>
          <div class="wrapper">
            <blog-post
              title=${title}
              author=${author}
              .authorHref=${authorHref}
              hero-image=${heroImage}
              publish-date=${publishDate}
              alt=${alt}
            >
              ${data.content()}
            </blog-post>
          </div>
        </body>
      </html-server-only>
    `;
  }
}
