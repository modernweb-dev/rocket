import { html } from 'lit';
import { document } from '../layout-helper.js';
import { resolve } from '../../resolve.js';
import { webAwesomeComponents } from '@rocket/js/components/web-awesome.js';
import { addBootstrapIconLibrary } from '../layout.js';
import { rocketDemoComponents } from '../../components.js';
import {
  renderHeaderLogo,
  renderHeaderNavLinks,
  renderSocials,
  renderStylesheets,
} from './atlasDocLayout.js';

/** @typedef {import('@rocket/js/types.js').BlogData} BlogData */
/** @typedef {import('@rocket/js/types.js').PageCollectionEntry} PageCollectionEntry */

/** @type {import('@rocket/js/types.js').Components} */
export const atlasBlogComponents = {
  'rocket-social-link': {
    file: './components/RocketSocialLink.js',
    className: 'RocketSocialLink',
    loading: 'server',
  },
  ...rocketDemoComponents,
  ...webAwesomeComponents,
};

/**
 * @param {string} date date-only ISO string from Page Metadata
 * @param {string | undefined} language
 */
export function formatBlogDate(date, language) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return new Intl.DateTimeFormat(language || 'en', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(parsed);
}

/**
 * @param {string[] | undefined} tags
 * @param {BlogData} data
 */
export function renderBlogTags(tags, data) {
  if (!tags || tags.length === 0) {
    return '';
  }
  return html`
    <ul class="atlas-blog-tags">
      ${tags.map(
        tag => html`
          <li>
            ${
              data.tagPathPrefix
                ? html`<a href=${blogTagPath(data.tagPathPrefix, tag)} rel="tag">${tag}</a>`
                : html`<span>${tag}</span>`
            }
          </li>
        `,
      )}
    </ul>
  `;
}

/**
 * @param {string} tagPathPrefix
 * @param {string} tag
 */
export function blogTagPath(tagPathPrefix, tag) {
  const prefix = tagPathPrefix.endsWith('/') ? tagPathPrefix : `${tagPathPrefix}/`;
  return `${prefix}${tag}/`;
}

/**
 * @param {import('@rocket/js/types.js').PageMetadata} metadata
 * @param {BlogData} data
 * @param {string | undefined} language
 */
export function renderBlogByline(metadata, data, language) {
  const authors = metadata.authors || [];
  if (!metadata.date && authors.length === 0 && !(metadata.tags || []).length) {
    return '';
  }
  return html`
    <div class="atlas-blog-byline">
      ${
        metadata.date
          ? html`<time datetime=${metadata.date}>${formatBlogDate(metadata.date, language)}</time>`
          : ''
      }
      ${authors.length ? html`<span class="atlas-blog-authors">${authors.join(', ')}</span>` : ''}
      ${renderBlogTags(metadata.tags, data)}
    </div>
  `;
}

/**
 * @param {PageCollectionEntry[]} items
 * @param {BlogData} data
 * @param {string | undefined} language
 */
export function renderBlogPostList(items, data, language) {
  if (items.length === 0) {
    return html`<p class="atlas-blog-empty">No posts yet.</p>`;
  }
  return html`
    <ol class="atlas-blog-post-list" reversed>
      ${items.map(
        item => html`
          <li class="atlas-blog-post-card">
            <h2><a href=${item.url}>${item.metadata.title}</a></h2>
            ${
              item.metadata.date
                ? html`<time datetime=${item.metadata.date}
                    >${formatBlogDate(item.metadata.date, language)}</time
                  >`
                : ''
            }
            ${item.metadata.description ? html`<p>${item.metadata.description}</p>` : ''}
            ${renderBlogTags(item.metadata.tags, data)}
          </li>
        `,
      )}
    </ol>
  `;
}

/**
 * @param {import('@rocket/js/types.js').PagePagination | undefined} pagination
 */
export function renderBlogPagination(pagination) {
  if (!pagination || pagination.totalPages <= 1) {
    return '';
  }
  return html`
    <nav class="atlas-blog-pagination" aria-label="Blog pages">
      ${
        pagination.previousPath
          ? html`<a href=${pagination.previousPath} rel="prev">Newer posts</a>`
          : html`<span></span>`
      }
      <span>Page ${pagination.currentPage} of ${pagination.totalPages}</span>
      ${
        pagination.nextPath
          ? html`<a href=${pagination.nextPath} rel="next">Older posts</a>`
          : html`<span></span>`
      }
    </nav>
  `;
}

/**
 * Shared Atlas blog document chrome for post and index layouts.
 *
 * @param {import('../../PageData.js').PageData} pageData
 * @param {BlogData} data
 * @param {unknown} mainContent
 */
function atlasBlogDocument(pageData, data, mainContent) {
  addBootstrapIconLibrary(pageData);
  const cssPath = resolve('@rocket/js/docs/assets/prism-one-light.css', import.meta);
  const siteName = pageData.siteHeadMetadata?.siteName ?? pageData.title;
  const headContent = data.headContent?.({ pageData });

  return document(
    pageData,
    html`
      <div class="atlas-blog">
        <header class="atlas-header atlas-blog-header">
          <a href=${data.headerData.homeLink} class="logo-header">
            ${renderHeaderLogo(data.headerData.logo, siteName)}
          </a>
          <nav class="atlas-header-links" aria-label="Primary navigation">
            ${renderHeaderNavLinks(data.headerData.navLinks)}
            ${renderSocials(data.headerData.socials, siteName)}
          </nav>
        </header>
        <main id="content" class="atlas-blog-content">${mainContent}</main>
      </div>
    `,
    {
      menu: false,
      headContent: html`
        <link rel="stylesheet" href=${cssPath} />
        <link
          rel="stylesheet"
          href="${resolve('@awesome.me/webawesome/dist/styles/webawesome.css', import.meta)}"
        />
        <link rel="stylesheet" href="${resolve('@rocket/js/layouts/atlasDoc.css', import.meta)}" />
        <link rel="stylesheet" href="${resolve('@rocket/js/layouts/atlasBlog.css', import.meta)}" />
        ${
          data.feedPath
            ? html`<link
                rel="alternate"
                type="application/atom+xml"
                href=${data.feedPath}
                title=${siteName}
              />`
            : ''
        }
        ${renderStylesheets(data.stylesheets)} ${headContent}
      `,
    },
  );
}

/** @type {import('@rocket/js/types.js').Layout<BlogData>} */
export const atlasPostLayout = (pageData, data) => {
  const language = pageData.siteHeadMetadata?.language;
  return atlasBlogDocument(
    pageData,
    data,
    html`
      <article class="atlas-blog-post">
        ${renderBlogByline(pageData.metadata, data, language)} ${pageData.content}
      </article>
    `,
  );
};

/** @type {import('@rocket/js/types.js').Layout<BlogData>} */
export const atlasBlogIndexLayout = (pageData, data) => {
  const language = pageData.siteHeadMetadata?.language;
  const items = pageData.pagination?.items || [];
  return atlasBlogDocument(
    pageData,
    data,
    html`
      <section class="atlas-blog-index">
        <div class="atlas-blog-intro">
          ${pageData.content}
          ${
            data.feedPath
              ? html`<a class="atlas-blog-feed-link" href=${data.feedPath}>
                  <rocket-icon library="bootstrap" name="rss" aria-hidden="true"></rocket-icon>
                  Feed
                </a>`
              : ''
          }
        </div>
        ${renderBlogPostList(items, data, language)} ${renderBlogPagination(pageData.pagination)}
      </section>
    `,
  );
};
