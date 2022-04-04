import fs from 'fs';
import path from 'path';
import { createRequire, builtinModules } from 'module';
import { parse } from './es-module-lexer.js';

/**
 * @param {string} specifier
 * @returns {boolean}
 */
export function isBareModuleSpecifier(specifier) {
  return !!specifier?.replace(/'/g, '')[0].match(/[@a-zA-Z]/g);
}

/**
 * @param {string} filePath
 * @param {{
 *  nodeModulesDepth?: number,
 *  source?: string,
 * }} options
 * @returns {Promise<string[]>}
 */
export async function findJsDependencies(filePath, options = {}) {
  const importsToScan = new Set();
  const dependencies = new Set();

  // const nodeModulesDepth = options?.nodeModulesDepth ?? 3;

  const source = options?.source ?? fs.readFileSync(filePath).toString();

  const [imports] = parse(source);

  const pathRequire = createRequire(path.resolve(filePath));

  for (const i of imports) {
    if (i && i.n) {
      /** Skip built-in modules like fs, path, etc */
      if (builtinModules.includes(i.n)) break;
      /** Skip import.meta */
      if (i.d === -2) break;

      try {
        const pathToDependency = pathRequire.resolve(i.n);

        importsToScan.add(pathToDependency);
        dependencies.add(pathToDependency);
      } catch (e) {
        // we do not throw here as we only use this function to enhance DX - the actual error will be thrown/shown by renderWorker
        // console.log(`Failed to resolve dependency "${i.n}" in "${filePath}"`);
        // console.log(e);
      }
    }
  }

  while (importsToScan.size) {
    importsToScan.forEach(dep => {
      importsToScan.delete(dep);

      const source = fs.readFileSync(dep).toString();
      const [imports] = parse(source);

      const depRequire = createRequire(dep);

      for (const i of imports) {
        if (i && i.n) {
          /** Skip built-in modules like fs, path, etc */
          if (builtinModules.includes(i.n)) break;
          /** Skip import.meta */
          if (i.d === -2) break;

          const fileToFind = isBareModuleSpecifier(i.n) ? i.n : path.join(path.dirname(dep), i.n);
          try {
            /**
             * First check in the dependencies' node_modules, then in the project's node_modules,
             * then up, and up, and up
             */
            const pathToDependency = depRequire.resolve(fileToFind);
            // console.log({ fileToFind, pathToDependency });
            /**
             * Don't add dependencies we've already scanned, also avoids circular dependencies
             * and multiple modules importing from the same module
             */
            if (!dependencies.has(pathToDependency)) {
              importsToScan.add(pathToDependency);
              dependencies.add(pathToDependency);
            }
          } catch (e) {
            // we do not throw here as we only use this function to enhance DX - the actual error will be thrown/shown by renderWorker
            // console.log(`Failed to resolve dependency "${i.n}" in "${dep}"`);
            // console.log(e);
          }
        }
      }
    });
  }

  return [...dependencies];
}
