const components = new Map([
  [
    'button',
    {
      name: 'Button',
      status: 'stable',
      loading: 'server',
      summary: 'A link-style action for navigation and setup tasks.',
      examples: ['/examples/callout'],
    },
  ],
  [
    'callout',
    {
      name: 'Callout',
      status: 'stable',
      loading: 'server',
      summary: 'A short notice block for guidance, warnings, and success messages.',
      examples: ['/examples/callout'],
    },
  ],
  [
    'tabs',
    {
      name: 'Tabs',
      status: 'preview',
      loading: 'hydrate:onVisible',
      summary: 'A grouped panel interface that renders useful HTML before it becomes interactive.',
      examples: ['/component-loading'],
    },
  ],
]);

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { params }) => {
  const componentName = params.componentName || '';
  const component = components.get(componentName);

  if (!component) {
    return Response.json(
      {
        error: 'Component not found',
        componentName,
      },
      { status: 404 },
    );
  }

  return Response.json({
    slug: componentName,
    ...component,
  });
};

export const config = {
  path: '/examples/api/components/:componentName.json',
  metadata: {
    title: 'Component API',
    description:
      'Return JSON component records from a parameterized server-rendered JavaScript Page.',
  },
  render: 'server',
  menu: false,
};
