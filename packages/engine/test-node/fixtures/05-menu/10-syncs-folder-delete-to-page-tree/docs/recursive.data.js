import { PageTree, ChildListMenu } from '@rocket/engine';
import { html } from 'lit';

const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../__output', import.meta.url),
});

await pageTree.restore();

export const layout = data => {
  return html`
    ${pageTree.renderMenu(new ChildListMenu(), data.sourceRelativeFilePath)}
    <main>${data.content()}</main>
  `;
};

export { html };
