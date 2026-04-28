import { findComponent } from './requestTimeDemoCatalog.js';

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, context) => {
  const component = findComponent(context.params.componentName);

  if (!component) {
    return new Response('Component not found', { status: 404 });
  }

  const name = escapeSvg(component.name);
  const summary = escapeSvg(component.summary);
  const status = escapeSvg(component.status);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img">
  <title>${name} request-time demo card</title>
  <rect width="1200" height="630" fill="#101820" />
  <rect x="72" y="72" width="1056" height="486" rx="28" fill="#f7f4ef" />
  <circle cx="1000" cy="172" r="72" fill="#d01a1c" />
  <text x="120" y="180" fill="#d01a1c" font-family="Arial, sans-serif" font-size="36">
    Rocket request-time demo
  </text>
  <text x="120" y="300" fill="#101820" font-family="Arial, sans-serif" font-size="96" font-weight="700">
    ${name}
  </text>
  <text x="120" y="380" fill="#334155" font-family="Arial, sans-serif" font-size="34">
    ${summary}
  </text>
  <text x="120" y="472" fill="#d01a1c" font-family="Arial, sans-serif" font-size="30">
    Status: ${status}
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

/**
 * @param {string} value
 */
function escapeSvg(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export const config = {
  path: '/request-time-javascript-pages/demo/open-graph/:componentName.svg',
  metadata: {
    title: 'Request-time Guide Open Graph SVG Demo',
    description: 'Generated SVG output from a server-rendered JavaScript Page.',
  },
  render: 'server',
  menu: false,
};
