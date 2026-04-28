/**
 * @param {{
 *   config: import('@rocket/js/types.js').SiteHeadMetadataConfig;
 *   pageMetadata: import('@rocket/js/types.js').PageMetadata;
 *   pageSiteHeadMetadata?: import('@rocket/js/types.js').PageSiteHeadMetadataConfig;
 *   defaultSocialPreviewImage?: string;
 *   pathname: string;
 *   siteOrigin: string;
 * }} options
 * @returns {import('@rocket/js/types.js').SiteHeadMetadata}
 */
export function createSiteHeadMetadata({
  config,
  pageMetadata,
  pageSiteHeadMetadata,
  defaultSocialPreviewImage,
  pathname,
  siteOrigin,
}) {
  const socialPreviewImage = pageSiteHeadMetadata?.socialPreview?.image
    ? resolveSocialPreviewImage(pageSiteHeadMetadata.socialPreview.image, pathname, siteOrigin)
    : defaultSocialPreviewImage;
  return {
    siteName: config.siteName,
    defaultDescription: config.defaultDescription,
    language: config.language,
    ...(config.icons ? { icons: config.icons } : {}),
    ...(config.themeColor ? { themeColor: config.themeColor } : {}),
    ...(pageSiteHeadMetadata?.indexing ? { indexing: pageSiteHeadMetadata.indexing } : {}),
    ...(socialPreviewImage ? { socialPreview: { image: socialPreviewImage } } : {}),
    title: pathname === '/' ? config.siteName : `${pageMetadata.title} | ${config.siteName}`,
    description: pageMetadata.description || config.defaultDescription,
    canonicalUrl: new URL(pathname, `${siteOrigin}/`).href,
  };
}

/**
 * @param {string} image
 * @param {string} pathname
 * @param {string} siteOrigin
 */
function resolveSocialPreviewImage(image, pathname, siteOrigin) {
  if (isAbsoluteHttpUrl(image)) {
    return image;
  }
  if (image.startsWith('/')) {
    return new URL(image, `${siteOrigin}/`).href;
  }
  return new URL(image, new URL(pageDocumentPath(pathname), `${siteOrigin}/`)).href;
}

/**
 * @param {string} value
 */
function isAbsoluteHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {string} pathname
 */
function pageDocumentPath(pathname) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}
