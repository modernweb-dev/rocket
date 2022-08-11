import { PageTree } from '@rocket/engine';
import { LayoutSidebar } from '@rocket/launch';
import { footerMenu } from './__shared/footerMenu.js';
import { html } from 'lit';

export const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../_site', import.meta.url),
});
await pageTree.restore();

export const layout = new LayoutSidebar({ pageTree, footerMenu });

export { html };

// export const openGraphLayout = new OpenGraphLayoutLogo();
