import { PageTree } from '@rocket/engine';
import { LayoutSidebar } from './_some-dependency/LayoutSidebar.js';

const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../__output', import.meta.url),
});
await pageTree.restore();

export const layout = new LayoutSidebar({ pageTree });
