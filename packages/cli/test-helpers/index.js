import chai from 'chai';
import { fileURLToPath } from 'url';
import path from 'path';
import { setupTestCli } from './test-helpers.js';

export function prepareTestCli(importMetaUrl) {
  const dir = path.dirname(fileURLToPath(importMetaUrl));
  return fullOptions => setupTestCli({ dir, ...fullOptions });
}

const { expect } = chai;

/**
 * @param {function} method
 * @param {string} errorMessage
 */
export async function expectThrowsAsync(method, { errorMatch, errorMessage } = {}) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (errorMatch) {
    expect(error.message).to.match(errorMatch);
  }
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}
