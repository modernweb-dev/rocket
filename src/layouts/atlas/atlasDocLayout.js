import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { document } from '../layout-helper.js';
import { resolve } from '../../resolve.js';
import { webAwesomeComponents } from '@rocket/js/components/web-awesome.js';
import { addBootstrapIconLibrary } from '../layout.js';
import { pageNavigationLinks } from '../../menus/pageNavigation.js';
import { rocketDemoComponents } from '../../components.js';

export const DEFAULT_ATLAS_DOC_NAVIGATION_ICON_SERVER_BUDGET = 35;

/** @type {import('@rocket/js/types.js').Components} */
export const atlasDocComponents = {
  'rocket-menu': {
    file: './menus/RocketMenu.js',
    className: 'RocketMenu',
    loading: 'server',
  },
  'rocket-toc': {
    file: './menus/RocketToc.js',
    className: 'RocketToc',
    loading: 'hydrate:onVisible',
  },
  'rocket-next-page': {
    file: './menus/RocketNextPage.js',
    className: 'RocketNextPage',
    loading: 'server',
  },
  'rocket-previous-page': {
    file: './menus/RocketPreviousPage.js',
    className: 'RocketPreviousPage',
    loading: 'server',
  },
  'rocket-social-link': {
    file: './components/RocketSocialLink.js',
    className: 'RocketSocialLink',
    loading: 'server',
  },
  ...rocketDemoComponents,
  ...webAwesomeComponents,
};

/**
 * Render socials as rocket-social-link elements.
 * @param {Array<{url: string, name: string, label?: string}>} socials
 * @param {string} siteName
 */
export function renderSocials(socials, siteName) {
  return socials.map(
    social => html`
      <rocket-social-link
        url=${social.url}
        name=${social.name}
        label=${ifDefined(social.label)}
        siteName=${siteName}
        slot="social"
      ></rocket-social-link>
    `,
  );
}

/**
 * Renders the header logo.
 * If a single image is provided, it will be used as the logo.
 * If two images are provided, the first will be used as the logo (make sure to provide it without any surrounding text) and the second as the text.
 * @param {Array<string>} logo
 * @param {string} siteName
 */
export function renderHeaderLogo(logo, siteName) {
  if (logo.length === 1) {
    return html`<img src=${logo[0]} alt=${siteName} width="130" slot="logo" />`;
  } else if (logo.length === 2) {
    return html`
      <img src=${logo[0]} alt="" width="36" slot="logo" />
      <img src=${logo[1]} alt=${siteName} width="88" slot="logo" />
    `;
  } else {
    return html`<b>Header logo should only contain one or two images.</b>`;
  }
}

/**
 * @param {import('@rocket/js/types.js').HomeNavLink} link
 */
export function renderHeaderNavLink(link) {
  const isExternal = link.external ?? link.href.startsWith('http');

  if (isExternal) {
    return html`
      <a href=${link.href} target="_blank" rel="noopener noreferrer">
        ${link.text}
        <rocket-icon library="bootstrap" name="arrow-up-right" aria-hidden="true"></rocket-icon>
      </a>
    `;
  }

  return html`<a href=${link.href}>${link.text}</a>`;
}

/**
 * @param {import('@rocket/js/types.js').HomeNavLink[]} links
 */
export function renderHeaderNavLinks(links = []) {
  return links.map(link => renderHeaderNavLink(link));
}

/**
 * @param {import('@rocket/js/types.js').HomeNavLink[]} links
 */
export function renderHeaderNav(links = []) {
  if (!links.length) {
    return html``;
  }

  return html`
    <nav class="home-nav" slot="navigation" aria-label="Primary navigation">
      ${renderHeaderNavLinks(links)}
    </nav>
  `;
}

/**
 * @param {string[] | undefined} stylesheets
 */
export function renderStylesheets(stylesheets = []) {
  return stylesheets.map(href => html`<link rel="stylesheet" href=${href} />`);
}

/**
 * @param {import('@rocket/js/types.js').PageMetadataCustomValue | undefined} customValue
 * @returns {import('@rocket/js/types.js').AtlasDocAsideTip | false | undefined}
 */
export function resolveAsideTip(customValue) {
  const atlasDocCustom = readRecord(customValue);
  return atlasDocCustom ? normalizeAsideTip(atlasDocCustom.asideTip) : undefined;
}

/**
 * @param {import('@rocket/js/types.js').AtlasDocAsideTip | false | undefined} asideTip
 */
