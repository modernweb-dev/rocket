import { html } from '@rocket/engine';
import { baseHead } from '../parts/baseHead.js';
import { blogHeader } from '../parts/blog-header.js';

import '../components/blog-post.js';

export class LayoutBlogPost {
  render(data) {
    const { title, description, publishDate, author, heroImage, permalink, alt, lang } = data;
    console.log({ title, description, publishDate, author, heroImage, permalink, alt, lang });
    return html`
      <html-server-only lang=${lang || 'en'}>
        <head>
          ${baseHead({ title, description, permalink })}
        </head>

        <body>
          ${blogHeader()}
          <div class="wrapper">
            <blog-post title2=${title} author=${author} hero-image=${heroImage} publish-date=${publishDate} alt2=${alt}>
              ${data.content()}
            </blog-post>
          </div>
        </body>
      </html-server-only>
    `;
  }
}
