import assert from 'node:assert/strict';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { describe, it } from 'node:test';

import { RocketSocialLink } from './RocketSocialLink.js';

describe('Test RocketSocialLink', () => {
  it('01: renders an icon-only social link', async () => {
    const link = new RocketSocialLink();
    link.url = 'https://github.com/modernweb-dev/rocket';
    link.name = 'GitHub';
    link.siteName = 'Rocket';

    const body = await ssrRender(link.render());

    assert.match(body, /href="https:\/\/github\.com\/modernweb-dev\/rocket"/);
    assert.match(body, /aria-label="Rocket on GitHub"/);
    assert.doesNotMatch(body, /class="sr-only"/);
    assert.doesNotMatch(body, /class="label"/);
  });

  it('02: renders optional visible label text', async () => {
    const link = new RocketSocialLink();
    link.url = 'https://github.com/modernweb-dev/rocket';
    link.name = 'GitHub';
    link.label = 'Open Source';
    link.siteName = 'Rocket';

    const body = await ssrRender(link.render());

    assert.match(body, /aria-label="Open Source: Rocket on GitHub"/);
    assert.match(body, /<span class="label">[\s\S]*Open Source[\s\S]*<\/span>/);
  });

  it('03: uses an explicit accessible label when provided', async () => {
    const link = new RocketSocialLink();
    link.url = 'https://www.npmjs.com/package/@rocket/js';
    link.name = 'npm';
    link.label = 'Published on npm';
    link.ariaLabel = 'Published on npm';

    const body = await ssrRender(link.render());

    assert.match(body, /aria-label="Published on npm"/);
    assert.doesNotMatch(body, /class="sr-only"/);
  });
});

/**
 * @param {unknown} template
 */
async function ssrRender(template) {
  return collectResult(render(template));
}
