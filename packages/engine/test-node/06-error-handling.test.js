import chai from 'chai';
import { setupTestEngine, expectThrowsAsync } from './test-helpers.js';

const { expect } = chai;

describe('Engine error', () => {
  it('throws error on build', async () => {
    const { build, cleanup } = await setupTestEngine(
      'fixtures/06-error-handling/01-page-error/docs',
    );

    await expectThrowsAsync(
      async () => {
        await build();
      },
      {
        errorMessage: 'foo is not defined',
      },
    );

    await cleanup();
  });
});
