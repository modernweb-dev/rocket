export class LayoutSitemap {
  /**
   * @param {object} options
   * @param {import('../web-menu/PageTree.js').PageTree} options.pageTree
   * @param {string} options.absoluteBaseUrl
   */
  constructor({ pageTree, absoluteBaseUrl }) {
    this.pageTree = pageTree;
    this.absoluteBaseUrl = absoluteBaseUrl;
  }

  render() {
    return `
      <?xml version="1.0" encoding="utf-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${this.pageTree.all().map(
          page => `
          <url>
            <loc>${this.absoluteBaseUrl}${page.model.url}</loc>
            <lastmod>${page.model.lastmod || new Date().toISOString()}</lastmod>
            <changefreq>${page.model.changefreq || 'monthly'}</changefreq>
          </url>
        `,
        )}
      </urlset>
    `;
  }
}
