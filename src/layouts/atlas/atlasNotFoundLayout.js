import { html } from 'lit';
import { document } from '../layout-helper.js';
import { resolve } from '../../resolve.js';
import { renderHeaderLogo, renderStylesheets } from './atlasDocLayout.js';

/** @type {import('@rocket/js/types.js').Components} */
export const atlasNotFoundComponents = {};

/**
 * @param {Array<{url: string, name: string, label?: string}>} socials
 */
function renderSocialLinks(socials) {
  return socials.map(social => html`<a href=${social.url}>${social.label ?? social.name}</a>`);
}

/** @type {import('@rocket/js/types.js').Layout<import('@rocket/js/types.js').DocData>} */
export const atlasNotFoundLayout = (pageData, data) => {
  const homeLink = data.headerData.homeLink || '/';
  const rocketLogo = data.headerData.logo[0];
  const siteName = pageData.siteHeadMetadata?.siteName ?? pageData.title;
  const headContent = data.headContent?.({ pageData });

  return document(
    pageData,
    html`
      <div class="atlas-not-found">
        <header class="atlas-not-found-header">
          <a href=${homeLink} class="atlas-not-found-logo">
            ${renderHeaderLogo(data.headerData.logo, siteName)}
          </a>
          <nav class="atlas-not-found-links" aria-label="Project links">
            ${renderSocialLinks(data.headerData.socials)}
          </nav>
        </header>

        <main class="atlas-not-found-main">
          <div class="atlas-not-found-copy">${pageData.content}</div>

          <div class="atlas-not-found-scene" aria-hidden="true">
            <div class="atlas-not-found-stars"></div>
            <div class="atlas-not-found-orbit"></div>
            <p class="atlas-not-found-code">404</p>
            ${
              rocketLogo
                ? html`<img class="atlas-not-found-rocket" src=${rocketLogo} alt="" />`
                : html``
            }
          </div>
        </main>
      </div>
    `,
    {
      menu: false,
      headContent: html`<link
          rel="stylesheet"
          href="${resolve('@rocket/js/layouts/atlasNotFound.css', import.meta)}"
        />
        ${renderStylesheets(data.stylesheets)} ${headContent}`,
    },
  );
};
