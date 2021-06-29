import { DevServerConfig } from '@web/dev-server';
import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';

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

type ImageFormat = 'avif' | 'webp' | 'jpg' | 'png' | 'svg';

interface ImagePreset {
  widths: number[];
  formats: ImageFormat[];
  sizes: string;
}

export interface RocketCliOptions {
  presets: Array<RocketPreset>;
  pathPrefix?: string;
  serviceWorkerName?: string;
  inputDir: string;
  outputDir: string;
  emptyOutputDir?: boolean;
  absoluteBaseUrl?: string;
  watch: boolean;
  createSocialMediaImages?: boolean;
  imagePresets: {
    [key: string]: ImagePreset;
  };

  checkLinks: Partial<CheckHtmlLinksCliOptions>;

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
