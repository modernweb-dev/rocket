import {
  DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
  captureSocialPreviewImageWithBrowser,
  createSocialPreviewTemplateHtml,
  createSocialPreviewTemplateData,
  publicSocialPreviewPages,
} from './socialPreviewImages.js';
import { createSiteHeadMetadata } from './siteHeadMetadata.js';
import { readFileSync } from 'node:fs';

export const SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH = '/_rocket/social-preview-template-preview';
export const SOCIAL_PREVIEW_TEMPLATE_PREVIEW_TEMPLATE_PATH = `${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/template`;
export const SOCIAL_PREVIEW_TEMPLATE_PREVIEW_IMAGE_PATH = `${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/image.png`;
export const SOCIAL_PREVIEW_TEMPLATE_PREVIEW_COMPONENT_PATH = `${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/SocialPreviewPlayground.js`;
export const SOCIAL_PREVIEW_TEMPLATE_PREVIEW_DEFAULT_TEMPLATE_PATH = `${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/defaultSocialPreviewTemplate.js`;

const socialPreviewPlaygroundModuleUrl = new URL('./SocialPreviewPlayground.js', import.meta.url);
const defaultSocialPreviewTemplateModuleUrl = new URL(
  './defaultSocialPreviewTemplate.js',
  import.meta.url,
);

/**
 * @param {Request} request
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   siteHeadMetadata?: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin?: string;
 *   captureSocialPreviewImage?: import('./socialPreviewImages.js').SocialPreviewCapture;
 * }} options
 * @returns {Promise<Response | undefined>}
 */
export async function serveSocialPreviewTemplatePreview(
  request,
  {
    pages,
    siteHeadMetadata,
    siteOrigin,
    captureSocialPreviewImage = captureSocialPreviewImageWithBrowser,
  },
) {
  const url = new URL(request.url);
  if (
    !isSocialPreviewTemplatePreviewIndexPath(url.pathname) &&
    !socialPreviewTemplatePreviewResourcePaths.has(url.pathname)
  ) {
    return undefined;
  }
  if (url.pathname === SOCIAL_PREVIEW_TEMPLATE_PREVIEW_COMPONENT_PATH) {
    return socialPreviewTemplatePreviewModuleResponse(
      readFileSync(socialPreviewPlaygroundModuleUrl, 'utf8'),
    );
  }
  if (url.pathname === SOCIAL_PREVIEW_TEMPLATE_PREVIEW_DEFAULT_TEMPLATE_PATH) {
    return socialPreviewTemplatePreviewModuleResponse(
      readFileSync(defaultSocialPreviewTemplateModuleUrl, 'utf8'),
    );
  }
  if (!siteHeadMetadata?.socialPreview) {
    return new Response('Social Preview Template Preview is not configured', { status: 404 });
  }
  const previewPages = publicSocialPreviewPages(pages);
  const selection = selectSocialPreviewTemplatePreviewPage(url, previewPages);
  if (!selection) {
    const pagePath = socialPreviewTemplatePreviewPagePath(url) ?? '(none)';
    return new Response(`Page not found for Social Preview Template Preview: ${pagePath}`, {
      status: 404,
    });
  }
  const { page, pagePath } = selection;
  const previewSiteOrigin = siteOrigin ?? url.origin;
  if (isSocialPreviewTemplatePreviewIndexPath(url.pathname)) {
    return new Response(
      socialPreviewTemplatePreviewWorkflowHtml({
        url,
        page,
        pagePath,
        previewPages,
        siteHeadMetadata,
        siteOrigin: previewSiteOrigin,
      }),
      {
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      },
    );
  }
  const { html } = createSocialPreviewTemplateHtml({
    page,
    pagePath,
    siteHeadMetadata,
    siteOrigin: previewSiteOrigin,
    overrides: socialPreviewTemplatePreviewOverrides(url),
  });
  if (url.pathname === SOCIAL_PREVIEW_TEMPLATE_PREVIEW_IMAGE_PATH) {
    const data = await captureSocialPreviewImage({
      html,
      width: DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
      height: DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
      pathname: pagePath,
    });
    return new Response(arrayBufferBody(data), {
      headers: {
        'content-type': 'image/png',
      },
    });
  }
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-rocket-social-preview-width': String(DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH),
      'x-rocket-social-preview-height': String(DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT),
    },
  });
}

/**
 * @param {string} pathname
 */
function isSocialPreviewTemplatePreviewIndexPath(pathname) {
  return (
    pathname === SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH ||
    pathname === `${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/`
  );
}

const socialPreviewTemplatePreviewResourcePaths = new Set([
  SOCIAL_PREVIEW_TEMPLATE_PREVIEW_TEMPLATE_PATH,
  SOCIAL_PREVIEW_TEMPLATE_PREVIEW_IMAGE_PATH,
  SOCIAL_PREVIEW_TEMPLATE_PREVIEW_COMPONENT_PATH,
  SOCIAL_PREVIEW_TEMPLATE_PREVIEW_DEFAULT_TEMPLATE_PATH,
]);

