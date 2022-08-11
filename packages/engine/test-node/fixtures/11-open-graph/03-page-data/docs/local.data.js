import { PageTree } from '@rocket/engine';
import { html } from 'lit';

const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../__output', import.meta.url),
});

await pageTree.restore();

export const openGraphLayout = data => {
  return html`Open Graph: ${pageTree.getPage(data.sourceRelativeFilePath)?.model?.name}`;
};

export const layout = data => {
  const url = `http://localhost:8000/${data.openGraphOutputRelativeFilePath}`;
  const encodedUrl = encodeURIComponent(url);

  return html`
    <a href="https://v1.screenshot.11ty.dev/${encodedUrl}/opengraph/">Open Graph</a>
    <main>${data.content()}</main>
  `;
};
