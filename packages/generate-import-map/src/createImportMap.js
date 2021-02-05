import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export const defaultRemoteUrl = 'https://cdn.skypack.dev/';
export const defaultImportMapDist = path.resolve('./import-map.json');

/**
 *
 * @param {string[]} bareSpecifiers
 * @param {string} remoteUrl
 */
export async function checkRemoteSpecifiers(bareSpecifiers, remoteUrl = defaultRemoteUrl) {
  /** @type {Promise<void>[]} */
  const promises = [];
  /** @type {string[]} */
  const result = [];
  bareSpecifiers.forEach(specifier => {
    const remoteSpecifier = `${remoteUrl}${specifier}`;
    const promise = fetch(remoteSpecifier).then(response => {
      if (response.ok) {
        result.push(specifier);
      }
    });
    promises.push(promise);
  });
  await Promise.all(promises);
  return result;
}

/**
 *
 * @param {string[]} bareSpecifiers
 * @param {string} remoteUrl
 * @param {string} importMapDist
 */
export function createImportMap(
  bareSpecifiers,
  remoteUrl = defaultRemoteUrl,
  importMapDist = defaultImportMapDist,
) {
  const imports = {};
  bareSpecifiers.forEach(specifier => {
    const remoteSpecifier = `${remoteUrl}${specifier}`;
    imports[specifier] = remoteSpecifier;
  });
  fs.writeFileSync(importMapDist, JSON.stringify({ imports }, null, 2));
}
