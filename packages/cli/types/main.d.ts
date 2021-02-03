import { DevServerConfig } from '@web/dev-server';

export interface RocketPreset {
  path: string;

  // TODO: improve all setup functions
  setupUnifiedPlugins?: function[];
  setupDevAndBuildPlugins: function[];
  setupBuildPlugins: function[];
  setupDevPlugins: function[];
  setupCliPlugins: function[];
  setupEleventyPlugins: function[];
  setupEleventyComputedConfig: function[];
}

interface RocketStartConfig {
  createSocialMediaImages?: boolean;
}

export interface RocketCliOptions {
  presets: Array<RocketPreset>;
  pathPrefix?: string;
  inputDir: string;
  outputDir: string;
  emptyOutputDir?: boolean;
  absoluteBaseUrl?: string;
  watch: boolean;
  createSocialMediaImages?: boolean;

  start?: RocketStartConfig;

  // TODO: improve all setup functions
  setupUnifiedPlugins?: function[];
  setupDevAndBuildPlugins: function[];
  setupBuildPlugins: function[];
  setupDevPlugins: function[];
  setupCliPlugins: function[];
  setupEleventyPlugins: function[];
  setupEleventyComputedConfig: function[];

  // advanced
  devServer: DevServerConfig;
  eleventy: function; // TODO: improve
  plugins: RocketPlugin[];

  // rarely used
  command: string;
  configFile?: string;
  outputDevDir: string;

  private _inputDirCwdRelative: string;
  private _presetPathes?: Array<string>;
}

export interface RocketPlugin {
  commands: Array<string>;
}
