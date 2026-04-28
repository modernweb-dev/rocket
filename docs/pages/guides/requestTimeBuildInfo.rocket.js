/** @type {import('@rocket/js/types.js').JsPage} */
export default async request => {
  const url = new URL(request.url);

  return {
    demo: 'static JavaScript Page',
    path: url.pathname,
    generatedAt: new Date().toISOString(),
    renderMode: 'static',
    note: 'rocket build captures this response as a static JSON file.',
  };
};

export const config = {
  path: '/request-time-javascript-pages/demo/build-info.json',
  metadata: {
    title: 'Request-time Guide Build Info Demo',
    description: 'Static JSON output generated from a concrete JavaScript Page path.',
  },
  menu: false,
};
