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
          <strong>Find Us</strong><br />
          Modern Web<br />
          Internet 12<br />
          0000 Web<br />
          <a href="#">office@modern-web.dev</a><br />
          <a href="#">0000 / 11223344</a>
        </div>

        <div class="legal">
          <strong>More</strong> <br />
          <a href="#">About</a><br />
          <a href="#">Us</a><br />
          <a href="#">Welcome</a><br />
        </div>
      </rocket-columns>
    </rocket-content-area>
  `,
};
