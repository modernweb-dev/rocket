export const componentCatalog = [
  {
    slug: 'button',
    name: 'Button',
    status: 'stable',
    summary: 'A link-style action for navigation and setup tasks.',
    variants: ['primary', 'secondary'],
  },
  {
    slug: 'callout',
    name: 'Callout',
    status: 'preview',
    summary: 'A short notice block for guidance, warnings, and success messages.',
    variants: ['info', 'warning', 'success'],
  },
];

/**
 * @param {string | undefined} slug
 */
export function findComponent(slug) {
  return componentCatalog.find(component => component.slug === slug);
}
