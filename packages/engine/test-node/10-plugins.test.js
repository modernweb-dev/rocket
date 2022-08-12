import chai from 'chai';
import { addPlugin } from 'plugins-manager';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Plugins', () => {
  it('01: add plugin with custom public files', async () => {
    class TestPlugin01 {
      static publicFolder = new URL(
        './fixtures/10-plugins/01-add-public-files/plugin-add-to-public/preset/__public',
        import.meta.url,
      ).pathname;
    }
    const { build, outputExists } = await setupTestEngine(
      'fixtures/10-plugins/01-add-public-files/docs',
      {
        setupPlugins: [addPlugin(TestPlugin01)],
      },
    );
    await build();

    expect(outputExists('added-via-plugin.txt')).to.be.true;
  });

  it('02: add plugin with custom public files', async () => {
    class TestPlugin02 {
      static publicFolder = new URL(
        './fixtures/10-plugins/02-input-folder-public-always-wins/plugin-add-to-public/preset/__public',
        import.meta.url,
      ).pathname;
    }
    const { build, readOutput } = await setupTestEngine(
      'fixtures/10-plugins/02-input-folder-public-always-wins/docs',
      {
        setupPlugins: [addPlugin(TestPlugin02)],
      },
    );
    await build();

    expect(readOutput('added-via-plugin-and-input-public.txt')).to.equal(
      'from input public folder\n',
    );
  });
});
