/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'blog.rocket.js';
import { html, baseHead, getSanityImageURL } from './recursive.data.js';
export { html, baseHead, getSanityImageURL };
/* END - Rocket auto generated - do not touch */

import { client } from '../src/lib/sanityClient.js';
const query = `*[_type == 'post' && publishedAt < now()]`;
let data = await client.fetch(query).catch(err => console.log(err));

const posts = data.map(
  post => html` <li><a href=${`/posts/${post.slug.current}`}>${post.title}</a></li> `,
);

const title = 'Blog ⚠️ IN DEVELOPMENT';
const description = 'Blog';
const permalink = `/blog`;

export default () => html`
  <html lang="en">
    <head>
      ${baseHead({ title, description, permalink })}
    </head>
    <body>
      <main>
        <h1>${title}</h1>
        <h2>Posts</h2>
        <ul>
          ${posts}
        </ul>
      </main>
    </body>
  </html>
`;
