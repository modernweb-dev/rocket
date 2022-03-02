import chai from 'chai';
import { addPlugin } from 'plugins-manager';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

class MyPlugin {
  static publicFolder = new URL(
    './fixtures/10-plugins/01-add-public-files/plugin-add-to-public/preset/__public',
    import.meta.url,
  ).pathname;
}

describe('Plugins', () => {
  it('add plugin with custom public files', async () => {
    const { build, outputExists } = await setupTestEngine(
      'fixtures/10-plugins/01-add-public-files/docs',
      {
        setupPlugins: [addPlugin(MyPlugin)],
      },
    );
    await build();

    expect(outputExists('added-via-plugin.txt')).to.be.true;
  });
});