/**
 * @param {URL} url
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 */
function selectSocialPreviewTemplatePreviewPage(url, pages) {
  const requestedPagePath = socialPreviewTemplatePreviewPagePath(url);
  const pagePath = requestedPagePath ?? pages.keys().next().value;
  if (!pagePath) {
    return undefined;
  }
  const page = pages.get(pagePath) ?? pages.get(stripTrailingSlash(pagePath));
  if (!page) {
    return undefined;
  }
  return { pagePath: pages.has(pagePath) ? pagePath : stripTrailingSlash(pagePath), page };
}

/**
 * @param {URL} url
 */
function socialPreviewTemplatePreviewPagePath(url) {
  const target =
    url.searchParams.get('page') || url.searchParams.get('path') || url.searchParams.get('url');
  if (!target) {
    return undefined;
  }
  return new URL(target, url.origin).pathname;
}

/**
 * @param {{
 *   url: URL;
 *   page: import('@rocket/js/types.js').Page;
 *   pagePath: string;
 *   previewPages: import('@rocket/js/types.js').PageRegistry;
 *   siteHeadMetadata: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin: string;
 * }} options
 */
function socialPreviewTemplatePreviewWorkflowHtml({
  url,
  page,
  pagePath,
  previewPages,
  siteHeadMetadata,
  siteOrigin,
}) {
  const pageValues = socialPreviewTemplatePreviewPageValues({
    page,
    pagePath,
    siteHeadMetadata,
    siteOrigin,
  });
  const overrides = socialPreviewTemplatePreviewOverrides(url);
  const formValues = {
    title: overrides.title ?? pageValues.title,
    description: overrides.description ?? pageValues.description,
  };
  const pages = socialPreviewTemplatePreviewPagesData({
    pages: previewPages,
    siteHeadMetadata,
    siteOrigin,
  });
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Social Preview Template Preview</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; padding: 24px; font-family: system-ui, sans-serif; background: #f4f6f8; color: #111827; }
      rocket-social-preview-playground { display: block; max-width: 1660px; margin: 0 auto; }
      @media (max-width: 920px) { body { padding: 16px; } }
    </style>
    <script type="module">
      import { SocialPreviewPlayground } from '${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_COMPONENT_PATH}';

      if (!customElements.get('rocket-social-preview-playground')) {
        customElements.define('rocket-social-preview-playground', SocialPreviewPlayground);
      }
    </script>
  </head>
  <body>
    <rocket-social-preview-playground
      show-pages
      show-download
      sync-history
      controls-position="left"
      selected-path="${escapeHtml(pagePath)}"
      preview-title="${escapeHtml(formValues.title)}"
      preview-description="${escapeHtml(formValues.description)}"
      template-url="${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_TEMPLATE_PATH}"
      image-url="${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_IMAGE_PATH}"
      workflow-url="${SOCIAL_PREVIEW_TEMPLATE_PREVIEW_BASE_PATH}/"
    >
      <script type="application/json" data-social-preview-pages>${safeJsonScript(pages)}</script>
    </rocket-social-preview-playground>
  </body>
</html>`;
}

/**
 * @param {{
 *   pages: import('@rocket/js/types.js').PageRegistry;
 *   siteHeadMetadata: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin: string;
 * }} options
 */
function socialPreviewTemplatePreviewPagesData({ pages, siteHeadMetadata, siteOrigin }) {
  return [...pages].map(([path, page]) => {
    const values = socialPreviewTemplatePreviewPageValues({
      page,
      pagePath: path,
      siteHeadMetadata,
      siteOrigin,
    });
    return {
      path,
      title: values.title,
      description: values.description,
      downloadFilename: socialPreviewTemplatePreviewDownloadFilename(path),
    };
  });
}

/**
 * @param {{
 *   page: import('@rocket/js/types.js').Page;
 *   pagePath: string;
 *   siteHeadMetadata: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   siteOrigin: string;
 * }} options
 */
function socialPreviewTemplatePreviewPageValues({ page, pagePath, siteHeadMetadata, siteOrigin }) {
  const metadata = createSiteHeadMetadata({
    config: siteHeadMetadata,
    pageMetadata: page.metadata,
    pageSiteHeadMetadata: page.module.config.siteHeadMetadata,
    pathname: pagePath,
    siteOrigin,
  });
  const templateData = createSocialPreviewTemplateData({
    metadata,
    pageMetadata: page.metadata,
    pathname: pagePath,
  });
  return {
    title: templateData.page.title,
    description: templateData.page.description,
  };
}

/**
 * @param {URL} url
 */
function socialPreviewTemplatePreviewOverrides(url) {
  const title = url.searchParams.get('title');
  const description = url.searchParams.get('description');
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

/**
 * @param {string} pagePath
 */
function socialPreviewTemplatePreviewDownloadFilename(pagePath) {
  const slug = pagePath.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';
  return `social-preview-${slug.replace(/[^a-zA-Z0-9._-]+/g, '-')}.png`;
}

/**
 * @param {string} source
 */
function socialPreviewTemplatePreviewModuleResponse(source) {
  return new Response(source, {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
    },
  });
}

/**
 * @param {unknown} value
 */
function safeJsonScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

/**
 * @param {Uint8Array} data
 * @returns {ArrayBuffer}
 */
function arrayBufferBody(data) {
  const buffer = Buffer.from(data);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/**
 * @param {string} value
 */
function stripTrailingSlash(value) {
  return value === '/' ? value : value.replace(/\/$/, '');
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
