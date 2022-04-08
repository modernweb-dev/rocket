/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, baseHead, getSanityImageURL } from './recursive.data.js';
export { html, baseHead, getSanityImageURL };
/* END - Rocket auto generated - do not touch */

import '../src/components/defaultHeader.js';

import { client } from '../src/lib/sanityClient.js';
const homePageQuery = `*[_type == 'homePage' && _id == 'homePage']`;
let homePageResponse = await client.fetch(homePageQuery).catch(err => console.log(err));
let homePageData = homePageResponse[0];

export const title = `${homePageData.heroTitle}`;
export const description = 'This is the homepage';
export const permalink = '/';

export default () => html`
  <html>
    <head>
      ${baseHead({ title, description, permalink })}
      <style>
        h1 {
          font-size: 3rem;
        }
        .home-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .left__section {
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 768px) {
          .home-wrapper {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="home-wrapper">
        <section class="left__section">
          <default-header></default-header>
          <div class="left-content__container">
            <h1>${homePageData.heroTitle}</h1>
            <p>${homePageData.description}</p>
            <a href="/about/">About Page</a>
            <a href="/contact/">Contact Page</a>
          </div>
        </section>
        <section class="right__section">
          <picture>
            <source
              srcset="${getSanityImageURL(homePageData.heroImage).format('webp').url()}"
              type="image/webp"
            />
            <img
              class="hero-image"
              src=${`${getSanityImageURL(homePageData.heroImage).url()}`}
              alt="${homePageData.heroTite}"
            />
          </picture>
        </section>
      </div>
    </body>
  </html>
`;
