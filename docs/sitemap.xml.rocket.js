/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'sitemap.xml.rocket.js';
import { pageTree, setupUnifiedPlugins, footerMenu } from './recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu };
/* END - Rocket auto generated - do not touch */

export const layout = false;

import rocketConfig from '../rocket.config.js';

export default () => `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${pageTree.all().map(
  page => `
  <url>
    <loc>${rocketConfig.absoluteBaseUrl}${page.model.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
  </url>
`,
)}

</urlset>
`;
