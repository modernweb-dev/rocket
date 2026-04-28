/** Runs on: imported-md-string */
import { html } from '@lit-labs/ssr';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defaultHtmlMenu } from '../menu.js';

/** @typedef {import('lit/directive.js').DirectiveResult | import('lit').TemplateResult} LitHTML */

/**
 * @param {import("../../exports/PageData.js").PageData} data
 * @param {LitHTML} content
 * @param {Object} [options]
 * @param {LitHTML} [options.title]
 * @param {'html' | false} [options.menu] render a default menu. set to false if you want your own
 * @param {LitHTML} [options.headerContent]
 */
export function document(
  data,
  content,
  {
    title = data.siteHeadMetadata?.title ?? data.title,
    menu = 'html',
    headerContent = undefined,
  } = {},
) {
  const siteHeadMetadata = data.siteHeadMetadata;
  return html`<!DOCTYPE html>
    <html lang=${ifDefined(siteHeadMetadata?.language)}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        ${siteHeadMetadataTemplate(siteHeadMetadata)}
        ${menu
          ? html`<style>
              body {
                display: flex;
              }
              #menu {
                margin-right: 1em;
              }
            </style>`
          : ''}
        ${data.clientCode} ${headerContent}
      </head>
      <body>
        ${menu
          ? html`<div id="menu">${defaultHtmlMenu(data.pageTree)}</div>
              <div id="content">${content}</div>`
          : content}
      </body>
    </html>`;
}

/**
 * @param {import('@rocket/js/types.js').SiteHeadMetadata | undefined} metadata
 */
function siteHeadMetadataTemplate(metadata) {
  if (!metadata) {
    return '';
  }
  return html`
    <meta name="description" content=${metadata.description} />
    ${metadata.indexing === 'noindex' ? html`<meta name="robots" content="noindex" />` : ''}
    <link rel="canonical" href=${metadata.canonicalUrl} />
    ${metadata.icons?.ico ? html`<link rel="icon" href=${metadata.icons.ico} sizes="any" />` : ''}
    ${metadata.icons?.svg
      ? html`<link rel="icon" href=${metadata.icons.svg} type="image/svg+xml" />`
      : ''}
    ${metadata.icons?.appleTouchIcon
      ? html`<link rel="apple-touch-icon" href=${metadata.icons.appleTouchIcon} />`
      : ''}
    ${metadata.themeColor ? html`<meta name="theme-color" content=${metadata.themeColor} />` : ''}
    <meta property="og:site_name" content=${metadata.siteName} />
    <meta property="og:title" content=${metadata.title} />
    <meta property="og:description" content=${metadata.description} />
    <meta property="og:url" content=${metadata.canonicalUrl} />
    <meta property="og:type" content="website" />
    ${metadata.socialPreview?.image
      ? html`<meta property="og:image" content=${metadata.socialPreview.image} />`
      : ''}
    <meta
      name="twitter:card"
      content=${metadata.socialPreview?.image ? 'summary_large_image' : 'summary'}
    />
    <meta name="twitter:title" content=${metadata.title} />
    <meta name="twitter:description" content=${metadata.description} />
    <meta name="twitter:url" content=${metadata.canonicalUrl} />
    ${metadata.socialPreview?.image
      ? html`<meta name="twitter:image" content=${metadata.socialPreview.image} />`
      : ''}
  `;
}
