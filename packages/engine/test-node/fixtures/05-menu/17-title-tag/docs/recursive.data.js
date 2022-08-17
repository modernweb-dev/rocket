import { PageTree } from '@rocket/engine';
import { html } from 'lit';

const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../__output', import.meta.url),
});

await pageTree.restore();

const titleWrapperFn = title => (title ? `${title} | Rocket` : '');

export const layout = data => {
  const title = titleWrapperFn(pageTree.getPage(data.sourceRelativeFilePath)?.model?.name);
  return html`
    <html>
      <head>
        <title-server-only>${title}</title-server-only>
      </head>
    </html>
    <body>
      <main>${data.content()}</main>
    </body>
    </html>
  `;
};

export { html };
