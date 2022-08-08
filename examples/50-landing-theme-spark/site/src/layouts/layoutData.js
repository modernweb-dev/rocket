import { html } from 'lit';

import { PageTree } from '@rocket/engine';

export const pageTree = new PageTree();
await pageTree.restore(new URL('../../pages/pageTreeData.rocketGenerated.json', import.meta.url));

export const layoutData = {
  pageTree,
  titleWrapperFn: title => title,
  description: 'Welcome to the Rocket Spark Landing Page example',
  siteName: 'Rocket',

  head__150: html`<link rel="stylesheet" href="resolve:#src/css/page.css" />`,

  footer__10: html`
    <rocket-content-area>
      <rocket-columns>
        <div>
          <strong>Kontakt</strong><br />
          Die PotentialBooster<br />
          Kaiserfeldgasse 22<br />
          8010 Graz<br />
          <a href="mailto:office@potentialbooster.at">office@potentialbooster.at</a><br />
          <a href="tel:00436764415897">0676 / 4415897</a>
        </div>

        <div class="legal">
          <strong>Rechtliches</strong> <br />
          <a href="#">Impressum</a><br />
          <a href="#">Datenschutz</a><br />
          <a href="#">AGB</a><br />
        </div>
      </rocket-columns>
    </rocket-content-area>
  `,
};
