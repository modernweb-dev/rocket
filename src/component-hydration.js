/**
 * @typedef {import('@rocket/js/types.js').Components} Components
 * @typedef {Record<string, CustomElementConstructor>} ComponentModule
 * @typedef {(file: string) => Promise<ComponentModule>} LoadComponentModule
 * @typedef {(file: string) => string} ResolveBrowserImport
 */

/**
 * @param {{
 *   customElementsRegistry?: CustomElementRegistry;
 *   loadComponentModule: LoadComponentModule;
 *   resolveBrowserImport: ResolveBrowserImport;
 *   hydrationLoaderSpecifier: string;
 * }} options
 * @returns {(components: Components) => Promise<string>}
 */
export function createComponentHydration({
  customElementsRegistry,
  loadComponentModule,
  resolveBrowserImport,
  hydrationLoaderSpecifier,
}) {
  return async function parseComponents(components) {
    const serverOnlyComponents = [];
    const clientComponents = [];
    const hydratedComponents = [];
    for (const [name, { file, className, loading }] of Object.entries(components)) {
      if (loading === 'server') {
        const module = await loadComponentModule(file);
        serverOnlyComponents.push({ name, file, className, module });
      } else if (loading === 'client') {
        clientComponents.push({ name, file, className });
      } else if (loading.startsWith('hydrate:')) {
        const module = await loadComponentModule(file);
        hydratedComponents.push({
          name,
          file,
          className,
          module,
          strategy: loading.slice('hydrate:'.length),
        });
      }
    }

    const registry = customElementsRegistry || customElements;
    registry.__definitions.clear();
    // @ts-ignore
    registry.__reverseDefinitions.clear();
    for (const component of serverOnlyComponents.concat(hydratedComponents)) {
      if (!component.module[component.className]) {
        throw new Error(
          `Component ${component.name} does not export a class named ${component.className}`,
        );
      }
      registry.define(component.name, component.module[component.className]);
    }

    let clientCode = clientComponents
      .map(
        component =>
          `import('${resolveBrowserImport(
            component.file,
          )}').then(module => customElements.get('${component.name}') || customElements.define('${
            component.name
          }', module.${component.className}));\n`,
      )
      .join('');
    if (hydratedComponents.length) {
      clientCode += [
        `import {HydrationLoader} from '${hydrationLoaderSpecifier}';`,
        'const hydratedComponents = {',
        ...hydratedComponents.map(
          component =>
            `'${component.name}': {getter: () => import('${resolveBrowserImport(
              component.file,
            )}').then(m => m.${component.className}),
        strategy: ${JSON.stringify(component.strategy)}},`,
        ),
        '};',
        'const hydrationLoader = new HydrationLoader(hydratedComponents);',
        'hydrationLoader.init();',
      ].join('\n');
    }
    return clientCode;
  };
}
