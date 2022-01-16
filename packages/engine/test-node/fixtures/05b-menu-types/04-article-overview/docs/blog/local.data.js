import { PageTree, ArticleOverviewMenu } from '@rocket/engine';
import { html } from 'lit-html';

export const pageTree = new PageTree({
  inputDir: new URL('../', import.meta.url),
  outputDir: new URL('../../__output', import.meta.url),
});
await pageTree.restore();

export const layout = data => {
  return html`
    <div class="blog-intro">${data.content()}</div>
    ${pageTree.renderMenu(new ArticleOverviewMenu(), data.sourceRelativeFilePath)}
  `;
};
