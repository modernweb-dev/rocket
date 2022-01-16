import { PageTree, SiteMenu } from '@rocket/engine';
import { html } from 'lit-html';

const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../__output', import.meta.url),
});

await pageTree.restore();

export function layout(data) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        ${pageTree.renderMenu(new SiteMenu(), data.sourceRelativeFilePath)} ${data.content()}
      </body>
    </html>`;
}
