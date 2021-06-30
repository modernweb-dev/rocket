import chai from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeConfig } from '../src/normalizeConfig.js';

const { expect } = chai;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cleanup(config) {
  const configNoPaths = { ...config };
  delete configNoPaths._inputDirCwdRelative;
  delete configNoPaths.configFile;
  delete configNoPaths._presetPathes;
  delete configNoPaths.eleventy;
  delete configNoPaths.outputDevDir;
  delete configNoPaths.imagePresets.responsive.ignore;
  return configNoPaths;
}

describe('normalizeConfig', () => {
  it('makes sure essential settings are there', async () => {
    const configFile = path.join(__dirname, 'fixtures', 'empty', 'rocket.config.js');
    const config = await normalizeConfig({ configFile });

    // testing pathes is always a little more complicted 😅
    expect(config._inputDirCwdRelative).to.match(/empty\/docs$/);
    expect(config._presetPathes[0]).to.match(/cli\/preset$/);
    expect(config._presetPathes[1]).to.match(/empty\/docs$/);
    expect(config.outputDevDir).to.match(/_site-dev$/);

    expect(cleanup(config)).to.deep.equal({
      command: 'help',
      createSocialMediaImages: true,
      devServer: {},
      build: {},
      watch: true,
      setupUnifiedPlugins: [],
      setupBuildPlugins: [],
      setupDevAndBuildPlugins: [],
      setupDevPlugins: [],
      setupEleventyPlugins: [],
      setupEleventyComputedConfig: [],
      setupCliPlugins: [],
      presets: [],
      serviceWorkerName: 'service-worker.js',
      plugins: [
        { commands: ['start'] },
        { commands: ['build'] },
        { commands: ['start', 'build', 'lint'] },
      ],
      imagePresets: {
        responsive: {
          formats: ['avif', 'jpeg'],
          sizes: '100vw',
          widths: [600, 900, 1640],
        },
      },
      inputDir: 'docs',
      outputDir: '_site',
    });
  });

  it('can override settings via parameters', async () => {
    const configFile = path.join(__dirname, 'fixtures', 'empty', 'rocket.config.js');
    const config = await normalizeConfig({
      configFile,
      devServer: {
        more: 'settings',
      },
    });

    expect(cleanup(config)).to.deep.equal({
      command: 'help',
      createSocialMediaImages: true,
      devServer: {
        more: 'settings',
      },
      build: {},
      watch: true,
      setupUnifiedPlugins: [],
      setupBuildPlugins: [],
      setupDevAndBuildPlugins: [],
      setupDevPlugins: [],
      setupEleventyPlugins: [],
      setupCliPlugins: [],
      setupEleventyComputedConfig: [],
      presets: [],
      imagePresets: {
        responsive: {
          formats: ['avif', 'jpeg'],
          sizes: '100vw',
          widths: [600, 900, 1640],
        },
      },
      serviceWorkerName: 'service-worker.js',
      plugins: [
        { commands: ['start'] },
        { commands: ['build'] },
        { commands: ['start', 'build', 'lint'] },
      ],
      inputDir: 'docs',
      outputDir: '_site',
    });
  });

  it('respects a rocket.config.js file', async () => {
    const configFile = path.join(__dirname, 'fixtures', 'overrides', 'rocket.config.js');
    const config = await normalizeConfig({
      configFile,
    });

    expect(cleanup(config)).to.deep.equal({
      command: 'help',
      createSocialMediaImages: true,
      devServer: {
        more: 'from-file',
      },
      build: {},
      watch: true,
      setupUnifiedPlugins: [],
      setupBuildPlugins: [],
      setupDevAndBuildPlugins: [],
      setupDevPlugins: [],
      setupEleventyPlugins: [],
      setupCliPlugins: [],
      setupEleventyComputedConfig: [],
      presets: [],
      imagePresets: {
        responsive: {
          formats: ['avif', 'jpeg'],
          sizes: '--override-sizes--',
          widths: [600, 900, 1640],
        },
      },
      serviceWorkerName: 'service-worker.js',
      plugins: [
        { commands: ['start'] },
        { commands: ['build'] },
        { commands: ['start', 'build', 'lint'] },
      ],
      inputDir: 'docs',
      outputDir: '_site',
    });
  });

  it('supports an eleventy config function in rocket.config.js', async () => {
    const configFile = path.join(
      __dirname,
      'fixtures',
      'override-eleventy-function',
      'rocket.config.js',
    );
    const config = await normalizeConfig({
      configFile,
    });

    expect(cleanup(config)).to.deep.equal({
      command: 'help',
      createSocialMediaImages: true,
      devServer: {},
      build: {},
      watch: true,
      setupUnifiedPlugins: [],
      setupBuildPlugins: [],
      setupDevAndBuildPlugins: [],
      setupDevPlugins: [],
      setupEleventyPlugins: [],
      setupCliPlugins: [],
      setupEleventyComputedConfig: [],
      presets: [],
      imagePresets: {
        responsive: {
          formats: ['avif', 'jpeg'],
          sizes: '100vw',
          widths: [600, 900, 1640],
        },
      },
      serviceWorkerName: 'service-worker.js',
      plugins: [
        { commands: ['start'] },
        { commands: ['build'] },
        { commands: ['start', 'build', 'lint'] },
      ],
      inputDir: 'docs',
      outputDir: '_site',
    });
  });
});
