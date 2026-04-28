export const DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH = 1200;
export const DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT = 630;

/**
 * @param {{
 *   site?: { language: string; name: string };
 *   page?: { title: string; documentTitle?: string; description: string; canonicalUrl: string };
 *   language?: string;
 *   siteName?: string;
 *   title?: string;
 *   description?: string;
 *   canonicalUrl?: string;
 * }} facts
 */
export function defaultSocialPreviewTemplate({
  site,
  page,
  language,
  siteName,
  title,
  description,
  canonicalUrl,
}) {
  language ??= site?.language;
  siteName ??= site?.name;
  title ??= page?.title;
  description ??= page?.description;
  canonicalUrl ??= page?.canonicalUrl;
  if (!language || !siteName || !title || !description || !canonicalUrl) {
    throw new Error('Default Social Preview Template requires complete site and Page facts.');
  }
  return `<!doctype html>
<html lang="${escapeHtml(language)}">
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      html,
      body {
        width: ${DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH}px;
        height: ${DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT}px;
        margin: 0;
      }
      body {
        display: grid;
        place-items: stretch;
        padding: 54px;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.42), transparent 34%),
          radial-gradient(circle at 84% 22%, rgba(168, 85, 247, 0.38), transparent 30%),
          linear-gradient(135deg, #0f172a 0%, #111827 52%, #020617 100%);
      }
      main {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100%;
        border: 1px solid rgba(248, 250, 252, 0.22);
        border-radius: 42px;
        padding: 58px 64px;
        background: rgba(15, 23, 42, 0.68);
        box-shadow: 0 24px 90px rgba(0, 0, 0, 0.32);
      }
      .site {
        margin: 0;
        color: #7dd3fc;
        font-size: 34px;
        font-weight: 800;
        letter-spacing: 0.035em;
        text-transform: uppercase;
      }
      h1 {
        max-width: 930px;
        margin: 38px 0 0;
        font-size: 76px;
        line-height: 0.98;
        letter-spacing: -0.055em;
      }
      .description {
        max-width: 900px;
        margin: 28px 0 0;
        color: #cbd5e1;
        font-size: 36px;
        line-height: 1.22;
      }
      .url {
        margin: 46px 0 0;
        color: #94a3b8;
        font-size: 26px;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <p class="site">${escapeHtml(siteName)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="description">${escapeHtml(description)}</p>
      </section>
      <p class="url">${escapeHtml(canonicalUrl)}</p>
    </main>
  </body>
</html>`;
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