export function renderAsideTip(asideTip) {
  if (!asideTip) {
    return '';
  }

  return html`
    <div class="atlas-tip-card">
      <rocket-icon
        library="bootstrap"
        name=${asideTip.iconName || 'rocket-takeoff'}
        aria-hidden="true"
      ></rocket-icon>
      <div>
        <h2>${asideTip.title || 'Tip'}</h2>
        <p>${asideTip.description}</p>
      </div>
    </div>
  `;
}

/**
 * @param {import('@rocket/js/types.js').PageMetadataCustomValue | undefined} value
 * @returns {import('@rocket/js/types.js').AtlasDocAsideTip | false | undefined}
 */
function normalizeAsideTip(value) {
  if (value === undefined || value === false) {
    return value;
  }

  const tip = readRecord(value);
  if (!tip || typeof tip.description !== 'string') {
    return undefined;
  }

  return {
    ...(typeof tip.title === 'string' ? { title: tip.title } : {}),
    description: tip.description,
    ...(typeof tip.iconName === 'string' ? { iconName: tip.iconName } : {}),
  };
}

/**
 * @param {import('@rocket/js/types.js').PageMetadataCustomValue | undefined} value
 * @returns {Record<string, import('@rocket/js/types.js').PageMetadataCustomValue> | undefined}
 */
function readRecord(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return /** @type {Record<string, import('@rocket/js/types.js').PageMetadataCustomValue>} */ (
    value
  );
}

/**
 * @param {import('@rocket/js/types.js').TableOfContents} toc
 */
function serializeToc(toc) {
  return JSON.stringify(toc);
}

/** @type {import('@rocket/js/types.js').Layout<import('@rocket/js/types.js').DocData>} */
export const atlasDocLayout = (pageData, data) => {
  addBootstrapIconLibrary(pageData);
  const cssPath = resolve('@rocket/js/docs/assets/prism-one-light.css', import.meta);
  const siteName = pageData.siteHeadMetadata?.siteName ?? pageData.title;
  const asideTip = resolveAsideTip(pageData.metadata.custom?.atlasDoc);
  const pageNavigation = pageNavigationLinks(pageData.pageTree, pageData.url);
  const serializedToc = serializeToc(pageData.toc);
  const navigationIconServerBudget =
    data.navigationIconServerBudget ?? DEFAULT_ATLAS_DOC_NAVIGATION_ICON_SERVER_BUDGET;

  return document(
    pageData,
    html`
      <wa-page class="atlas-page" mobile-breakpoint="945px">
        <header slot="header" class="atlas-header">
          <a href=${data.headerData.homeLink} class="logo-header">
            ${renderHeaderLogo(data.headerData.logo, siteName)}
          </a>
          <nav class="atlas-header-links" aria-label="Primary navigation">
            ${renderHeaderNavLinks(data.headerData.navLinks)}
            ${renderSocials(data.headerData.socials, siteName)}
          </nav>
        </header>

        <nav
          slot="navigation"
          class="atlas-navigation"
          aria-label="Documentation"
          icon-loading-region="atlas-navigation"
          icon-server-budget=${navigationIconServerBudget}
        >
          <rocket-menu .pageTree=${pageData.pageTree} .currentPath=${pageData.url}></rocket-menu>
        </nav>

        <div slot="subheader" class="atlas-mobile-toc">
          <details>
            <summary>On this page</summary>
            <rocket-toc toc=${serializedToc}></rocket-toc>
          </details>
        </div>

        <main id="content" class="atlas-content">${pageData.content}</main>

        ${pageNavigation.previous || pageNavigation.next
          ? html`<nav id="prev-next" slot="main-footer" class="atlas-prev-next" aria-label="Page">
              ${pageNavigation.previous
                ? html`<rocket-previous-page
                    .pageTree=${pageData.pageTree}
                    .currentPath=${pageData.url}
                  ></rocket-previous-page>`
                : ''}
              ${pageNavigation.next
                ? html`<rocket-next-page
                    .pageTree=${pageData.pageTree}
                    .currentPath=${pageData.url}
                  ></rocket-next-page>`
                : ''}
            </nav>`
          : ''}

        <aside slot="aside" class="atlas-toc">
          <rocket-toc toc=${serializedToc}></rocket-toc>
          ${renderAsideTip(asideTip)}
        </aside>
      </wa-page>
    `,
    {
      menu: false,
      headerContent: html`
        <link rel="stylesheet" href=${cssPath} />
        <link
          rel="stylesheet"
          href="${resolve('@awesome.me/webawesome/dist/styles/webawesome.css', import.meta)}"
        />
        <link rel="stylesheet" href="${resolve('@rocket/js/layouts/atlasDoc.css', import.meta)}" />
        ${renderStylesheets(data.stylesheets)}
      `,
    },
  );
};
