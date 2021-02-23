import chai from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createImportMapForLocalPackages } from '../src/createImportMapForLocalPackages.js';

const { expect } = chai;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('normalizeConfig', () => {
  it.only('makes sure essential settings are there', async () => {
    const importMap = await createImportMapForLocalPackages(['@rocket/launch']);

    expect(importMap).to.deep.equal({
      imports: {
        "@rocket/launch/inline-notification-element": "http://localhost:8000/__wds-outside-root__/1/packages/launch/inline-notification/inline-notification.js"
      }
    });
  });
});
