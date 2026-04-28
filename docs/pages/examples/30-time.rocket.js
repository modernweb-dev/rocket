import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export { components };

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, { pageData }) => {
  const now = new Date();
  const url = new URL(request.url);

  pageData.content = html`
    <h1>Server Time Page</h1>

    <p>
      This JavaScript Page runs at request time. Refresh the browser to render a new timestamp from
      the server environment.
    </p>

    <section class="time-example" aria-labelledby="time-heading">
      <h2 id="time-heading">Current render</h2>
      <dl>
        <div>
          <dt>ISO time</dt>
          <dd><time datetime=${now.toISOString()}>${now.toISOString()}</time></dd>
        </div>
        <div>
          <dt>Request method</dt>
          <dd>${request.method}</dd>
        </div>
        <div>
          <dt>Pathname</dt>
          <dd><code>${url.pathname}</code></dd>
        </div>
      </dl>
    </section>

    <h2>What this example shows</h2>

    <ul>
      <li>The Page file is <code>docs/pages/examples/30-time.rocket.js</code>.</li>
      <li>The Page config uses <code>render: 'server'</code>.</li>
      <li>The Page receives <code>context.pageData</code> from Rocket.</li>
      <li>The Page passes that same <code>pageData</code> into <code>atlasDocLayout</code>.</li>
    </ul>

    <style>
      .time-example {
        border: 1px solid #d7dde6;
        border-radius: 8px;
        margin: 1.5rem 0;
        padding: 1rem;
      }

      .time-example h2 {
        margin-top: 0;
      }

      .time-example dl {
        display: grid;
        gap: 0.75rem;
        margin: 0;
      }

      .time-example dl > div {
        display: grid;
        gap: 0.2rem;
      }

      .time-example dt {
        color: #4b5563;
        font-size: 0.9rem;
        font-weight: 700;
      }

      .time-example dd {
        margin: 0;
      }
    </style>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, globalData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = {
  path: '/examples/time',
  metadata: {
    title: 'Server Time Page',
    description: 'See a server-rendered JavaScript Page produce a fresh timestamp per request.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Server page tip',
          description:
            'Use no-store or equivalent caching when a server-rendered Page should produce fresh output on every request.',
        },
      },
    },
  },
  render: 'server',
  menu: {
    iconName: 'clock-history',
    order: 30,
  },
};
